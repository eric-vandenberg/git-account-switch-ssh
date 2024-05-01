# Git Account Switch SSH

A CLI created to help manage multiple Github or Gitlab accounts. This tool will configure your SSH config with multiple git accounts. You decide which git account to link at the **repository level**.

## Usage

### Add a git account and/or link SSH to an existing repository

**Demo**

If you already have an existing repository cloned locally, you can set a specific git account to interact with it's remote. Feel free to switch back and forth from one git account to another if they both have access to the remote repository. Run the command below to select an existing git account with SSH access, or add a new git account and easily setup it's SSH keys. Once you've added or selected a git account, a few things will happen:

1. Your full name will be set in the local git config and used for future commits.
2. Your primary email for the selected git account will be set in the local git config and used for future commits.
3. An sshCommand will be set in the local git config, linking the appropriate SSH keys for your selected git account. This will allow SSH access to `git pull`, `git push`, `git fetch`, etc

> Within an existing git repository
>
> ```sh
> gas
> ```

### Clone a new repository and link SSH

**Demo**

If you want to clone a new repository, you can select or add a git account to do so. By cloning with a specified git account, the repository will already be configured with SSH for the git account you've selected. If at any time you want to make commits from another git account, simply run `gas` in the root of the project and select another one. When you clone a new repository, a few things will happen:

1. The CLI will use a custom command to clone the repository based on the selected git account.
2. Your full name will be set in the local git config and used for future commits.
3. Your primary email for the selected git account will be set in the local git config and used for future commits.
4. An sshCommand will be set in the local git config, linking the appropriate SSH keys for your selected git account. This will allow SSH access to `git pull`, `git push`, `git fetch`, etc

> Outside of a git repository
>
> ```sh
> gas
> ```

## Installation

> ```sh
> npm i -g git-account-switch-ssh
> ```

## License

MIT © Eric Vandenberg

## Future Improvements

- remove an account

  - confirm delete
  - remove from known_hosts? keep in known_hosts.old
  - remove all lines from ssh config
  - create new backup?
  - remove old keys

- update an existing account with new SSH keys

  - choose account
  - account check
  - remove old keys
  - generate keys with unique identifier
  - find and replace in ssh config

### Restore to original SSH configuration

**Demo**

If you'd like to restore your computer to the original SSH configuration you had before using Git Account Switch, simply run the command below. Here are the cleanup steps you can expect:

1. Your original SSH config will be restored to what it was before running this CLI. Any configurations created from Git Account Switch will be undone.
2. The SSH keys generated from this CLI will be deleted. If you had any SSH keys generated before using this CLI, they'll remain in place.
3. The Git Account Switch cache will be removed - `~/.gascache.json`

> ```sh
> gas restore
> ```
