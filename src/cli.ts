#!/usr/bin/env node

import { program } from "commander";
import { Chalk } from "chalk";
import figlet from "figlet";
import lolcatjs from 'lolcatjs';
import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";

lolcatjs.fromString(figlet.textSync('Git Account Switch SSH', {
  font: 'Small',
  whitespaceBreak: true
}));

program
  .version("0.0.1")
  .description("CLI for switching github accounts")
  .option("-s, --switch", "switch github account")
  .option("-a, --add", "add new github account")
  .option("-c, --check", "check for current github account")
  .parse(process.argv);

const options = program.opts();

async function findExistingAccount(currentPath: string) {
  try {
    console.log(currentPath);
    exec(`cd && cat .ssh/config`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);

        return;
      }

      console.log(stdout);
    });
  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}

if (options.check) {
  const currentPath = process.cwd();
  findExistingAccount(currentPath);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
