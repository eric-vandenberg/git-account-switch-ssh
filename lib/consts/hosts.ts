import { GITHUB, GITLAB } from '../types/symbols.js';

interface IHostData {
  site: string;
  keys: string;
  cta: string;
  usage: string;
}

interface IHosts {
  [GITHUB]: IHostData;
  [GITLAB]: IHostData;
}

export const HOSTS: IHosts = {
  [GITHUB]: {
    site: 'github.com',
    keys: 'https://github.com/settings/keys',
    cta: 'New SSH key',
    usage: 'Set the Key type (Authentication Key)',
  },
  [GITLAB]: {
    site: 'gitlab.com',
    keys: 'https://gitlab.com/-/user_settings/ssh_keys',
    cta: 'Add new key',
    usage: 'Set the Usage type (Authentication & Signing)',
  },
};
