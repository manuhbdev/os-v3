import {
  get_fs,
  get_system,
  get_users,
  set_fs,
  set_users,
} from './state.core.js';
import { idb } from '../io/storage/indexed_db.storage.js';

const KEYS = {
  FILE_SYSTEM: 'FILE_SYSTEM',
  USERS: 'USERS',
};
export const storage = {
  save: function (data) {
    idb.updateData(data);
  },
  load: function (key) {
    return idb.getData(key);
    return localStorage.getItem(key);
    return sessionStorage.getItem(key);
  },
  load_fs: function () {
    const key = KEYS.FILE_SYSTEM;
    return idb.getData(key);
    return localStorage.getItem(key);
    return sessionStorage.getItem(key);
  },
  load_users: function () {
    const key = KEYS.USERS;
    return idb.getData(key);
    return localStorage.getItem(key);
    return sessionStorage.getItem(key);
  },
  save_fs() {
    const fs = get_fs();
    fs.idb = KEYS.FILE_SYSTEM;
    set_fs(fs);
    this.save(fs);
  },
  save_users() {
    const users = get_users();
    users.idb = KEYS.USERS;
    set_users(users);
    this.save(users);
  },
};
