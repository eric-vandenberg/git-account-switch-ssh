import os from 'node:os';
import { accessSync, readFileSync, constants } from 'node:fs'

export const git_user_check = async (path: string) => {
  const home = os.homedir();
  accessSync(`${home}/.gitconfig`, constants.R_OK | constants.W_OK);

  const eregex = /email = (.*?)$/sm
  const uregex = /name = (.*?)$/sm

  const gconfig = readFileSync(`${home}/.gitconfig`, 'utf-8');
  const lconfig = readFileSync(`${path}/.git/config`, 'utf-8');

  const gemail_match = gconfig.match(eregex);
  const guser_match = gconfig.match(uregex);

  const gemail = gemail_match ? gemail_match[1] : undefined;
  const guser = guser_match ? guser_match[1] : undefined;

  const lemail_match = lconfig.match(eregex);
  const luser_match = lconfig.match(uregex);

  const lemail = lemail_match ? lemail_match[1] : undefined;
  const luser = luser_match ? luser_match[1] : undefined;

  return {
    global: {
      email: gemail,
      user: guser
    },
    local: {
      email: lemail,
      user: luser
    }
  };
}
