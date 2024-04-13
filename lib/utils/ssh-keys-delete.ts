import { unlinkSync } from 'node:fs';

import { IEntry } from '../types/entry.js';
import { ssh_config_backup_check } from './ssh-config-backup-check.js';

export const ssh_keys_delete = async (users: IEntry[]) => {
  try {
    const backup_users = await ssh_config_backup_check();
    const initializer: string[] = [];
    const backup_keys = backup_users.reduce((accm: string[], user: IEntry) => {
      let accumulate = accm;

      if (user.IdentityFile?.length) {
        accumulate = [...accumulate, ...user.IdentityFile]
      }

      return accumulate;
    }, initializer);

    for (const user of users) {
      if (user.IdentityFile?.[0]! && !backup_keys.includes(user.IdentityFile[0])) {
        unlinkSync(`${user.IdentityFile[0]}`);
      }
    }
  } catch (err: unknown) {
    //
  }
}
