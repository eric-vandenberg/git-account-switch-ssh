#!/usr/bin/env node

import { intro, text, isCancel, cancel, spinner, outro } from '@clack/prompts';
import gradient from 'gradient-string';
import chalk from 'chalk';

import { version, homepage } from '../package.json';
import { IEntry } from './types/entry.js';
import { IGitConfig } from './types/gitconfig.js';
import { title, color_scheme } from './consts/banner.js';
import { restore } from './restore.js';
import { ssh_user_link } from './ssh-user-link.js';
import { clone_repo_user_link } from './clone-repo-user-link.js';
import { os_check } from './utils/os-check.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { ssh_keys_check } from './utils/ssh-keys-check.js';
import { git_repo_check } from './utils/git-repo-check.js';
import { git_user_check } from './utils/git-user-check.js';
import { ssh_config_backup } from './utils/ssh-config-backup.js';
import { ssh_user_check } from './utils/ssh-user-check.js';

interface IPrechecks {
  accounts: IEntry[];
  keys: string[];
  gitrepo: string;
  gitconfig: IGitConfig;
}

const banner = async () => {
  const gasGradient = gradient(Object.values(color_scheme));
  console.log(gasGradient.multiline(title) + '\n');
  console.log('     ' + gradient.cristal.multiline(version) + '\n\n');
};

const init = async () => {
  const unix = await os_check();

  if (!unix) {
    console.log(
      `MacOS support only. 🙏 see ${chalk.blue.underline(
        homepage
      )} to contribute.`
    );

    return process.exit(0);
  }

  const accounts = await ssh_config_check();
  const keys = await ssh_keys_check();
  const gitrepo = await git_repo_check();
  const gitconfig = await git_user_check(gitrepo);

  await ssh_config_backup();

  return {
    accounts,
    keys,
    gitrepo,
    gitconfig,
  };
};

const main = async ({ accounts, keys, gitrepo, gitconfig }: IPrechecks) => {
  let linked_user;
  let project: string = '';
  const is_restore = process.argv?.[2] === 'restore';
  const is_repo = gitrepo.length > 1;
  const spin = spinner();

  intro(
    is_restore
      ? 'Restoring SSH configurations'
      : is_repo
      ? 'Link SSH to this repository'
      : 'Clone a new repository and link SSH'
  );

  spin.start('Checking for git accounts with SSH access');

  const users: IEntry[] = await ssh_user_check(accounts);

  spin.stop(
    users.length
      ? `Found ${users.length} account${users.length > 1 ? 's' : ''}!`
      : "No accounts have SSH access. Let's set one up!"
  );

  if (is_restore) {
    await restore(users);

    outro('Restore complete!');

    return process.exit(0);
  }

  if (is_repo) {
    project = gitrepo.split('/').pop() ?? '';

    linked_user = await ssh_user_link({
      project,
      users,
      gitconfig: gitconfig,
    });
  } else {
    const repository = await text({
      message: 'Clone which repository?',
      placeholder: 'git@git{hub|lab}.com:organization/repository.git',
    });

    if (isCancel(repository)) {
      cancel('Operation cancelled');
      return process.exit(0);
    }

    project = repository.toString().split('/').pop()?.replace('.git', '') ?? '';

    linked_user = await ssh_user_link({
      project,
      users,
      gitconfig: gitconfig,
    });

    await clone_repo_user_link({
      repository: repository.toString(),
      project,
      username: linked_user,
    });
  }

  outro(
    `User ${chalk
      .hex(color_scheme.green)
      .bold(linked_user)} is all setup for repository ${chalk
      .hex(color_scheme.red)
      .bold(project)}`
  );
};

banner().then(() =>
  init().then((prechecks) => main(prechecks).catch(console.error))
);
