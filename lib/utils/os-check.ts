import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const os_check = async (): Promise<string | undefined> => {
  try {
    const { stdout } = await execAsync('uname -s');

    return stdout;
  } catch (error: unknown) {}
};
