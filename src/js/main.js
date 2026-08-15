import { renderHome } from './pages/home.js';
import { renderSearch } from './pages/search.js';
import { renderLibrary } from './pages/library.js';
import { renderAbout } from './pages/about.js';
import { renderFavorites } from './pages/favorites.js';
import { renderRecentlyPlayed } from './pages/recently-played.js';
import { renderContinueListening } from './pages/continue-listening.js';
import { renderPlaylists } from './pages/playlists.js';
import { renderHistory } from './pages/history.js';
import { renderLocalLibrary } from './pages/local-library.js';
import { renderNotFound } from './pages/not-found.js';
import { createSongListItem } from './components/song-item.js';
import { createSkeletonGrid } from './components/skeleton.js';
import { loadSongs as fetchSongs, createAudioSource } from './data.js';
import {
  getTheme,
  saveTheme,
  addRecentlyPlayed,
  addToHistory,
} from './storage.js';
import { 
  initDB, 
  getAllSongs, 
  restoreLibrary,
  saveContinueListeningEntry,
  getContinueListening as getContinueListeningFromDB,
  deleteContinueListeningEntry,
} from './db.js';

const pageContent = document.getElementById('pageContent');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const pageTitle = document.getElementById('pageTitle');
const onlineStatus = document.getElementById('onlineStatus');
const errorToast = document.getElementById('errorToast');
const progressRange = document.getElementById('progressRange');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const playPauseButton = document.getElementById('playPauseButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const shuffleButton = document.getElementById('shuffleButton');
const repeatButton = document.getElementById('repeatButton');
const muteButton = document.getElementById('muteButton');
const volumeRange = document.getElementById('volumeRange');
const speedSelect = document.getElementById('speedSelect');
const miniToggle = document.getElementById('miniToggle');
const autoplayButton = document.getElementById('autoplayButton');
const lyricsToggleButton = document.getElementById('lyricsToggleButton');
const queueToggleButton = document.getElementById('queueToggleButton');
const queueList = document.getElementById('queueList');
const queueResetButton = document.getElementById('queueResetButton');
const lyricsPanel = document.getElementById('lyricsPanel');
const lyricsContent = document.getElementById('lyricsContent');
const playerBar = document.getElementById('playerBar');
const visualizer = document.getElementById('visualizer');
const playerPanel = document.getElementById('playerPanel');
const fullscreenButton = document.getElementById('fullscreenButton');
const sleepTimerButton = document.getElementById('sleepTimerButton');
const floatingMiniPlayer = document.getElementById('floatingMiniPlayer');
const floatingCover = document.getElementById('floatingCover');
const floatingTitle = document.getElementById('floatingTitle');
const floatingArtist = document.getElementById('floatingArtist');
const floatingPlayBtn = document.getElementById('floatingPlayBtn');

let songs = [];
let queue = [];
let activeIndex = 0;
let audio = new Audio();
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'off';
let isMuted = false;
let autoplay = true;
let currentPage = 'home';
let toastTimer = null;
let renderTimer = null;
let lastSaveTime = 0;
let sleepTimer = null;
let sleepTimerDuration = 0;

const lyricsLibrary = {
  'song-01': `Verse 1\nCaught in the pulse of the neon sky\nMoving through the night without asking why\nChorus\nLights in the distance, we follow the beat\nRhythm of the city, our hearts in sync`,
  'song-02': `Verse 1\nMoonlit groove in every step we take\nDrifting through the night, no chance to break\nChorus\nClose your eyes and push through the haze\nSoundtrack of our secret midnight phase`,
  'song-03': `Verse 1\nCity horizon lights the road ahead\nEchoes of the future are inside our heads\nChorus\nFloating on the sound, bright electric flow\nEvery moment feels like a cinematic show`,
  'song-04': `Verse 1\nAurora whispers through the darkened sea\nWaves of light become a melody\nChorus\nHold on to the glow, the colors will ignite\nFeel the warmth between the stars tonight`,
};

const pageMap = {
  home: renderHome,
  search: renderSearch,
  library: renderLibrary,
  about: renderAbout,
  favorites: renderFavorites,
  'recently-played': renderRecentlyPlayed,
  'continue-listening': renderContinueListening,
  playlists: renderPlaylists,
  history: renderHistory,
  'local-library': renderLocalLibrary,
};

const pageTitles = {
  home: 'Home',
  search: 'Search',
  library: 'Library',
  about: 'About',
  favorites: 'Favorites',
  'recently-played': 'Recently Played',
  'continue-listening': 'Continue Listening',
  playlists: 'Playlists',
  history: 'History',
  'local-library': 'Local Library',
};

function getPageFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return 'home';
  return hash in pageMap ? hash : 'not-found';
}

