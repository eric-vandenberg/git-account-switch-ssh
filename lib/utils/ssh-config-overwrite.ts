import os from 'node:os';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import SSHConfig from 'ssh-config';

import { IEntry } from '../types/entry.js';

export const ssh_config_overwrite = async (users: IEntry[], addl?: Record<string, string | string[]>) => {
  try {
    const home = os.homedir();

    const config = new SSHConfig();

    users.forEach((u: IEntry) => {
      config.append({
        ...u,
      });
    })

    if (!!addl && addl.IdentityFile?.[0]) {
      config.append(addl);

      execSync(`ssh-add ${addl.IdentityFile[0]}`, { stdio: [] });
    }

    writeFileSync(`${home}/.ssh/config`, SSHConfig.stringify(config), { encoding: 'utf-8' });
  } catch (err: unknown) {
    // 
  }
}
