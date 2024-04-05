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
import { ssh_user_check } from './utils/ssh-user-check.js';

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

  // console.log('accounts : ', accounts);
  // console.log('keys : ', keys);
  // console.log('gitrepo : ', gitrepo);
  // console.log('gitconfig : ', gitconfig);

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
  keys: any;
  gitrepo: any;
  gitconfig: any;
}) => {
  intro('Welcome!');

  console.log('prechecks : ', prechecks);

  const s = spinner();
  s.start('Checking for existing SSH users');

  const users = await ssh_user_check(prechecks.accounts);

  s.stop(users.length ? `User ${users[0]} found!` : 'No users found. Let\'s set one up!');

  const name = await text({
    message: 'What is your name?',
    placeholder: 'Anonymous',
  });

  if (isCancel(name)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const shouldContinue = await confirm({
    message: 'Do you want to continue?',
  });

  if (isCancel(shouldContinue)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const projectType = await select({
    message: 'Pick a project type.',
    options: [
      { value: 'ts', label: 'TypeScript' },
      { value: 'js', label: 'JavaScript' },
      { value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
    ],
  });

  if (isCancel(projectType)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  s.start('Installing via npm');

  await sleep(3000);

  s.stop('Installed via npm');

  const dood = 'eric'
  const repo = 'fun tings'

  outro(`User ${dood} is all setup for repo ${repo}`);
}

banner().then(() => init().then((prechecks) => main(prechecks).catch(console.error)));
