#!/usr/bin/env node

import { intro, text, isCancel, cancel, spinner, outro, log } from '@clack/prompts';
import { textSync } from "figlet";
import { fromString } from 'lolcatjs';
import { setTimeout as sleep } from 'node:timers/promises';
import color from 'picocolors';

import { version } from '../package.json';
import { ssh_user_link } from './ssh-user-link.js';
import { clone_repo_user_link } from './clone-repo-user-link.js';
import { IEntry } from './types/entry.js';
import { git_repo_check } from './utils/git-repo-check.js';
import { ssh_config_backup } from './utils/ssh-config-backup.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { ssh_keys_check } from './utils/ssh-keys-check.js';
import { git_user_check } from './utils/git-user-check.js';
import { ssh_user_check } from './utils/ssh-user-check.js';
import { gas_cache_delete } from './utils/gas-cache-delete.js';
import { ssh_keys_delete } from './utils/ssh-keys-delete.js';
import { ssh_config_restore } from './utils/ssh-config-restore.js';

const banner = async () => {
  fromString(textSync('Git Account Switch SSH', {
    font: 'Small',
    whitespaceBreak: true
  }))

  console.log(`
    ${color.dim(`version ${version}`)}
  `);
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
  intro('Welcome!');

  console.log('process.argv : ', process.argv);

  const s = spinner();

  s.start('Checking for existing SSH users');

  const users: IEntry[] = await ssh_user_check(prechecks.accounts);

  s.stop(users.length ? `Found ${users.length} users!` : 'No users found. Let\'s set one up!');

  // restore ssh configuration to original
  if (process.argv?.[2] === 'restore') {
    // const deleted_keys = await ssh_keys_delete(users);
    const restored_config = await ssh_config_restore();
    await gas_cache_delete();

    // log.step(`Removing keys: ${deleted_keys}`);

    log.step(`Restoring ssh config:\n\n${restored_config}`);

    outro('Restored!');

    return process.exit(0);
  }

  // link a ssh user to an existing git repo
  if (prechecks.gitrepo.length > 1) {
    project = prechecks.gitrepo.split('/').pop() ?? '';

    linked_user = await ssh_user_link({ project, users, gitconfig: prechecks.gitconfig });
  }

  // clone a new repo with a specified ssh user
  if (prechecks.gitrepo.length === 1) {
    const repository = await text({
      message: 'Clone which repository?',
      placeholder: 'e.g. git@github.com:organization/repository.git',
    });

    if (isCancel(repository)) {
      cancel('Operation cancelled');
      return process.exit(0);
    }

    project = repository.toString().split('/').pop()?.replace('.git', '') ?? '';

    linked_user = await ssh_user_link({ project, users, gitconfig: prechecks.gitconfig });

    await clone_repo_user_link(repository.toString(), project, linked_user);
  }

  outro(`User ${linked_user} is all setup for repo ${project}`);
}

banner().then(() => init().then((prechecks) => main(prechecks).catch(console.error)));