// Error handling
function showError(message) {
  errorToast.textContent = message;
  errorToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    errorToast.classList.remove('show');
  }, 4000);
}

window.addEventListener('error', (event) => {
  showError('Something went wrong. Please try again.');
  console.error('Global error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  showError('A network or data error occurred.');
  console.error('Unhandled rejection:', event.reason);
});

// Online/offline status
function updateOnlineStatus() {
  const online = navigator.onLine;
  onlineStatus.textContent = online ? 'Online' : 'Offline';
  onlineStatus.classList.toggle('offline', !online);
  if (!online) {
    showError('You are offline. Playing cached content.');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Service worker registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    });
  }
}

async function loadSongs() {
  try {
    songs = await fetchSongs();
    songs.forEach(createAudioSource);
    queue = songs.map((_, index) => index);
  } catch (error) {
    console.error('Failed to load songs:', error);
    showError('Failed to load songs. Please refresh.');
  }
}

function setActivePage(page) {
  currentPage = page;
  
  // Update active states efficiently
  const activeClass = 'active';
  navLinks.forEach((button) => {
    button.classList.toggle(activeClass, button.dataset.page === page);
  });
  mobileLinks.forEach((button) => {
    button.classList.toggle(activeClass, button.dataset.page === page);
  });

  pageTitle.textContent = pageTitles[page] || 'Pulse Music';

  // Show skeleton while rendering
  pageContent.innerHTML = '';
  pageContent.appendChild(createSkeletonGrid(8));

  // Cancel any pending render
  clearTimeout(renderTimer);

  // Render after a short delay for smooth animation
  renderTimer = setTimeout(() => {
    if (currentPage !== page) return;
    try {
      const renderFn = pageMap[page] || renderNotFound;
      pageContent.innerHTML = '';
      const content = renderFn({ songs, createSongListItem, playSong, activeIndex });
      pageContent.appendChild(content);
      pageContent.classList.add('page-enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pageContent.classList.remove('page-enter');
        });
      });
      
      // Initialize scroll reveal animations
      initScrollReveal();
    } catch (error) {
      console.error('Error rendering page:', error);
      pageContent.innerHTML = '';
      pageContent.appendChild(renderNotFound());
      showError('Could not load this page.');
    }
  }, 150);

  // Close sidebar on mobile
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    sidebarOverlay.classList.remove('active');
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  const theme = isLight ? 'light' : 'dark';
  saveTheme(theme);
  themeLabel.textContent = isLight ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
}

function applyTheme() {
  const theme = getTheme();
  const isLight = theme === 'light';
  document.body.classList.toggle('light', isLight);
  themeLabel.textContent = isLight ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
}

