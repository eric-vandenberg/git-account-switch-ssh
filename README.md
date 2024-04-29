# Git Account Switch SSH

A global CLI created to help manage multiple Github or Gitlab accounts. This tool will configure your SSH config with multiple git users. You decide which git user to link at the repository level. Individual projects are setup to communicate with the Github or Gitlab APIs over SSH with the user of your choice.

## System Requirements

- UNIX operating system
- Node

## Installation

```sh
npm install -g git-account-switch-ssh
```

## Usage

**Link an ssh user to a repository**

If you already have an existing repository cloned locally, you can set a specific user to this repository. Run the command below to select an existing user, or add a new git account and establish an SSH connection. Once you've added or selected a user, a few things will happen to link this specific user to your repository:

1. Your full name will be set in the local git config and used for future commits.
2. Your primary email for the selected git account will be set in the local git config and used for future commits.
3. An sshCommand will be set in the local git config, linking your SSH keys to the appropriate git account. This will allow for requests like, `git pull`, `git push`, `git fetch` etc, to be made with the correct git account.

> Within an existing git repository

```sh
gas
```

**Demo**

**Clone a repository and link an ssh user**

If you want to clone a new repository, you can select or add a git account to do so. By cloning with a specified user, your project will be configured for that user only. If at any time you want to make commits from another git user, simply run `gas` in the root of the project and select a different user. When you clone a new repository, a few things happen:

1. The CLI will use a custom command to clone the repository based on the selected git user.
2. Your full name will be set in the local git config and used for future commits.
3. Your primary email for the selected git account will be set in the local git config and used for future commits.
4. An sshCommand will be set in the local git config, linking your SSH keys to the appropriate git account. This will allow for requests like, `git pull`, `git push`, `git fetch` etc, to be made with the correct git account.

> Outside of a git repository

```sh
gas
```

**Demo**

**Restore to original ssh configuration**

If you'd like to restore your computer to the original SSH configuration you had before using Git Account Switch, simply run the command below. Here are the cleanup steps you can expect:

1. Your original SSH config will be restored to what it was before running this CLI. Any configurations created from Git Account Switch will be undone.
2. The SSH keys generated from this CLI will be deleted. If you had any SSH keys generated before using this CLI, they'll remain in place.
3. The Git Account Switch cache will be removed - `~/.gascache.json`

```sh
gas restore
```

**Demo**

## License

MIT © Eric Vandenberg

plan it out

- ssh check

  - config file
  - known hosts?
  - keys?

- account check

  - username
  - name
  - email
  - match keys?

- git repo check

  - check for user.name
  - check for user.email
  - check for core.sshCommand

- backup config file

- track gas settings in ~/.gas

  - list users with host:username, name, and email

- add a new account SSH

  - collect username
  - collect name
  - collect email
  - collect passphrase (optional)
  - generate keys
  - update gas settings
  - append new account in .ssh/config

- remove an account's ssh

  - confirm delete
  - remove from known_hosts? keep in known_hosts.old
  - remove all lines from ssh config
  - create new backup

- remove old keys

  - confirm delete

- update an existing account with a new SSH key

  - choose account
  - account check
  - remove old keys
  - generate keys with unique identifier
  - find and replace in ssh config

- link a repo to an ssh user

  - git config user.name
  - git config user.email
  - git config core.sshCommand "ssh -i ~/.ssh/id_rsa_example -F /dev/null"

- clone a new repo and link to ssh user

- uninstall and reset to backup
  - rewrite ssh config with backup
  - delete backup
  - delete settings ~/.gas

```
HTTPS connect error

Cloning into 'github-account-switcher'...
Username for 'https://github.com': Eric-Vandenberg
Password for 'https://Eric-Vandenberg@github.com':
remote: Support for password authentication was removed on August 13, 2021.
remote: Please see https://docs.github.com/get-started/getting-started-with-git/about-remote-repositories#cloning-with-https-urls for information on currently recommended modes of authentication.
fatal: Authentication failed for 'https://github.com/Eric-Vandenberg/github-account-switcher.git/'
```
