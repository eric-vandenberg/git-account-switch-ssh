import { accessSync, readFileSync, constants, writeFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import os from 'node:os';

export const ssh_config_backup = async (): Promise<void> => {
  try {
    const home = os.homedir();
    accessSync(`${home}/.ssh/config`, constants.R_OK | constants.W_OK);

    const backup_exists = await stat(`${home}/.ssh/config_backup`)
      .then(() => true)
      .catch(() => false);

    if (!backup_exists) {
      const file = readFileSync(`${home}/.ssh/config`, { encoding: 'utf-8' });

      console.log('backed up');

      writeFileSync(`${home}/.ssh/config_backup`, file);
    }
  } catch (err: unknown) {
    //
  }
}
