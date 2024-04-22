import { cancel, confirm, group, isCancel, log, password, select, text } from '@clack/prompts';
import color from 'picocolors';

import { HOSTS } from './types/hosts.js';
import { IEntry } from './types/entry.js';
import { NEW_SSH_USER, GITHUB, GITLAB } from './types/symbols.js';
import { gas_cache_check } from './utils/gas-cache-check.js';
import { gas_cache_create } from './utils/gas-cache-create.js';
import { git_config_set } from './utils/git-config-set.js';
import { ssh_keys_create } from './utils/ssh-keys-create.js';
import { ssh_config_overwrite } from './utils/ssh-config-overwrite.js';

interface IOptions {
  project: string;
  users: IEntry[];
  gitconfig: { global: { email?: string; user?: string; }, local: { email?: string; user?: string; } };
}

export const ssh_user_link = async (opts: IOptions): Promise<string> => {
  let username: string;
  const options = opts.users.map((user: IEntry) => ({ value: user.User as string, label: user.User as string }));

  const link = await select({
    message: `Which ssh user do you want linked to ${color.green(opts.project)}`,
    options: [
      ...options,
      { value: NEW_SSH_USER, label: 'Setup a new ssh user' },
    ],
  });

  if (isCancel(link)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  if (link !== NEW_SSH_USER) {
    username = link as string;

    const cache = await gas_cache_check();

    const record = cache.find((entry: { host: string; username: string; name: string; email: string; }) => entry.username === username);

    const name = opts.gitconfig.local.user ?? opts.gitconfig.global.user;
    const email = opts.gitconfig.local.email ?? opts.gitconfig.global.email;

    if (!record) {
      const retro = await group(
        {
          host: () =>
            select({
              message: `Where is ${username} hosted?`,
              options: [
                // @ts-ignore
                { value: GITHUB, label: HOSTS[GITHUB]['site'] },
                // @ts-ignore
                { value: GITLAB, label: HOSTS[GITLAB]['site'] },
              ],
            }),

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
            process.exit(0)
          }
        }
      );

      await gas_cache_create({
        host: HOSTS[retro.host]['site'],
        username,
        name: retro.name,
        email: retro.email,
      })
    }

    await ssh_config_overwrite(opts.users);
    await git_config_set(username);

    return username;
  }

  const questions = await group(
    {
      host: () =>
        select({
          message: 'Where is your git account hosted?',
          options: [
            // @ts-ignore
            { value: GITHUB, label: HOSTS[GITHUB]['site'] },
            // @ts-ignore
            { value: GITLAB, label: HOSTS[GITLAB]['site'] },
          ],
        }),

      username: () =>
        text({
          message: 'What\'s your username?',
          placeholder: 'username',
        }),

      name: () =>
        text({
          message: 'What\'s your full name?',
          placeholder: 'First Last',
        }),

      email: () =>
        text({
          message: 'What is your primary email for this git account?',
          placeholder: 'first.last@email.com',
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
        process.exit(0)
      }
    }
  );

  const cache_entry = {
    host: HOSTS[questions.host]['site'],
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
  const existing_record = existing_cache.find((entry: { host: string; username: string; name: string; email: string; }) => entry.username === questions.username);

  if (!existing_record) {
    await gas_cache_create(cache_entry);
  }

  const key = await ssh_keys_create(questions);

  if (!!key) {
    const new_entry: Record<string, string | string[]> = {
      Host: `${HOSTS[questions.host]['site']}-${questions.username}`,
      AddKeysToAgent: 'yes',
      UseKeychain: 'yes',
      IdentityFile: [key],
      User: questions.username,
      HostName: HOSTS[questions.host]['site']
    };

    await ssh_config_overwrite(opts.users, new_entry);
    await git_config_set(questions.username);
  }

  return questions.username;
}
