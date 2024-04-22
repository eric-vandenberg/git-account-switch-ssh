import { execSync } from 'node:child_process';
import { note } from '@clack/prompts';

import { IEntry } from './types/entry.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { git_config_set } from './utils/git-config-set.js';


export const clone_repo_user_link = async (repository: string, project: string, username: string) => {
  try {
    const accounts = await ssh_config_check();
    const entry = accounts.find((account: IEntry) => account?.User === username);

    if (!!entry && entry.IdentityFile?.[0]) {
      execSync(`GIT_SSH_COMMAND="ssh -o IdentitiesOnly=yes -i ${entry.IdentityFile[0]} -F /dev/null" git clone ${repository}`, { stdio: [] });;

      await git_config_set(username, project);

      note(`
      Repo cloned!
      \n
      cd ${project}
      \n
      You are setup to commit as user ${username}
    `, 'Success');
    }
  } catch (error: unknown) {

  }
}
