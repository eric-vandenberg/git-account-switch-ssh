import { ssh_config_check } from './utils/ssh-config-check.js';

export const ssh_user_link = async (options: any) => {
  await ssh_config_check();
}
