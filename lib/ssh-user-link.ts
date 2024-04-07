import { cancel, isCancel, select } from '@clack/prompts';

import { IEntry } from './utils/ssh-user-check.js';

export const ssh_user_link = async (project: string, users: IEntry[]) => {
  let username;
  const options = users.map((user) => ({ value: user.User as string, label: user.User as string }));

  const link = await select({
    message: `Which ssh user do you want linked to ${project}`,
    options: [
      ...options,
      { value: '@', label: 'Setup a new ssh user' },
    ],
  });

  if (isCancel(link)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  if (link !== '@') {
    username = link;
  }

  return username;
}
