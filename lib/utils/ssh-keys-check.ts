import os from 'node:os';
import { readdirSync } from 'node:fs';

export const ssh_keys_check = async (): Promise<string[]> => {
  try {
    const home = os.homedir();
    const regex = /^(id_ed25519|id_ecdsa|id_rsa|id_dsa).+$/; // id_ed25519-sk & id_ecdsa-sk will be recongnized
    const keys = [];

    for (const file of readdirSync(`${home}/.ssh`)) {
      if (regex.test(file)) {
        keys.push(file);
      }
    }

    return keys;
  } catch (error: unknown) {
    return [];
  }
};
