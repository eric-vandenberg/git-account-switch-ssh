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
import { IGitConfig } from './types/gitconfig.js';
import {
  NEW_SSH_USER,
  GITHUB,
  GITLAB,
  KEYCHAIN_YES,
  KEYCHAIN_NO,
} from './types/symbols.js';
import { ICache } from './types/cache.js';
import { HOSTS } from './consts/hosts.js';
import { color_scheme } from './consts/banner.js';
import { gas_cache_check } from './utils/gas-cache-check.js';
import { gas_cache_create } from './utils/gas-cache-create.js';
import { git_config_set } from './utils/git-config-set.js';
import { ssh_keys_create } from './utils/ssh-keys-create.js';
import { ssh_keys_add_to_agent } from './utils/ssh-keys-add-to-agent.js';
import { ssh_config_overwrite } from './utils/ssh-config-overwrite.js';

interface ILinkOptions {
  project: string;
  users: IEntry[];
  gitconfig: IGitConfig;
}

export const ssh_user_link = async ({
  project,
  users,
  gitconfig,
}: ILinkOptions): Promise<string> => {
  let username: string;
  const options = users.map((user: IEntry) => {
    const current =
      user.IdentityFile?.[0] && user.IdentityFile[0] === gitconfig.local.key;
    const account = current
      ? chalk.hex(color_scheme.green).bold(user.User as string)
      : (user.User as string);
    const label = `${account}${
      user?.HostName ? ' (' + user.HostName + ')' : ''
    }`;

    return {
      value: user.User as string,
      label,
    };
  });

  const link = await select({
    message: `Which git account do you want linked to ${chalk
      .hex(color_scheme.red)
      .bold(project)}`,
    options: [
      ...options,
      {
        value: NEW_SSH_USER,
        label: 'Setup SSH for another git account',
      },
    ],
  });

  if (isCancel(link)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  if (link !== NEW_SSH_USER) {
    username = link as string;

    const cache = await gas_cache_check();

    const record = cache.find((item: ICache) => item.username === username);

    const name = gitconfig.local.name ?? gitconfig.global.name;
    const email = gitconfig.local.email ?? gitconfig.global.email;

    if (!record) {
      const backfill = await group(
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
              placeholder: name ? `${name}` : '',
            }),

          email: () =>
            text({
              message: 'What is your primary email for this git account?',
              placeholder: email ? `${email}` : '',
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
        host: HOSTS[backfill.host]['site'],
        username,
        name: backfill.name,
        email: backfill.email,
      });
    }

    await ssh_config_overwrite(users);
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
          placeholder: 'Firstname Lastname',
        }),

      email: () =>
        text({
          message: 'What is your primary email for this git account?',
          placeholder: 'example@email.com',
        }),

      passphrase: () =>
        password({
          message: 'Enter a passphrase to protect your SSH keys',
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

  log.info(`Host: ${cache_entry.host}`);
  log.info(`Username: ${cache_entry.username}`);
  log.info(`Name: ${cache_entry.name}`);
  log.info(`Email: ${cache_entry.email}`);

  const confirmed = await confirm({
    message: `Does this information look correct?`,
    initialValue: true,
  });

  if (!confirmed) {
    cancel('Operation cancelled');
    return process.exit(0);
  }

  const existing_cache = await gas_cache_check();
  const existing_record = existing_cache.find(
    (item: ICache) =>
      item.username === questions.username &&
      item.host === HOSTS[questions.host]['site']
  );

  if (existing_record) {
    cancel("It looks like you've already setup this git account");
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
      message: `Do you want to save your passphrase in Apple Keychain?`,
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
    await ssh_config_overwrite(users, new_entry);
    await git_config_set(questions.username);
  }

  return questions.username;
};
