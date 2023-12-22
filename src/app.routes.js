import { is_system_loaded } from './app.guards';
import { DesktopPage } from './ui/pages/desktop.page';
import { LoadingPage } from './ui/pages/loading.page';
import { LoginPage } from './ui/pages/login.page';

export const APP_PATHS = {
  EMPTY: '/',
  LOADING: '/loading',
  LOGIN: '/login',
  DESKTOP: '/desktop',
};
export const app_routes = [
  {
    path: '/',
    redirect_to: APP_PATHS.LOADING,
  },
  {
    path: APP_PATHS.LOADING,
    component: LoadingPage,
  },
  {
    path: APP_PATHS.LOGIN,
    component: LoginPage,
    guards: [is_system_loaded],
  },
  {
    path: APP_PATHS.DESKTOP,
    component: DesktopPage,
    guards: [is_system_loaded],
  },
];
