// IndexedDB storage layer for Pulse Music
const DB_NAME = 'PulseMusicDB';
const DB_VERSION = 1;

let db = null;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Songs store
      if (!database.objectStoreNames.contains('songs')) {
        const songsStore = database.createObjectStore('songs', { keyPath: 'id' });
        songsStore.createIndex('title', 'title', { unique: false });
        songsStore.createIndex('artist', 'artist', { unique: false });
        songsStore.createIndex('album', 'album', { unique: false });
        songsStore.createIndex('addedAt', 'addedAt', { unique: false });
      }
      
      // Playlists store
      if (!database.objectStoreNames.contains('playlists')) {
        const playlistsStore = database.createObjectStore('playlists', { keyPath: 'id' });
        playlistsStore.createIndex('name', 'name', { unique: false });
        playlistsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      // Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
      
      // Continue listening store
      if (!database.objectStoreNames.contains('continueListening')) {
        const continueStore = database.createObjectStore('continueListening', { keyPath: 'songId' });
        continueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getStore(storeName, mode = 'readonly') {
  if (!db) throw new Error('Database not initialized');
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Songs operations
export async function getAllSongs() {
  const store = getStore('songs');
  return promisifyRequest(store.getAll());
}

export async function getSong(id) {
  const store = getStore('songs');
  return promisifyRequest(store.get(id));
}

export async function saveSong(song) {
  const store = getStore('songs', 'readwrite');
  return promisifyRequest(store.put(song));
}

export async function saveSongs(songs) {
  const store = getStore('songs', 'readwrite');
  const promises = songs.map(song => promisifyRequest(store.put(song)));
  return Promise.all(promises);
}

export async function deleteSong(id) {
  const store = getStore('songs', 'readwrite');
  return promisifyRequest(store.delete(id));
}

export async function deleteSongs(ids) {
  const store = getStore('songs', 'readwrite');
  const promises = ids.map(id => promisifyRequest(store.delete(id)));
  return Promise.all(promises);
}

export async function clearAllSongs() {
  const store = getStore('songs', 'readwrite');
  return promisifyRequest(store.clear());
}

export async function getSongsCount() {
  const store = getStore('songs');
  return promisifyRequest(store.count());
}

// Playlists operations
export async function getAllPlaylists() {
  const store = getStore('playlists');
  return promisifyRequest(store.getAll());
}

export async function getPlaylist(id) {
  const store = getStore('playlists');
  return promisifyRequest(store.get(id));
}

export async function savePlaylist(playlist) {
  const store = getStore('playlists', 'readwrite');
  return promisifyRequest(store.put(playlist));
}

export async function deletePlaylist(id) {
  const store = getStore('playlists', 'readwrite');
  return promisifyRequest(store.delete(id));
}

export async function clearAllPlaylists() {
  const store = getStore('playlists', 'readwrite');
  return promisifyRequest(store.clear());
}

// Settings operations
export async function getSetting(key) {
  const store = getStore('settings');
  const result = await promisifyRequest(store.get(key));
  return result?.value;
}

export async function setSetting(key, value) {
  const store = getStore('settings', 'readwrite');
  return promisifyRequest(store.put({ key, value }));
}

// Continue listening operations
export async function getAllContinueListening() {
  const store = getStore('continueListening');
  return promisifyRequest(store.getAll());
}

export async function saveContinueListeningEntry(entry) {
  const store = getStore('continueListening', 'readwrite');
  return promisifyRequest(store.put(entry));
}

export async function deleteContinueListeningEntry(songId) {
  const store = getStore('continueListening', 'readwrite');
  return promisifyRequest(store.delete(songId));
}

export async function clearAllContinueListening() {
  const store = getStore('continueListening', 'readwrite');
  return promisifyRequest(store.clear());
}

// Storage usage
export async function getStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      usageMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2),
      quotaMB: ((estimate.quota || 0) / (1024 * 1024)).toFixed(2),
      percentage: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0,
    };
  }
  return { usage: 0, quota: 0, usageMB: '0', quotaMB: '0', percentage: 0 };
}

// Initialize database
export async function initDB() {
  await openDatabase();
}

export { db };