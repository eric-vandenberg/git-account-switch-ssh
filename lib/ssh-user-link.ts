import {
  cancel,
  confirm,
  group,
  isCancel,
  log,
  password,
  select,
  text,
} from '@clack/prompts';
import chalk from 'chalk';

import { IEntry } from './types/entry.js';
import { HOSTS } from './consts/hosts.js';
import { color_scheme } from './consts/banner.js';
import {
  NEW_SSH_USER,
  GITHUB,
  GITLAB,
  KEYCHAIN_YES,
  KEYCHAIN_NO,
} from './types/symbols.js';
import { gas_cache_check } from './utils/gas-cache-check.js';
import { gas_cache_create } from './utils/gas-cache-create.js';
import { git_config_set } from './utils/git-config-set.js';
import { ssh_keys_create } from './utils/ssh-keys-create.js';
import { ssh_keys_add_to_agent } from './utils/ssh-keys-add-to-agent.js';
import { ssh_config_overwrite } from './utils/ssh-config-overwrite.js';

interface IOptions {
  project: string;
  users: IEntry[];
  gitconfig: {
    global: { email?: string; user?: string };
    local: { email?: string; user?: string };
  };
}

export const ssh_user_link = async (opts: IOptions): Promise<string> => {
  let username: string;
  const options = opts.users.map((user: IEntry) => ({
    value: user.User as string,
    label: `${user.User}${user?.HostName ? ' (' + user.HostName + ')' : ''}`,
  }));

  const link = await select({
    message: `Which ssh user do you want linked to ${chalk
      .hex(color_scheme.red)
      .bold(opts.project)}`,
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

    const record = cache.find(
      (entry: {
        host: string;
        username: string;
        name: string;
        email: string;
      }) => entry.username === username
    );

    const name = opts.gitconfig.local.user ?? opts.gitconfig.global.user;
    const email = opts.gitconfig.local.email ?? opts.gitconfig.global.email;

    if (!record) {
      const retro = await group(
        {
          host: () =>
            select({
              message: `Where is ${chalk
                .hex(color_scheme.green)
                .bold(username)} hosted?`,
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
            process.exit(0);
          },
        }
      );

      await gas_cache_create({
        host: HOSTS[retro.host]['site'],
        username,
        name: retro.name,
        email: retro.email,
      });
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
          message: "What's your username?",
          placeholder: 'username',
        }),

      name: () =>
        text({
          message: "What's your full name?",
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
          mask: '*',
        }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled');
        process.exit(0);
      },
    }
  );

  const cache_entry = {
    host: HOSTS[questions.host]['site'],
    username: questions.username,
    name: questions.name,
    email: questions.email,
  };

  log.step(`${JSON.stringify(cache_entry, null, 2)}`);

  const confirmed = await confirm({
    message: `Does the information above look correct?`,
  });

  if (isCancel(confirmed)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const existing_cache = await gas_cache_check();
  const existing_record = existing_cache.find(
    (entry: { host: string; username: string; name: string; email: string }) =>
      entry.username === questions.username &&
      entry.host === HOSTS[questions.host]['site']
  );

  if (existing_record) {
    cancel("It looks like you've already setup this user");
    return process.exit(0);
  } else {
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
      HostName: HOSTS[questions.host]['site'],
    };

    const keychain = await select({
      message: `Do you want to save your passphrase in Keychain?`,
      options: [
        { value: KEYCHAIN_YES, label: 'Yes', hint: 'recommended' },
        { value: KEYCHAIN_NO, label: 'No' },
      ],
    });

    if (isCancel(keychain)) {
      cancel('Operation cancelled');
      return process.exit(0);
    }

    const add_keychain = keychain === KEYCHAIN_YES;

    await ssh_keys_add_to_agent(key, add_keychain);
    await ssh_config_overwrite(opts.users, new_entry);
    await git_config_set(questions.username);
  }

  return questions.username;
};
