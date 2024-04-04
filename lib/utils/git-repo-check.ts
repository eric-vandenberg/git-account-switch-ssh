import { execSync } from 'node:child_process';
import * as p from '@clack/prompts';

export const git_repo_check = async () => {
  let path = ".";
  try {
    path = execSync("git rev-parse --show-toplevel").toString().trim();
  } catch (err: unknown) {
    p.log.warn(
      "Could not find git root. If in a --bare repository, ignore this warning."
    );
  }
  return path;
}
