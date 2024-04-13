import os from 'node:os';
import { execSync } from 'node:child_process';

export const ssh_config_restore = async () => {
  try {
    const home = os.homedir();

    execSync(`mv ${home}/.ssh/config_backup ${home}/.ssh/config`);
  } catch (err: unknown) {
    //
  }
}
