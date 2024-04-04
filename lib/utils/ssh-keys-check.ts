import os from 'node:os';
import { accessSync, readdirSync, constants } from 'node:fs'

export const ssh_keys_check = async (): Promise<string[]> => {
  const home = os.homedir();
  const regex = /^(id_ed25519|id_ecdsa|id_rsa|id_dsa).+$/;
  const keys = [];

  accessSync(`${home}/.ssh/config`, constants.R_OK | constants.W_OK);

  for (const file of readdirSync(`${home}/.ssh`)) {
    if (regex.test(file)) {
      keys.push(file);
    }
  }

  return keys;
}