function formatTime(value) {
  if (!Number.isFinite(value)) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const trackCover = document.getElementById('trackCover');

const audioCache = new Map();

async function updatePlayerInfo() {
  const song = songs[activeIndex];
  if (!song) {
    trackTitle.textContent = 'Select a song';
    trackArtist.textContent = 'Pulse Music Player';
    trackCover.src = 'assets/images/cover-01.svg';
    setLyrics();
    updateQueueUI();
    updateFloatingPlayer();
    return;
  }
  trackTitle.textContent = song.title || 'Select a song';
  trackArtist.textContent = song.artist || 'Pulse Music Player';
  trackCover.src = song.cover || 'assets/images/cover-01.svg';
  
  // Use cached audio source if available
  if (!audioCache.has(song.id)) {
    audioCache.set(song.id, createAudioSource(song));
  }
  audio.src = audioCache.get(song.id);
  audio.load();
  setLyrics(song.id);
  updateQueueUI();
  updateFloatingPlayer();

  // Resume from continue listening position after metadata loads
  const saved = await getContinueListeningFromDB(song.id);
  if (saved && saved.position > 5 && saved.position < saved.duration - 5) {
    const resumeFrom = saved.position;
    const handleMetadata = () => {
      audio.currentTime = resumeFrom;
      audio.removeEventListener('loadedmetadata', handleMetadata);
    };
    audio.addEventListener('loadedmetadata', handleMetadata);
  }
}

function updateFloatingPlayer() {
  const song = songs[activeIndex];
  if (!song) {
    floatingTitle.textContent = 'Select a song';
    floatingArtist.textContent = 'Pulse Music';
    floatingCover.src = 'assets/images/cover-01.svg';
    return;
  }
  floatingTitle.textContent = song.title;
  floatingArtist.textContent = song.artist;
  floatingCover.src = song.cover;
}

function setLyrics(songId) {
  const lyrics = lyricsLibrary[songId] || 'Lyrics are not available for this track yet.';
  lyricsContent.textContent = lyrics;
}

function playSong(index) {
  if (!songs.length || index < 0 || index >= songs.length) return;
  activeIndex = index;
  const song = songs[index];
  updatePlayerInfo();
  // Track recently played and history
  addRecentlyPlayed(song.id);
  addToHistory(song.id);
  audio.play().then(() => {
    isPlaying = true;
    playPauseButton.textContent = '⏸';
    animateVisualizer(true);
    trackCover.classList.add('playing');
  }).catch((error) => {
    console.error('Playback error:', error);
    playPauseButton.textContent = '▶';
    showError('Playback failed. Try another track.');
  });
}

function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play().catch((error) => {
      console.error('Play error:', error);
      showError('Could not start playback.');
    });
    isPlaying = true;
    playPauseButton.textContent = '⏸';
    animateVisualizer(true);
    trackCover.classList.add('playing');
  } else {
    audio.pause();
    isPlaying = false;
    playPauseButton.textContent = '▶';
    animateVisualizer(false);
    trackCover.classList.remove('playing');
  }
}

function goPrevious() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  if (isShuffle) {
    playSong(getShuffleIndex());
    return;
  }
  const current = queue.indexOf(activeIndex);
  const prevIndex = current > 0 ? queue[current - 1] : queue[queue.length - 1];
  playSong(prevIndex);
}

function goNext() {
  if (isShuffle) {
    playSong(getShuffleIndex());
    return;
  }
  const current = queue.indexOf(activeIndex);
  const nextIndex = current < queue.length - 1 ? queue[current + 1] : queue[0];
  playSong(nextIndex);
}

function getShuffleIndex() {
  if (songs.length < 2) return activeIndex;
  let next = activeIndex;
  while (next === activeIndex) {
    next = Math.floor(Math.random() * songs.length);
  }
  return next;
}

async function syncProgress() {
  if (!audio.duration || Number.isNaN(audio.duration)) return;
  progressRange.value = (audio.currentTime / audio.duration) * 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationTimeEl.textContent = formatTime(audio.duration);

  // Save continue listening position periodically
  const song = songs[activeIndex];
  const now = Date.now();
  if (song && audio.currentTime > 5 && now - lastSaveTime > 5000) {
    lastSaveTime = now;
    await saveContinueListeningEntry({
      songId: song.id,
      position: audio.currentTime,
      duration: audio.duration,
      timestamp: Date.now(),
    });
  }
}

function seekAudio(event) {
  if (!audio.duration) return;
  audio.currentTime = (Number(event.target.value) / 100) * audio.duration;
}

