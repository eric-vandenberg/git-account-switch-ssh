import { execSync } from 'node:child_process';

export const git_repo_check = async () => {
  let path = '.';

  try {
    path = execSync('git rev-parse --show-toplevel', { stdio: [] })
      .toString()
      .trim();

    return path;
  } catch (error: unknown) {
    return path;
  }
};
