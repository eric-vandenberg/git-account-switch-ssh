import { homedir } from 'node:os';
import { existsSync, unlinkSync } from 'node:fs';

export const gas_cache_delete = async () => {
  try {
    const home = homedir();
    const cache_path = `${home}/.gascache.json`;

    if (existsSync(cache_path)) {
      unlinkSync(cache_path);
    }
  } catch (error: unknown) {}
};