function toggleMute() {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteButton.textContent = isMuted ? '🔇' : '🔊';
  muteButton.setAttribute('aria-pressed', String(isMuted));
}

function updateVolume(event) {
  audio.volume = Number(event.target.value);
  if (audio.volume === 0) {
    isMuted = true;
    audio.muted = true;
    muteButton.textContent = '🔇';
  } else {
    isMuted = false;
    audio.muted = false;
    muteButton.textContent = '🔊';
  }
  muteButton.setAttribute('aria-pressed', String(isMuted));
}

function setPlaybackSpeed(event) {
  audio.playbackRate = Number(event.target.value);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleButton.setAttribute('aria-pressed', String(isShuffle));
  showToast(isShuffle ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
}

function cycleRepeatMode() {
  repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
  repeatButton.dataset.repeat = repeatMode;
  repeatButton.setAttribute('aria-pressed', String(repeatMode !== 'off'));
  repeatButton.textContent = repeatMode === 'off' ? '🔁' : repeatMode === 'all' ? '🔁' : '🔂';
  const messages = { off: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
  showToast(messages[repeatMode], 'info');
}

function toggleAutoPlay() {
  autoplay = !autoplay;
  autoplayButton.setAttribute('aria-pressed', String(autoplay));
  showToast(autoplay ? 'Autoplay on' : 'Autoplay off', 'info');
}

function toggleLyricsPanel() {
  const isOpen = lyricsToggleButton.getAttribute('aria-pressed') === 'true';
  lyricsToggleButton.setAttribute('aria-pressed', String(!isOpen));
  lyricsPanel.classList.toggle('active', !isOpen);
  playerPanel.classList.add('active');
}

function toggleQueuePanel() {
  const isOpen = queueToggleButton.getAttribute('aria-pressed') === 'true';
  queueToggleButton.setAttribute('aria-pressed', String(!isOpen));
  playerPanel.classList.toggle('active', !isOpen);
}

function toggleMiniPlayer() {
  playerBar.classList.toggle('mini-mode');
  miniToggle.textContent = playerBar.classList.contains('mini-mode') ? 'Full' : 'Mini';
  floatingMiniPlayer.classList.toggle('active', playerBar.classList.contains('mini-mode'));
}

function toggleFullscreen() {
  // Create fullscreen player if it doesn't exist
  let fullscreenPlayer = document.querySelector('.fullscreen-player');
  if (!fullscreenPlayer) {
    fullscreenPlayer = createFullscreenPlayer();
    document.body.appendChild(fullscreenPlayer);
  }
  fullscreenPlayer.classList.toggle('active');
}

function createFullscreenPlayer() {
  const player = document.createElement('div');
  player.className = 'fullscreen-player';
  player.innerHTML = `
    <div class="fullscreen-player-header">
      <button class="fullscreen-player-close" aria-label="Close full screen">✕</button>
    </div>
    <div class="fullscreen-player-content">
      <img class="fullscreen-cover" id="fullscreenCover" src="assets/images/cover-01.svg" alt="Album cover" />
      <div class="fullscreen-info">
        <h2 class="fullscreen-title" id="fullscreenTitle">Select a song</h2>
        <p class="fullscreen-artist" id="fullscreenArtist">Pulse Music</p>
      </div>
      <div class="fullscreen-controls">
        <button class="player-btn" id="fsPrevButton" aria-label="Previous">⏮</button>
        <button class="player-btn play-pause" id="fsPlayPauseButton" aria-label="Play">▶</button>
        <button class="player-btn" id="fsNextButton" aria-label="Next">⏭</button>
      </div>
    </div>
  `;
  
  const closeBtn = player.querySelector('.fullscreen-player-close');
  closeBtn.addEventListener('click', () => player.classList.remove('active'));
  
  const fsPlayPause = player.querySelector('#fsPlayPauseButton');
  fsPlayPause.addEventListener('click', togglePlay);
  
  player.querySelector('#fsPrevButton').addEventListener('click', goPrevious);
  player.querySelector('#fsNextButton').addEventListener('click', goNext);
  
  return player;
}

function showSleepTimerOptions() {
  const options = [
    { label: 'Off', value: 0 },
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 },
    { label: '1 hour', value: 60 },
  ];
  
  const message = options.map(opt => `${opt.label}${opt.value === sleepTimerDuration ? ' ✓' : ''}`).join('\n');
  const selected = prompt(`Sleep Timer (minutes):\n\n${message}\n\nEnter minutes or 0 to cancel:`, sleepTimerDuration || '');
  
  if (selected !== null) {
    const minutes = parseInt(selected, 10);
    if (minutes > 0) {
      setSleepTimer(minutes);
    } else {
      clearSleepTimer();
    }
  }
}

function setSleepTimer(minutes) {
  clearSleepTimer();
  sleepTimerDuration = minutes;
  sleepTimerButton.classList.add('active');
  showToast(`Sleep timer set for ${minutes} minutes`, 'info');
  
  sleepTimer = setTimeout(() => {
    audio.pause();
    isPlaying = false;
    playPauseButton.textContent = '▶';
    animateVisualizer(false);
    trackCover.classList.remove('playing');
    clearSleepTimer();
    showToast('Sleep timer ended. Playback paused.', 'info');
  }, minutes * 60 * 1000);
}

function clearSleepTimer() {
  if (sleepTimer) {
    clearTimeout(sleepTimer);
    sleepTimer = null;
  }
  sleepTimerDuration = 0;
  sleepTimerButton.classList.remove('active');
}

function updateQueueUI() {
  const fragment = document.createDocumentFragment();
  queue.forEach((index) => {
    const song = songs[index];
    if (!song) return;
    const item = document.createElement('div');
    item.className = `queue-item${index === activeIndex ? ' active' : ''}`;
    item.innerHTML = `<span>${song.title}</span><span>${song.artist}</span>`;
    item.addEventListener('click', () => playSong(index));
    fragment.appendChild(item);
  });
  queueList.innerHTML = '';
  queueList.appendChild(fragment);
}

function resetQueue() {
  queue = songs.map((_, index) => index);
  updateQueueUI();
  showToast('Queue reset', 'info');
}

function animateVisualizer(active) {
  visualizer.querySelectorAll('.bar').forEach((bar) => {
    bar.style.animationPlayState = active ? 'running' : 'paused';
    if (active) {
      bar.style.height = `${20 + Math.random() * 60}px`;
    }
  });
}

function showToast(message, type = 'info') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    z-index: 200;
    animation: toastSlideIn 0.3s ease;
    max-width: 300px;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('active');
    }
  });
}

