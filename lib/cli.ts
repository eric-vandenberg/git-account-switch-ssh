#!/usr/bin/env ts-node

import { program } from "commander";
import { Chalk } from "chalk";
import figlet from "figlet";
import lolcatjs from 'lolcatjs';
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import inquirer from "inquirer";
import { exec } from "node:child_process";

import { sshUserLink } from './ssh-user-link.js';

lolcatjs.fromString(figlet.textSync('Git Account Switch SSH', {
  font: 'Small',
  whitespaceBreak: true
}));

program
  .version("0.0.1")
  .description("CLI for switching github accounts")
  .option("-s, --switch", "switch github account")
  .option("-l, --link", "link git ssh account")
  .option("-a, --add", "add new github account")
  .option("-c, --check", "check for current github account")
  .parse(process.argv);

const options = program.opts();

if (options.link) {
  (async function () {
    try {
      await sshUserLink(options);
      console.log(`successfully deleted ${path}`);
    } catch (error: unknown) {
      console.error('there was an error:', (error as Error).message);
    }
  })();
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}


// console.log(currentPath);
// exec(`cd && cat .ssh/config`, (err, stdout, stderr) => {
//   if (err) {
//     console.error(err);

//     return;
//   }

//   console.log(stdout);
// });
