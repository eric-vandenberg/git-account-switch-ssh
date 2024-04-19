# Git Account Switch SSH

## Installation
```javascript
npm install -g git-account-switch-ssh
```

## Usage

**Within an existing git repository**
```javascript
gas
```

## Demo - link an ssh user to repository


**Clone a repository (outside a git repository)**
```javascript
gas
```

## Demo - clone a repository and link ssh user


**Restore to original ssh configuration**
```javascript
gas restore
```

## Demo


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
