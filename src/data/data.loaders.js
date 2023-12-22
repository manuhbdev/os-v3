import { create_default_file_system } from '../core/file_system.core';
import { storage } from '../core/storage.core';

export async function load_file_system() {
  let fs = null;
  try {
    const stored_fs = await storage.load_fs();
    console.log;
    if (!stored_fs) {
      console.warn('[file_system]', 'not found  in idb');
      fs = create_default_file_system();
    } else {
      console.log('file_system from idb');
      fs = stored_fs;
    }
  } catch (e) {
    console.log('catch idb', e);
    fs = create_default_file_system();
  }
  return fs;
}
export async function load_users(file_system) {
  let users = null;
  try {
    const stored_users = await storage.load_users();
    if (!stored_users) {
      // console.warn('[users]', 'not found');
      users = get_users_from_directory(file_system);
    } else {
      // console.log('users from idb');
      users = stored_users;
    }
  } catch (error) {
    console.log(error);
    users = get_users_from_directory(file_system);
  }

  return users;
}
function get_users_from_directory(file_system) {
  const root = file_system;
  const home = root.children.find((node) => node.name === 'home');
  const users = home.children.map((node) => ({
    username: node.name,
    home_dir: node,
    desktop_dir: node.children.find((node) => node.name === 'Desktop'),
    is_admin: node.name === 'admin',
    is_logged_in: false,
  }));

  return {
    list: users,
    current: null,
  };
}
