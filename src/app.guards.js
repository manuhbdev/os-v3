import { get_system_loaded } from './core/state.core';

export function is_system_loaded() {
  const status = get_system_loaded();
  if (!status) console.warn('need to load system first');
  return status;
}
