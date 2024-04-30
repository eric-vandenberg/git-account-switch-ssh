import { homedir } from 'node:os';
import { stat } from 'node:fs/promises';
import { accessSync, readFileSync, constants, writeFileSync } from 'node:fs';

export const ssh_config_backup = async (): Promise<void> => {
  try {
    const home = homedir();
    accessSync(`${home}/.ssh/config`, constants.R_OK | constants.W_OK);

    const backup_exists = await stat(`${home}/.ssh/config_backup`)
      .then(() => true)
      .catch(() => false);

    if (!backup_exists) {
      const file = readFileSync(`${home}/.ssh/config`, { encoding: 'utf-8' });

      writeFileSync(`${home}/.ssh/config_backup`, file);
    }
  } catch (error: unknown) {}
};
