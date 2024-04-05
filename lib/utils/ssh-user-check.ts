import { exec, ExecException } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);


export const ssh_user_check = async (accounts: { Host: string }[]): Promise<string[]> => {
  const users = [];

  for (const account of accounts) {
    try {
      await execAsync(`ssh -T git@${account.Host}`);
    } catch (err: unknown) {
      if (err) {
        const execErr = err as ExecException;
        // Hi username! You've successfully authenticated, but GitHub does not provide shell access.
        const regex = /Hi (.*?)\!/sm

        const username_match = execErr.stderr?.match(regex);
        const username = username_match ? username_match[1] : undefined;

        if (username) {
          users.push(username);
        }
      }
    }
  }

  return users;
}

