import os from 'node:os';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const ssh_config_restore = async (): Promise<string | undefined> => {
  try {
    const home = os.homedir();

    execSync(`mv ${home}/.ssh/config_backup ${home}/.ssh/config`);

    const restored_config = readFileSync(`${home}/.ssh/config`, { encoding: 'utf-8' });

    return restored_config;
  } catch (err: unknown) {
    //
  }
}
