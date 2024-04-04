#!/usr/bin/env node

import { intro, text, isCancel, confirm, cancel, select, spinner, outro } from '@clack/prompts';
import { textSync } from "figlet";
import { fromString } from 'lolcatjs';
import color from 'picocolors';
import { setTimeout as sleep } from 'node:timers/promises';
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { exec } from "node:child_process";

import { git_repo_check } from './utils/git-repo-check.js';
import { ssh_user_link } from './ssh-user-link.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { ssh_keys_check } from './utils/ssh-keys-check.js';
import { git_user_check } from './utils/git-user-check.js';

const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

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

  console.log('accounts : ', accounts);
  console.log('keys : ', keys);
  console.log('gitrepo : ', gitrepo);
  console.log('gitconfig : ', gitconfig);
}

const main = async () => {
  intro('Welcome!');

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

  const s = spinner();
  s.start('Installing via npm');

  await sleep(3000);

  s.stop('Installed via npm');

  const dood = 'eric'
  const repo = 'fun tings'

  outro(`User ${dood} is all setup for repo ${repo}`);
}

banner().then(() => init().then(() => main().catch(console.error)));
