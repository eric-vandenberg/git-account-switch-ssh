import { promisify } from 'node:util';
import { exec, ExecException } from 'node:child_process';

import { IEntry } from '../types/entry.js';
import { HOSTS } from '../consts/hosts.js';
import { GITHUB, GITLAB } from '../types/symbols.js';

const execAsync = promisify(exec);

export const ssh_user_check = async (accounts: IEntry[]): Promise<IEntry[]> => {
  const users = [];

  for (const account of accounts) {
    const entry: IEntry = account;

    try {
      const { stdout } = await execAsync(`ssh -T git@${account.Host}`);

      if (stdout) {
        // Welcome to GitLab, @username!
        const regex = /@(.*?)\!/ms;
        const username_match = stdout.match(regex);
        const username = username_match ? username_match[1] : undefined;

        if (username) {
          entry.User = username;
          entry.HostName = HOSTS[GITLAB]['site'];
        }
      }
    } catch (error: unknown) {
      if (error) {
        const execErr = error as ExecException;
        // Hi username! You've successfully authenticated, but GitHub does not provide shell access.
        const regex = /Hi\s(.*?)\!/ms;

        const username_match = execErr.stderr?.match(regex);
        const username = username_match ? username_match[1] : undefined;

        if (username) {
          entry.User = username;
          entry.HostName = HOSTS[GITHUB]['site'];
        }
      }
    }

    users.push(entry);
  }

  return users;
};
