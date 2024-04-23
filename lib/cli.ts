#!/usr/bin/env node

import { intro, text, isCancel, cancel, spinner, outro } from '@clack/prompts';
import gradient from 'gradient-string';
import chalk from 'chalk';

import { version } from '../package.json';
import { IEntry } from './types/entry.js';
import { title, color_scheme } from './consts/banner.js';
import { restore } from './restore.js';
import { ssh_user_link } from './ssh-user-link.js';
import { clone_repo_user_link } from './clone-repo-user-link.js';
import { git_repo_check } from './utils/git-repo-check.js';
import { ssh_config_backup } from './utils/ssh-config-backup.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { ssh_keys_check } from './utils/ssh-keys-check.js';
import { git_user_check } from './utils/git-user-check.js';
import { ssh_user_check } from './utils/ssh-user-check.js';

const banner = async () => {
  const gasGradient = gradient(Object.values(color_scheme));
  console.log(gasGradient.multiline(title) + '\n');
  console.log('     ' + gradient.cristal.multiline(version) + '\n\n');
}

const init = async () => {
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
  }
}

const main = async (prechecks: {
  accounts: IEntry[];
  keys: string[];
  gitrepo: string;
  gitconfig: { global: { email?: string; user?: string; }, local: { email?: string; user?: string; } };
}) => {
  let linked_user;
  let project: string = '';
  const is_repo = prechecks.gitrepo.length > 1;
  const s = spinner();

  intro(is_repo ? 'Link an ssh user to this repository' : 'Clone a new repository and link an ssh user');

  s.start('Checking for existing ssh users');

  const users: IEntry[] = await ssh_user_check(prechecks.accounts);

  s.stop(users.length ? `Found ${users.length} user${users.length > 1 ? 's' : ''}!` : 'No users found. Let\'s set one up!');

  // restore ssh configuration to original
  if (process.argv?.[2] === 'restore') {
    await restore(users);

    outro('Restored!');

    return process.exit(0);
  }

  // link a ssh user to an existing git repo
  if (is_repo) {
    project = prechecks.gitrepo.split('/').pop() ?? '';

    linked_user = await ssh_user_link({ project, users, gitconfig: prechecks.gitconfig });
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

    linked_user = await ssh_user_link({ project, users, gitconfig: prechecks.gitconfig });

    await clone_repo_user_link(repository.toString(), project, linked_user);
  }

  outro(`User ${chalk.hex(color_scheme.green).bold(linked_user)} is all setup for repo ${chalk.hex(color_scheme.red).bold(project)}`);
}

banner().then(() => init().then((prechecks) => main(prechecks).catch(console.error)));
