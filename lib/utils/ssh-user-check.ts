import { exec, ExecException } from 'node:child_process';
import { promisify } from 'node:util';

import { IEntry } from '../types/entry.js';

const execAsync = promisify(exec);

export const ssh_user_check = async (accounts: IEntry[]): Promise<IEntry[]> => {
  const users = [];

  for (const account of accounts) {
    const entry: IEntry = account;

    try {
      await execAsync(`ssh -T git@${account.Host}`);
    } catch (error: unknown) {
      if (error) {
        const execErr = error as ExecException;
        // Hi username! You've successfully authenticated, but GitHub does not provide shell access.
        const regex = /Hi\s(.*?)\!/sm;

        const username_match = execErr.stderr?.match(regex);
        const username = username_match ? username_match[1] : undefined;

        if (username) {
          entry.User = username;
          entry.HostName = 'github.com';
        }
      }
    }

    users.push(entry);
  }

  return users;
}

