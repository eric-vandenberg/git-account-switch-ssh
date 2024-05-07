import { execSync } from 'node:child_process';
import { cancel, confirm, isCancel, note } from '@clack/prompts';
import chalk from 'chalk';

import { HOSTS } from '../consts/hosts.js';
import { TGithub, TGitlab } from '../types/symbols.js';
import { ssh_keyscan_known_hosts } from './ssh-keyscan-known-hosts.js';

interface IKeysCreate {
  host: TGithub | TGitlab;
  username: string;
  name: string;
  email: string;
  passphrase: string;
}

export const ssh_keys_create = async ({
  host,
  username,
  name,
  email,
  passphrase,
}: IKeysCreate): Promise<string | undefined> => {
  try {
    const key = `~/.ssh/id_ed25519_${username}`;
    const copy_command = `pbcopy < ${key}.pub`;

    execSync(
      `ssh-keygen -t ed25519 -C "${email}" -f ${key} -P "${passphrase}"`
    );

    note(
      `
      Open a new shell and run this command to copy your public key:
      \n
      ${chalk.inverse(copy_command)}
      \n
      Now head over to ${chalk.blue.underline(HOSTS[host]['keys'])}
      \n
      Click "${HOSTS[host]['cta']}"
      \n
      Give your key a Title (e.g. id_ed25519_${username})
      \n
      ${HOSTS[host]['usage']}
      \n
      Paste in your public key and save
    `,
      'Instructions'
    );

    const confirmed = await confirm({
      message: "Confirm once you've copied and saved your key",
      initialValue: true,
    });

    if (!confirmed) {
      cancel('Operation cancelled');
      return process.exit(0);
    } else {
      await ssh_keyscan_known_hosts(host);
    }

    return key;
  } catch (error: unknown) {}
};
