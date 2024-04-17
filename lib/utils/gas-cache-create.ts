import { accessSync, readFileSync, writeFileSync, constants } from 'node:fs';
import os from 'node:os';

import { ICache } from '../types/cache.js';

export const gas_cache_create = async (data: ICache) => {
  const home = os.homedir();

  try {
    accessSync(`${home}/.gascache.json`, constants.R_OK | constants.W_OK);

    const file = readFileSync(`${home}/.gascache.json`, { encoding: 'utf-8' });

    const cache: ICache[] = JSON.parse(file);

    cache.push(data);

    writeFileSync(`${home}/.gascache.json`, JSON.stringify(cache), { encoding: 'utf-8' });
  } catch (error: unknown) {
    const new_cache: ICache[] = [];

    new_cache.push(data);

    writeFileSync(`${home}/.gascache.json`, JSON.stringify(new_cache), { encoding: 'utf-8' });
  }
}
