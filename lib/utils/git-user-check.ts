import os from 'node:os';
import { accessSync, readFileSync, constants } from 'node:fs';

export const git_user_check = async (path: string) => {
  const home = os.homedir();
  const global_path = `${home}/.gitconfig`;
  const local_path = `${path}/.git/config`;
  let skip_global = false;
  let skip_local = false;
  const result: {
    global: {
      email?: string;
      user?: string;
    };
    local: {
      email?: string;
      user?: string;
    };
  } = {
    global: {
      email: undefined,
      user: undefined,
    },
    local: {
      email: undefined,
      user: undefined,
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

  if (!skip_global) {
    const gconfig = readFileSync(global_path, { encoding: 'utf-8' });
    const gemail_match = gconfig.match(eregex);
    const guser_match = gconfig.match(uregex);
    const gemail = gemail_match ? gemail_match[1] : undefined;
    const guser = guser_match ? guser_match[1] : undefined;

    result.global = {
      email: gemail,
      user: guser,
    };
  }

  if (!skip_local) {
    const lconfig = readFileSync(local_path, { encoding: 'utf-8' });
    const lemail_match = lconfig.match(eregex);
    const luser_match = lconfig.match(uregex);
    const lemail = lemail_match ? lemail_match[1] : undefined;
    const luser = luser_match ? luser_match[1] : undefined;

    result.local = {
      email: lemail,
      user: luser,
    };
  }

  return result;
};