function handleKeyboardShortcuts(event) {
  const activeElement = document.activeElement;
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(activeElement.tagName)) return;
  switch (event.code) {
    case 'Space':
      event.preventDefault();
      togglePlay();
      break;
    case 'ArrowRight':
      goNext();
      break;
    case 'ArrowLeft':
      goPrevious();
      break;
    case 'ArrowUp':
      event.preventDefault();
      volumeRange.value = Math.min(1, Number(volumeRange.value) + 0.05).toFixed(2);
      updateVolume({ target: volumeRange });
      break;
    case 'ArrowDown':
      event.preventDefault();
      volumeRange.value = Math.max(0, Number(volumeRange.value) - 0.05).toFixed(2);
      updateVolume({ target: volumeRange });
      break;
    case 'KeyM':
      toggleMute();
      break;
    case 'KeyS':
      toggleShuffle();
      break;
    case 'KeyR':
      cycleRepeatMode();
      break;
    case 'KeyF':
      toggleFullscreen();
      break;
    case 'KeyL':
      toggleLyricsPanel();
      break;
    case 'KeyQ':
      toggleQueuePanel();
      break;
  }
}

async function handleEnded() {
  const song = songs[activeIndex];
  if (song) {
    await deleteContinueListeningEntry(song.id);
  }
  switch (repeatMode) {
    case 'one':
      audio.currentTime = 0;
      audio.play();
      return;
    case 'all':
      goNext();
      return;
    default:
      if (isShuffle) {
        playSong(getShuffleIndex());
        return;
      }
      const current = queue.indexOf(activeIndex);
      if (current < queue.length - 1) {
        playSong(queue[current + 1]);
      } else if (autoplay) {
        playSong(queue[0]);
      } else {
        isPlaying = false;
        playPauseButton.textContent = '▶';
        animateVisualizer(false);
        trackCover.classList.remove('playing');
      }
  }
}

