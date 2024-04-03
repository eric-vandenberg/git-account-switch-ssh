import { access, readFile, constants } from 'node:fs/promises';
import os from 'node:os';
import { parse, Directive } from "ssh-config";
import inquirer from "inquirer";

export async function sshConfigCheck() {
  try {
    const home = os.homedir();
    const accessible = await access(`${home}/.ssh/config`, constants.R_OK | constants.W_OK);
    const file = await readFile(`${home}/.ssh/config`, { encoding: 'utf8' })

    const config = parse(file);

    const accounts = config.map((account: any) => {
      const host = (account as Directive).value;

      if (host) {
        const compute = config.compute('github.com');

        console.log('~~~~~~~~~~~~~');
        console.log((account as Directive).value)
        console.log('~~~~~~~~~~~~~');
        console.log(JSON.stringify(config, null, 2));
        console.log('~~~~~~~~~~~~~');
        console.log(compute);
        console.log('~~~~~~~~~~~~~');

        return host;
      }
    });

    inquirer.prompt([{ type: 'list', name: 'account(s)', message: `Which account would you like to set for this repo?`, choices: [...accounts, 'Or, setup a new account with SSH'] }])
  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}
