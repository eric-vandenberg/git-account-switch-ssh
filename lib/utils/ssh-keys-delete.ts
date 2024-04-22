import os from 'node:os';
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';

import { IEntry } from '../types/entry.js';
import { ssh_config_backup_check } from './ssh-config-backup-check.js';

export const ssh_keys_delete = async (users: IEntry[]): Promise<string[]> => {
  try {
    const backup_users = await ssh_config_backup_check();
    const result: string[] = [];
    const initializer: string[] = [];
    const backup_keys = backup_users.reduce((accm: string[], user: IEntry) => {
      let accumulate = accm;

      if (user.IdentityFile?.length) {
        accumulate = [...accumulate, ...user.IdentityFile]
      }

      return accumulate;
    }, initializer);

    for (const user of users) {
      const key_path = user.IdentityFile?.[0];
      const nonoriginal_key = key_path ? !backup_keys.includes(key_path) : false;

      if (!!key_path && nonoriginal_key) {
        const home = os.homedir();
        const filename = key_path.split('/').pop();
        const key_abs_path = `${home}/.ssh/${filename}`;
        const public_key_abs_path = `${key_abs_path}.pub`;

        if (existsSync(key_abs_path) && existsSync(public_key_abs_path)) {
          result.push(key_abs_path);
          result.push(public_key_abs_path);

          execSync(`ssh-add -d ${public_key_abs_path}`, { stdio: [] });

          unlinkSync(key_abs_path);
          unlinkSync(public_key_abs_path);
        }
      }
    }

    return result;
  } catch (error: unknown) {
    return [];
  }
}
