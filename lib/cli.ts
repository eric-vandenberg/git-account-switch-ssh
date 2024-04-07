#!/usr/bin/env node

import { intro, text, isCancel, confirm, cancel, select, spinner, outro } from '@clack/prompts';
import { textSync } from "figlet";
import { fromString } from 'lolcatjs';
import { setTimeout as sleep } from 'node:timers/promises';
import color from 'picocolors';
import { version } from '../package.json';

import { git_repo_check } from './utils/git-repo-check.js';
import { ssh_config_backup } from './utils/ssh-config-backup.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { ssh_keys_check } from './utils/ssh-keys-check.js';
import { git_user_check } from './utils/git-user-check.js';
import { IEntry, ssh_user_check } from './utils/ssh-user-check.js';

import { ssh_user_link } from './ssh-user-link.js';

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
  accounts: any;
  keys: string[];
  gitrepo: string;
  gitconfig: { global: { email?: string; user?: string; }, local: { email?: string; user?: string; } };
}) => {
  let linked_user;
  let project;
  intro('Welcome!');

  console.log('prechecks : ', prechecks);

  const s = spinner();
  s.start('Checking for existing SSH users');

  const users: IEntry[] = await ssh_user_check(prechecks.accounts);

  s.stop(users.length ? `Found ${users.length} users!` : 'No users found. Let\'s set one up!');

  // link a ssh user to an existing git repo
  if (prechecks.gitrepo.length > 1) {
    project = prechecks.gitrepo.split('/').pop() ?? '';

    linked_user = await ssh_user_link(project, users);
  }

  // clone a new repo with a specified ssh user
  if (prechecks.gitrepo.length === 1) {
    const name = await text({
      message: 'What is the repo url you want to clone?',
      placeholder: 'e.g. git@github.com:eric-vandenberg/git-account-switch-ssh.git',
    });

    if (isCancel(name)) {
      cancel('Operation cancelled');
      return process.exit(0);
    }

    project = name.split('/').pop()?.replace('.git', '') ?? '';

    linked_user = await ssh_user_link(project, users);
  }

  outro(`User ${linked_user} is all setup for repo ${project}`);
}

banner().then(() => init().then((prechecks) => main(prechecks).catch(console.error)));
