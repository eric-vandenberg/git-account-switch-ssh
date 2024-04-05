import { accessSync, readFileSync, constants } from 'node:fs';
import os from 'node:os';
import { parse, Directive } from "ssh-config";

export const ssh_config_check = async (): Promise<(Record<string, string | string[]> | undefined)[]> => {
  try {
    const home = os.homedir();
    accessSync(`${home}/.ssh/config`, constants.R_OK | constants.W_OK);

    const file = readFileSync(`${home}/.ssh/config`, { encoding: 'utf-8' })

    const config = parse(file);

    const accounts = [...config].map((account: any) => {
      const host = (account as Directive).value as string;

      if (host) {
        const compute = config.compute(host);

        return compute;
      }
    });

    return accounts;
  } catch (error) {
    return [];
  }
}
