class Indexed_DB {
  constructor(db_name, store_name) {
    this.db_name = db_name;
    this.store_name = store_name;
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.db_name, 1);

      request.onerror = () => reject('Error opening IndexedDB');
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(this.store_name, { keyPath: 'idb' });
      };
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }

  async addData(data) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store_name, 'readwrite');
      const store = transaction.objectStore(this.store_name);
      const request = store.add(data);

      request.onerror = () => reject('Error adding data to IndexedDB');
      request.onsuccess = () => resolve('Data added successfully');
    });
  }

  async getData(key) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store_name, 'readonly');
      const store = transaction.objectStore(this.store_name);
      const request = store.get(key);

      request.onerror = () => reject('Error fetching data from IndexedDB');
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateData(new_data) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store_name, 'readwrite');
      const store = transaction.objectStore(this.store_name);
      const request = store.put(new_data);
      request.onerror = () => reject('Error updating data in IndexedDB');
      request.onsuccess = () => resolve('Data updated successfully');
    });
  }

  async deleteData(key) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store_name, 'readwrite');
      const store = transaction.objectStore(this.store_name);
      const request = store.delete(key);

      request.onerror = () => reject('Error deleting data from IndexedDB');
      request.onsuccess = () => resolve('Data deleted successfully');
    });
  }
}

const db_name = 'os_db';
const store_name = 'state';
export const idb = new Indexed_DB(db_name, store_name);
