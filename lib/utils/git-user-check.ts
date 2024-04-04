import os from 'node:os';
import { text } from 'node:stream/consumers';
import { accessSync, readFileSync, constants, unlink, unlinkSync } from 'node:fs'
import { spawnSync } from 'node:child_process';

export const git_user_check = async (path: string) => {
  const home = os.homedir();
  accessSync(`${home}/.gitconfig`, constants.R_OK | constants.W_OK);

  const gconfig = readFileSync(`${home}/.gitconfig`, 'utf-8').toString().replace(/\r\n/g, '\n').replace(/\n|\t+/g, '').split('=');
  const lconfig = readFileSync(`${path}/.git/config`, 'utf-8').toString().replace(/\r\n/g, '\n').replace(/\n|\t+/g, '').split('[user]');

  const guser = gconfig[2].trim();
  const gemail = gconfig[1] ? gconfig[1].replace('name', '').trim() : undefined;

  const luser = lconfig[1] ? lconfig[1].split('=')[2].trim() : undefined;
  const lemail = lconfig[1] ? lconfig[1].split('=')[1].replace('name', '').trim() : undefined;

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
