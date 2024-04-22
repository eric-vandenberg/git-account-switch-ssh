import { GITHUB, GITLAB } from './symbols.js';

export const HOSTS: {
  [GITHUB]: {
    site: string;
    keys: string;
    cta: string;
    usage: string;
  },
  [GITLAB]: {
    site: string;
    keys: string;
    cta: string;
    usage: string;
  },
} = {
  [GITHUB]: {
    site: 'github.com',
    keys: 'https://github.com/settings/keys',
    cta: 'New SSH key',
    usage: 'Set the Key Type (Authentication Key)',
  },
  [GITLAB]: {
    site: 'gitlab.com',
    keys: 'https://gitlab.com/-/user_settings/ssh_keys',
    cta: 'Add an SSH key',
    usage: 'Set the Usage type (Authentication & Signing)',
  }
}
