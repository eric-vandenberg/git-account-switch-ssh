import { execSync } from 'node:child_process';
import { note } from '@clack/prompts';

export const ssh_keys_create = async (options: { username: string, name: string; email: string; passphrase: string }): Promise<string | undefined> => {
  try {
    const key = `~/.ssh/id_ed25519_${options.username}`;

    execSync(`ssh-keygen -t ed25519 -C "${options.email}" -f ${key} -P "${options.passphrase}"`);

    note(`
      Open a new shell and run this command to copy your public key:
      \n
      pbcopy < ${key}.pub
      \n
      Now head over to https://github.com/settings/keys
      \n
      Click "New SSH key"
      \n
      Give your key a Title (e.g. id_ed25519_${options.username})
      \n
      Key type should be Authentication Key
      \n
      Paste in your public Key and save
    `, 'Instructions');

    return key;
  } catch (error: unknown) {

  }
}
