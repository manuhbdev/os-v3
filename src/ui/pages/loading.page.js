import { APP_PATHS } from '../../app.routes';
import { router } from '../../core/router.core';
import {
  get_fs,
  get_system,
  get_users,
  set_fs,
  set_online_status,
  set_system,
  set_system_loaded,
  set_users,
} from '../../core/state.core';
import { storage } from '../../core/storage.core';
import { get_battery } from '../../io/device/battery.device';
import { load_file_system, load_users } from '../../data/data.loaders';

export function LoadingPage() {
  var __state = {
    name: 'loading',
  };
  var __selector = 'loading-page';
  var __target_element = null;
  function init(dom_el) {
    __target_element = dom_el;
  }
  function render() {
    const styles = `
    ${__selector}{
        height: 100%;
        background-color: rgb(41, 41, 43);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
     }`;
    const template = `
        <${__selector}>
            <style>${styles}</style>
            <h1>loading...</h1>
        </${__selector}>
        `;
    __target_element.innerHTML = template;
  }
  async function mounted() {
    //
    const fs = await load_file_system();
    const battery = await get_battery();
    const users = await load_users(fs);
    // state (volatil)
    set_fs(fs);
    set_users(users);
    set_system({
      battery,
    });
    // storage (persistant)
    storage.save_fs();
    storage.save_users();

    set_system_loaded(true);
    console.log('⚙️ system', get_system());
    console.log('📂 file system', get_fs());
    console.log('👤 users', get_users());

    // internet status
    set_online_status(navigator.onLine);
    const offline_banner = document.getElementById('offline_banner');
    window.addEventListener('online', (e) => {
      set_online_status(true);
      offline_banner.classList.add('hide');
      document.body.classList.remove('offline');
    });
    window.addEventListener('offline', (e) => {
      set_online_status(false);
      offline_banner.classList.remove('hide');
      document.body.classList.add('offline');
    });

    setTimeout(() => {
      router.navigate(APP_PATHS.LOGIN);
    }, 1 * 1000);
  }
  function before_destroy() {}
  return {
    init,
    render,
    mounted,
    before_destroy,
  };
}
