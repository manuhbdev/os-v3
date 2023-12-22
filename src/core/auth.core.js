import { APP_PATHS } from '../app.routes';
import { router } from './router.core';
import { get_users, set_users } from './state.core';

export function login(username, pwd = '') {
  const valid_users = [
    username === 'invitado' && pwd === '',
    username === 'administrador' && pwd === '',
  ];
  const is_valid = valid_users.some((cond) => cond === true);
  if (is_valid) {
    const _users = get_users();
    _users.current = {
      username,
      loggedIn: true,
    };
    set_users(_users);
    router.navigate(APP_PATHS.DESKTOP);
  } else {
    console.warn('invalid pwd');
  }
}
export function logout() {
  set_users({ ...get_users(), current: null });
  router.navigate(APP_PATHS.LOGIN);
}