menuToggle.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  sidebarOverlay.classList.toggle('active', isOpen);
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  sidebarOverlay.classList.remove('active');
});

themeToggle.addEventListener('click', toggleTheme);
playPauseButton.addEventListener('click', togglePlay);
prevButton.addEventListener('click', goPrevious);
nextButton.addEventListener('click', goNext);
progressRange.addEventListener('input', seekAudio);
volumeRange.addEventListener('input', updateVolume);
speedSelect.addEventListener('change', setPlaybackSpeed);
shuffleButton.addEventListener('click', toggleShuffle);
repeatButton.addEventListener('click', cycleRepeatMode);
muteButton.addEventListener('click', toggleMute);
autoplayButton.addEventListener('click', toggleAutoPlay);
lyricsToggleButton.addEventListener('click', toggleLyricsPanel);
queueToggleButton.addEventListener('click', toggleQueuePanel);
miniToggle.addEventListener('click', toggleMiniPlayer);
queueResetButton.addEventListener('click', resetQueue);
fullscreenButton.addEventListener('click', toggleFullscreen);
sleepTimerButton.addEventListener('click', showSleepTimerOptions);
floatingPlayBtn.addEventListener('click', togglePlay);
floatingMiniPlayer.addEventListener('click', (e) => {
  if (e.target !== floatingPlayBtn) {
    playerBar.classList.remove('mini-mode');
    floatingMiniPlayer.classList.remove('active');
  }
});

audio.addEventListener('timeupdate', syncProgress);
audio.addEventListener('loadedmetadata', syncProgress);
audio.addEventListener('ended', handleEnded);

window.addEventListener('keydown', handleKeyboardShortcuts);
window.addEventListener('scroll', initScrollReveal);

// Handle navigation events (e.g. from 404 page)
window.addEventListener('navigate', (event) => {
  const page = event.detail;
  window.location.hash = `/${page}`;
  setActivePage(page);
});

[...navLinks, ...mobileLinks].forEach((button) => {
  button.addEventListener('click', () => {
    window.location.hash = `/${button.dataset.page}`;
    setActivePage(button.dataset.page);
  });
});

window.addEventListener('hashchange', () => {
  setActivePage(getPageFromHash());
});

window.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  updateOnlineStatus();
  registerServiceWorker();

  // Initialize IndexedDB
  await initDB();
  
  // Load sample songs
  await loadSongs();
  
  // Restore local library from IndexedDB
  const localSongs = await restoreLibrary();
  if (localSongs.length > 0) {
    // Merge local songs with sample songs
    const existingIds = new Set(songs.map(s => s.id));
    const newLocalSongs = localSongs.filter(s => !existingIds.has(s.id));
    songs = [...songs, ...newLocalSongs];
    
    // Create audio sources for local songs
    newLocalSongs.forEach(song => {
      if (!song.sourceUrl) {
        song.sourceUrl = createAudioSource(song);
      }
    });
  }
  
  // Update queue
  queue = songs.map((_, index) => index);
  
  if (songs.length) {
    updatePlayerInfo();
  }
  setActivePage(getPageFromHash());
  volumeRange.value = '0.8';
  audio.volume = 0.8;
  autoplayButton.setAttribute('aria-pressed', 'true');
  repeatButton.textContent = '🔁';
  shuffleButton.setAttribute('aria-pressed', 'false');
  
  // Initialize scroll reveal
  setTimeout(initScrollReveal, 100);
});
