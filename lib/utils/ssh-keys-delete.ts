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

    console.log('backup_keys : ', backup_keys);

    for (const user of users) {
      const key_path = user.IdentityFile?.[0];
      const nonoriginal_key = key_path ? !backup_keys.includes(key_path) : false;

      if (!!key_path && nonoriginal_key) {
        const public_key_path = `${key_path}.pub`;

        if (existsSync(key_path) && existsSync(public_key_path)) {
          result.push(key_path);
          result.push(public_key_path);

          unlinkSync(key_path);
          unlinkSync(public_key_path);
        }
      }
    }

    return result;
  } catch (err: unknown) {
    console.log('err: ', err);
    return [];
  }
}
