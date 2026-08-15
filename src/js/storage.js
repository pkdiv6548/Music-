// Local Storage utility module for Pulse Music
const KEYS = {
  FAVORITES: 'pulse_favorites',
  RECENTLY_PLAYED: 'pulse_recently_played',
  HISTORY: 'pulse_history',
  THEME: 'pulse_theme',
  SETTINGS: 'pulse_settings',
};

function safeGet(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
}

// Favorites
export function getFavorites() {
  return safeGet(KEYS.FAVORITES, []);
}

export function isFavorite(songId) {
  return getFavorites().includes(songId);
}

export function toggleFavorite(songId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(songId);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift(songId);
  }
  safeSet(KEYS.FAVORITES, favorites);
  return index < 0;
}

export function removeFavorite(songId) {
  const favorites = getFavorites().filter((id) => id !== songId);
  safeSet(KEYS.FAVORITES, favorites);
}

// Recently Played
export function getRecentlyPlayed() {
  return safeGet(KEYS.RECENTLY_PLAYED, []);
}

export function addRecentlyPlayed(songId) {
  const recent = getRecentlyPlayed().filter((id) => id !== songId);
  recent.unshift(songId);
  safeSet(KEYS.RECENTLY_PLAYED, recent.slice(0, 20));
}

// History
export function getHistory() {
  return safeGet(KEYS.HISTORY, []);
}

export function addToHistory(songId) {
  const history = getHistory();
  history.unshift({
    songId,
    timestamp: Date.now(),
  });
  safeSet(KEYS.HISTORY, history.slice(0, 100));
}

export function clearHistory() {
  safeSet(KEYS.HISTORY, []);
}

// Theme
export function getTheme() {
  return safeGet(KEYS.THEME, 'dark');
}

export function saveTheme(theme) {
  safeSet(KEYS.THEME, theme);
}

// Settings
export function getSettings() {
  return safeGet(KEYS.SETTINGS, {});
}

export function saveSettings(settings) {
  safeSet(KEYS.SETTINGS, settings);
}

// Generate unique ID
export function generateId() {
  return `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
