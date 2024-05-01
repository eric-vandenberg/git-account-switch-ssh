import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const os_check = async (): Promise<boolean> => {
  try {
    const unix = await execAsync('uname -s')
      .then(({ stdout }) => stdout.includes('Darwin'))
      .catch(() => false);

    return unix;
  } catch (error: unknown) {
    return false;
  }
};
