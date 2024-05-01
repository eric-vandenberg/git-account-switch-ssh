import { exec, execSync } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const ssh_keys_add_to_agent = async (
  identity_file: string,
  keychain: boolean = false
) => {
  try {
    const keychain_flag = keychain ? '--apple-use-keychain ' : '';
    const ssh_agent = await execAsync('ssh-add -l')
      .then(() => true)
      .catch(() => false);

    if (!ssh_agent) {
      execSync('eval "$(ssh-agent -s)"', { stdio: [] });
    }

    execSync(`ssh-add ${keychain_flag}${identity_file}`, { stdio: [] });
  } catch (error: unknown) {}
};
