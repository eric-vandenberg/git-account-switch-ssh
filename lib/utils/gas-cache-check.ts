import { accessSync, readFileSync, constants } from 'node:fs';
import os from 'node:os';

import { ICache } from '../types/cache.js';

export const gas_cache_check = async (): Promise<ICache[]> => {
  try {
    const home = os.homedir();
    accessSync(`${home}/.gascache.json`, constants.R_OK | constants.W_OK);

    const file = readFileSync(`${home}/.gascache.json`, { encoding: 'utf-8' });

    const cache = JSON.parse(file);

    return cache;
  } catch (error: unknown) {
    return []
  }
}
