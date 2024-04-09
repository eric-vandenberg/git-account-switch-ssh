import { cancel, confirm, group, isCancel, log, password, select, text } from '@clack/prompts';

import { IEntry } from './types/entry.js';
import { gas_cache_check } from './utils/gas-cache-check.js';
import { gas_cache_create } from './utils/gas-cache-create.js';


interface IOptions {
  project: string;
  users: IEntry[];
  gitconfig: { global: { email?: string; user?: string; }, local: { email?: string; user?: string; } };
}

export const ssh_user_link = async (opts: IOptions) => {
  let username: string;
  const options = opts.users.map((user) => ({ value: user.User as string, label: user.User as string }));

  const link = await select({
    message: `Which ssh user do you want linked to ${opts.project}`,
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
    username = link as string;

    const cache = await gas_cache_check();

    const record = cache.find((entry: { username: string; name: string; email: string; }) => entry.username === username);

    const name = opts.gitconfig.local.user ?? opts.gitconfig.global.user;
    const email = opts.gitconfig.local.email ?? opts.gitconfig.global.email;

    if (!record) {
      const retro = await group(
        {
          name: () =>
            text({
              message: 'What is your name?',
              placeholder: `${name}`,
            }),

          email: () =>
            text({
              message: 'What is your primary email for this git account?',
              placeholder: `${email}`,
            }),
        },
        {
          onCancel: () => {
            cancel('Operation cancelled');
            process.exit(1)
          }
        }
      );

      await gas_cache_create({
        username,
        name: retro.name,
        email: retro.email,
      })
    }

    return username;
  }

  const questions = await group(
    {
      username: () =>
        text({
          message: 'What is the username of the git account you want to add?',
          placeholder: 'e.g. https://github.com/{username}',
        }),

      name: () =>
        text({
          message: 'What is your name?',
          placeholder: 'John Doe',
        }),

      email: () =>
        text({
          message: 'What is your primary email for this git account?',
          placeholder: 'john.doe@email.com',
        }),

      passphrase: () =>
        password({
          message: 'Enter a passphrase to protect your ssh keys',
          mask: '*'
        }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled');
        process.exit(1)
      }
    }
  );

  const cache_entry = {
    username: questions.username,
    name: questions.name,
    email: questions.email,
  }

  log.step(`${JSON.stringify(cache_entry, null, 2)}`);

  const confirmed = await confirm({
    message: `Does the information above look correct?`
  });

  if (isCancel(confirmed)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const existing_cache = await gas_cache_check();
  const existing_record = existing_cache.find((entry: { username: string; name: string; email: string; }) => entry.username === questions.username);

  if (!existing_record) {
    await gas_cache_create(cache_entry);
  }

  return questions.username;
}
