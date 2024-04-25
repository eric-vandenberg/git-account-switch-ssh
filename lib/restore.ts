import { log } from '@clack/prompts';

import { IEntry } from './types/entry.js';
import { ssh_keys_delete } from './utils/ssh-keys-delete.js';
import { ssh_config_restore } from './utils/ssh-config-restore.js';
import { gas_cache_delete } from './utils/gas-cache-delete.js';

export const restore = async (users: IEntry[]) => {
  try {
    const deleted_keys = await ssh_keys_delete(users);
    const restored_config = await ssh_config_restore();
    await gas_cache_delete();

    log.step(`Removing keys:\n\n${deleted_keys.join('\n')}`);

    log.step(`Restoring ssh config:\n\n${restored_config}`);
  } catch (error: unknown) {}
};
