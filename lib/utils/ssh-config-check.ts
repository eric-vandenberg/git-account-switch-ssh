import { accessSync, readFileSync, constants } from 'node:fs';
import os from 'node:os';
import { parse, Directive } from "ssh-config";

export const ssh_config_check = async () => {
  try {
    const home = os.homedir();
    accessSync(`${home}/.ssh/config`, constants.R_OK | constants.W_OK);

    const file = readFileSync(`${home}/.ssh/config`, { encoding: 'utf8' })

    const config = parse(file);

    const accounts = config.map((account: any) => {
      const host = (account as Directive).value as string;

      if (host) {
        const compute = config.compute(host);

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
  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}
