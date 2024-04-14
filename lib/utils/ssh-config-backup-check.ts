import { accessSync, readFileSync, constants } from 'node:fs';
import os from 'node:os';
import { parse, Directive } from "ssh-config";

import { IEntry } from '../types/entry.js';

export const ssh_config_backup_check = async (): Promise<IEntry[]> => {
  try {
    const home = os.homedir();
    accessSync(`${home}/.ssh/config_backup`, constants.R_OK | constants.W_OK);

    const file = readFileSync(`${home}/.ssh/config_backup`, { encoding: 'utf-8' });

    const config = parse(file);

    const accounts: IEntry[] = [];

    for (const account of config) {
      const host = (account as Directive).value as string;

      if (host) {
        const compute = config.compute(host) as unknown as IEntry;

        if (compute.Host) {
          accounts.push(compute);
        }
      }
    }

    return accounts;
  } catch (error) {
    return [];
  }
}