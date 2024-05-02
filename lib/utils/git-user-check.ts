import { homedir } from 'node:os';
import { accessSync, readFileSync, constants } from 'node:fs';

import { IGitConfig } from '../types/gitconfig.js';

export const git_user_check = async (path: string): Promise<IGitConfig> => {
  const home = homedir();
  const global_path = `${home}/.gitconfig`;
  const local_path = `${path}/.git/config`;
  let skip_global = false;
  let skip_local = false;
  const result: IGitConfig = {
    global: {
      email: undefined,
      name: undefined,
    },
    local: {
      email: undefined,
      name: undefined,
    },
  };

  try {
    accessSync(global_path, constants.R_OK | constants.W_OK);
  } catch (error: unknown) {
    const message = (error as Error).message;

    if (message.includes(global_path)) {
      skip_global = true;
    }
  }

  try {
    accessSync(local_path, constants.R_OK | constants.W_OK);
  } catch (error: unknown) {
    const message = (error as Error).message;

    if (message.includes(local_path)) {
      skip_local = true;
    }
  }

  const eregex = /email\s=\s(.*?)$/ms;
  const uregex = /name\s=\s(.*?)$/ms;
  const sregex =
    /sshCommand\s=\sssh\s-o\sIdentitiesOnly=yes\s-i\s(.*?)\s-F\s\/dev\/null$/ms;

  if (!skip_global) {
    const gconfig = readFileSync(global_path, { encoding: 'utf-8' });
    const gemail_match = gconfig.match(eregex);
    const gname_match = gconfig.match(uregex);
    const gemail = gemail_match ? gemail_match[1] : undefined;
    const gname = gname_match ? gname_match[1] : undefined;

    result.global = {
      email: gemail,
      name: gname,
    };
  }

  if (!skip_local) {
    const lconfig = readFileSync(local_path, { encoding: 'utf-8' });
    const lemail_match = lconfig.match(eregex);
    const lname_match = lconfig.match(uregex);
    const lkey_match = lconfig.match(sregex);
    const lemail = lemail_match ? lemail_match[1] : undefined;
    const lname = lname_match ? lname_match[1] : undefined;
    const lkey = lkey_match ? lkey_match[1] : undefined;

    result.local = {
      email: lemail,
      name: lname,
      key: lkey,
    };
  }

  return result;
};
