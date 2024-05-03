<p align="center"><img src="https://quintessence-assets.s3.us-west-1.amazonaws.com/git-account-switch-ssh.png" /></p>

<br />

<p align="center">A CLI created to help manage multiple <strong>Github</strong> or <strong>Gitlab</strong> accounts. This tool will configure your SSH config with multiple git accounts. You decide which account to link at the <strong>repository level</strong>.</p>

<br />

## Usage

<br />

### Link SSH to an existing repository

**Demo**

<br />

<p align="center"><img src="https://quintessence-assets.s3.us-west-1.amazonaws.com/add-werkiwerk.gif" /></p>

<br />

If you already have an existing repository cloned locally, you can set a specific git account to interact with it's remote. Feel free to switch back and forth from one git account to another if they both have access to the remote repository. Run the command below to select an existing account with SSH access, or add a new git account and easily setup it's SSH keys. Once you've added or selected an account, a few things will be set in your project's local git config:

1. Your full name will be set and used for future commits.
2. Your primary email for the selected git account will be set and used for future commits.
3. An sshCommand will be set, linking the appropriate SSH keys for your selected git account. This will allow SSH access to `git pull`, `git push`, `git fetch`, etc

> Within an existing git repository
>
> ```sh
> gas
> ```

<br />

### Clone a new repository and link SSH

**Demo**

<br />

<p align="center"><img src="https://quintessence-assets.s3.us-west-1.amazonaws.com/clone-san-junipero.gif" /></p>

<br />

If you want to clone a new repository, you can select or add a git account to do so. By cloning with a specified account, the repository will already be configured with SSH. If at any time you want to make commits from another git account, simply run `gas` in the root of the project and select another one. The CLI will use a custom command to clone the repository based on the account you've selected. Once cloning completes, a few things will be set in your project's local git config:

1. Your full name will be set and used for future commits.
2. Your primary email for the selected git account will be set and used for future commits.
3. An sshCommand will be set, linking the appropriate SSH keys for your selected git account. This will allow SSH access to `git pull`, `git push`, `git fetch`, etc

> Outside of a git repository
>
> ```sh
> gas
> ```

<br />
<br />

## Installation

```sh
npm i -g git-account-switch-ssh
```

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

<br />
<br />

## Restore to original SSH configuration

**Demo**

If you'd like to restore your computer to the original SSH configuration you had before using Git Account Switch, simply run the command below. Here are the cleanup steps you can expect:

1. Your original SSH config will be restored to what it was before running this CLI. Any configurations created from Git Account Switch will be undone.
2. The SSH keys generated from this CLI will be deleted. If you had any SSH keys generated before using this CLI, they'll remain in place.
3. The Git Account Switch cache will be removed - `~/.gascache.json`

> ```sh
> gas restore
> ```
