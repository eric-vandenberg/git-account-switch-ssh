import { execSync } from 'node:child_process';
import { note } from '@clack/prompts';
import chalk from 'chalk';

import { IEntry } from './types/entry.js';
import { ssh_config_check } from './utils/ssh-config-check.js';
import { git_config_set } from './utils/git-config-set.js';

interface ICloneOptions {
  repository: string;
  project: string;
  username: string;
}

export const clone_repo_user_link = async ({
  repository,
  project,
  username,
}: ICloneOptions) => {
  try {
    const accounts = await ssh_config_check();
    const entry = accounts.find(
      (account: IEntry) => account?.User === username
    );

    if (entry?.IdentityFile?.[0]) {
      execSync(
        `GIT_SSH_COMMAND="ssh -o IdentitiesOnly=yes -i ${entry.IdentityFile[0]} -F /dev/null" git clone ${repository}`,
        { stdio: [] }
      );

      await git_config_set(username, project);

      note(
        `
      Repository cloned
      \n
      ${chalk.inverse('cd ') + chalk.inverse(project)}
      \n
    `,
        'Success'
      );
    }
  } catch (error: unknown) {}
};
