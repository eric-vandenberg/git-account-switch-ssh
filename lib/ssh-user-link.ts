import { sshConfigCheck } from './utils/ssh-config-check.js';

export async function sshUserLink(options: any) {
  await sshConfigCheck();
}
