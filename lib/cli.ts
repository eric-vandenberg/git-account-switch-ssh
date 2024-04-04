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

const { version } = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8'));

const on_cancel = async () => {
  cancel('Operation cancelled.');
  process.exit(0);
}

async function main() {
  intro(fromString(textSync('Git Account Switch SSH', {
    font: 'Small',
    whitespaceBreak: true
  })));
  console.log(`
    ${color.dim(`create-svelte version ${version}`)}
  `);

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

main().catch(console.error);
