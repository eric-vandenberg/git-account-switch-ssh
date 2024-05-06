import { homedir } from 'node:os';
import { writeFileSync } from 'node:fs';
import SSHConfig from 'ssh-config';

import { IEntry } from '../types/entry.js';

export const ssh_config_overwrite = async (
  users: IEntry[],
  new_entry?: Record<string, string | string[]>
) => {
  try {
    const home = homedir();
    const config = new SSHConfig();

    users.forEach((u: IEntry) => {
      config.append({
        ...u,
      });
    });

    if (!!new_entry) {
      config.append(new_entry);
    }

    writeFileSync(`${home}/.ssh/config`, SSHConfig.stringify(config), {
      encoding: 'utf-8',
    });
  } catch (error: unknown) {}
};
