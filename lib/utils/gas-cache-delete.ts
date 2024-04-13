import os from 'node:os';
import { unlinkSync } from 'node:fs';

export const gas_cache_delete = async () => {
  try {
    const home = os.homedir();
    unlinkSync(`${home}/.gascache.json`);
  } catch (err: unknown) {
    //
  }
}
