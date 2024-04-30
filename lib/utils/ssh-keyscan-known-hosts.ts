import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { HOSTS } from '../consts/hosts.js';
import { TGithub, TGitlab } from '../types/symbols.js';

export const ssh_keyscan_known_hosts = async (
  host: TGithub | TGitlab
): Promise<void> => {
  try {
    const home = homedir();
    const known_hosts_abs_path = `${home}/.ssh/known_hosts`;

    if (existsSync(known_hosts_abs_path)) {
      execSync(
        `ssh-keyscan ${HOSTS[host]['site']} >> ${known_hosts_abs_path}`,
        { stdio: [] }
      );
    }
  } catch (error: unknown) {}
};
