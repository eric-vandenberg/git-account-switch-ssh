import { execSync } from 'node:child_process';

import { gas_cache_check } from './gas-cache-check.js';
import { ssh_config_check } from './ssh-config-check.js';
import { IEntry } from '../types/entry.js';

export const git_config_set = async (username: string) => {
  try {
    const cache = await gas_cache_check();
    const { accounts } = await ssh_config_check();

    const record = cache.find((entry: { username: string; name: string; email: string; }) => entry.username === username);
    const section = accounts.find((account: Record<string, string | string[]> | undefined) => account?.User === username);

    if (record) {
      execSync(`git config user.name ${record.name}`, { stdio: [] });
      execSync(`git config user.email ${record.email}`, { stdio: [] });
    }

    if (section) {
      execSync(`git config core.sshCommand "ssh -i ${section.IdentityFile[0]} -F /dev/null"`)
    }
  } catch (err: unknown) {

  }
}
