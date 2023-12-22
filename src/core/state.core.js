import { create_state } from './utils.core';

export const [get_users, set_users, $users] = create_state();
export const [get_system_loaded, set_system_loaded, $system_loaded] =
  create_state();
export const [get_system, set_system, $system] = create_state({});
export const [get_fs, set_fs, $fs] = create_state({});
export const [get_online_status, set_online_status, $online_status] =
  create_state(false);
