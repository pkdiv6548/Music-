// Local Library page for Pulse Music
import { createMusicCard, createSectionHeader } from '../components/cards.js';
import { 
  importFiles, 
  importFromFolder, 
  removeSong, 
  removeSongs, 
  clearLibrary, 
  getLibraryStats,
  searchLocalSongs,
  sortLocalSongs,
  filterLocalSongs,
  getUniqueValues,
  getImportProgress,
  resetImportProgress,
} from '../importer.js';
import { getAllSongs, getContinueListening, getRecentlyPlayed, getFavorites } from '../db.js';
import { getPlaylists, savePlaylist, deletePlaylist, generateId } from '../storage.js';

export function renderLocalLibrary({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('section');
  card.className = 'card local-library-card';
  
  // Import section
  const importSection = document.createElement('div');
  importSection.className = 'import-section';
  importSection.innerHTML = `
    <div class="import-header">
      <h3>📥 Import Music</h3>
      <p>Add music from your device to your local library</p>
    </div>
    <div class="import-actions">
      <button class="btn btn-primary" id="browseFilesBtn">
        <span>📁</span> Browse Files
      </button>
      <button class="btn btn-secondary" id="browseFolderBtn">
        <span>📂</span> Browse Folder
      </button>
    </div>
    <div class="drop-zone" id="dropZone">
      <div class="drop-zone-content">
        <div class="drop-zone-icon">🎵</div>
        <h4>Drag & Drop Music Files</h4>
        <p>Drop MP3, WAV, OGG, AAC, M4A, or FLAC files here</p>
      </div>
    </div>
    <input type="file" id="fileInput" multiple accept="audio/*" style="display: none;" />
    <div class="import-progress" id="importProgress" style="display: none;">
      <div class="progress-header">
        <span class="progress-text">Importing...</span>
        <span class="progress-percentage" id="progressPercentage">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
    </div>
  `;
  card.appendChild(importSection);
  
  // Library management section
  const managementSection = document.createElement('div');
  managementSection.className = 'library-management';
  
  // Search and filters
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'library-controls';
  controlsDiv.innerHTML = `
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input type="text" id="librarySearch" placeholder="Search your library..." />
    </div>
    <div class="filter-controls">
      <select id="sortSelect">
        <option value="addedAt-desc">Recently Added</option>
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="artist-asc">Artist (A-Z)</option>
        <option value="album-asc">Album (A-Z)</option>
        <option value="duration-asc">Duration (Shortest)</option>
        <option value="duration-desc">Duration (Longest)</option>
      </select>
      <select id="filterArtist">
        <option value="">All Artists</option>
      </select>
      <select id="filterAlbum">
        <option value="">All Albums</option>
      </select>
    </div>
    <div class="action-buttons">
      <button class="btn btn-danger" id="clearLibraryBtn">Clear Library</button>
    </div>
  `;
  managementSection.appendChild(controlsDiv);
  card.appendChild(managementSection);
  
  // Storage info
  const storageInfo = document.createElement('div');
  storageInfo.className = 'storage-info';
  storageInfo.id = 'storageInfo';
  card.appendChild(storageInfo);
  
  // Songs list
  const songsSection = document.createElement('div');
  songsSection.className = 'local-songs-section';
  songsSection.id = 'localSongsSection';
  card.appendChild(songsSection);
  
  fragment.appendChild(card);
  
  // Initialize functionality
  setTimeout(async () => {
    await initializeLibrary();
  }, 100);
  
  async function initializeLibrary() {
    const localSongs = await getAllSongs();
    
    if (localSongs.length === 0) {
      songsSection.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3 class="empty-state-title">No Music in Library</h3>
          <p class="empty-state-description">Import music files to start building your local library.</p>
        </div>
      `;
    } else {
      await displaySongs(localSongs);
    }
    
    await updateStorageInfo();
    await populateFilters();
    setupEventListeners();
  }
  
  async function displaySongs(songsToDisplay) {
    songsSection.innerHTML = '';
    
    if (songsToDisplay.length === 0) {
      songsSection.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No Songs Found</h3>
          <p class="empty-state-description">Try adjusting your search or filters.</p>
        </div>
      `;
      return;
    }
    
    const header = createSectionHeader('Your Library', `${songsToDisplay.length} songs`);
    songsSection.appendChild(header);
    
    const songsList = document.createElement('div');
    songsList.className = 'local-songs-list';
    
    songsToDisplay.forEach((song) => {
      const songItem = createLocalSongItem(song, playSong, async () => {
        await removeSong(song.id);
        await initializeLibrary();
        showToast('Song removed from library', 'success');
      });
      songsList.appendChild(songItem);
    });
    
    songsSection.appendChild(songsList);
  }
  
  function createLocalSongItem(song, playSong, onRemove) {
    const item = document.createElement('div');
    item.className = 'local-song-item';
    item.innerHTML = `
      <img class="local-song-cover" src="${song.cover}" alt="${song.title}" />
      <div class="local-song-info">
        <p class="local-song-title">${song.title}</p>
        <p class="local-song-artist">${song.artist}</p>
        <p class="local-song-meta">${song.album} • ${song.durationFormatted || formatDuration(song.duration)}</p>
      </div>
      <div class="local-song-actions">
        <button class="btn btn-small btn-primary play-btn" data-song-id="${song.id}">▶</button>
        <button class="btn btn-small btn-danger remove-btn" data-song-id="${song.id}">✕</button>
      </div>
    `;
    
    item.querySelector('.play-btn').addEventListener('click', () => {
      const index = songs.findIndex(s => s.id === song.id);
      if (index >= 0) playSong(index);
    });
    
    item.querySelector('.remove-btn').addEventListener('click', async () => {
      if (confirm(`Remove "${song.title}" from your library?`)) {
        await onRemove();
      }
    });
    
    return item;
  }
  
  async function updateStorageInfo() {
    const stats = await getLibraryStats();
    const usage = await getStorageUsage();
    
    storageInfo.innerHTML = `
      <div class="storage-stats">
        <div class="storage-stat">
          <span class="storage-label">Songs:</span>
          <span class="storage-value">${stats.count}</span>
        </div>
        <div class="storage-stat">
          <span class="storage-label">Library Size:</span>
          <span class="storage-value">${stats.totalSizeFormatted}</span>
        </div>
        <div class="storage-stat">
          <span class="storage-label">Storage Used:</span>
          <span class="storage-value">${usage.usageMB} MB / ${usage.quotaMB} MB</span>
        </div>
      </div>
      <div class="storage-bar">
        <div class="storage-bar-fill" style="width: ${usage.percentage}%"></div>
      </div>
    `;
  }
  
  async function populateFilters() {
    const artists = await getUniqueValues('artist');
    const albums = await getUniqueValues('album');
    
    const artistSelect = document.getElementById('filterArtist');
    const albumSelect = document.getElementById('filterAlbum');
    
    artists.forEach(artist => {
      const option = document.createElement('option');
      option.value = artist;
      option.textContent = artist;
      artistSelect.appendChild(option);
    });
    
    albums.forEach(album => {
      const option = document.createElement('option');
      option.value = album;
      option.textContent = album;
      albumSelect.appendChild(option);
    });
  }
  
  function setupEventListeners() {
    // Browse files
    const browseFilesBtn = document.getElementById('browseFilesBtn');
    const fileInput = document.getElementById('fileInput');
    
    browseFilesBtn?.addEventListener('click', () => {
      fileInput?.click();
    });
    
    fileInput?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await handleImport(files);
      }
    });
    
    // Browse folder
    const browseFolderBtn = document.getElementById('browseFolderBtn');
    browseFolderBtn?.addEventListener('click', async () => {
      try {
        if ('showDirectoryPicker' in window) {
          const dirHandle = await window.showDirectoryPicker();
          const result = await importFromFolder(dirHandle, updateProgress);
          handleImportResult(result);
        } else {
          showToast('Folder selection not supported in this browser', 'error');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Folder selection error:', error);
          showToast('Failed to open folder', 'error');
        }
      }
    });
    
    // Drag and drop
    const dropZone = document.getElementById('dropZone');
    
    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    
    dropZone?.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    
    dropZone?.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        await handleImport(files);
      }
    });
    
    // Search
    const searchInput = document.getElementById('librarySearch');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        const query = e.target.value.trim();
        if (query.length > 0) {
          const results = await searchLocalSongs(query);
          await displaySongs(results);
        } else {
          const allSongs = await getAllSongs();
          await displaySongs(allSongs);
        }
      }, 300);
    });
    
    // Sort
    const sortSelect = document.getElementById('sortSelect');
    sortSelect?.addEventListener('change', async (e) => {
      const [sortBy, order] = e.target.value.split('-');
      const sorted = await sortLocalSongs(sortBy, order);
      await displaySongs(sorted);
    });
    
    // Filters
    const artistSelect = document.getElementById('filterArtist');
    const albumSelect = document.getElementById('filterAlbum');
    
    artistSelect?.addEventListener('change', async () => {
      await applyFilters();
    });
    
    albumSelect?.addEventListener('change', async () => {
      await applyFilters();
    });
    
    // Clear library
    const clearLibraryBtn = document.getElementById('clearLibraryBtn');
    clearLibraryBtn?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear your entire library? This cannot be undone.')) {
        const result = await clearLibrary();
        if (result.success) {
          showToast('Library cleared', 'success');
          await initializeLibrary();
        } else {
          showToast('Failed to clear library', 'error');
        }
      }
    });
  }
  
  async function handleImport(files) {
    const progressDiv = document.getElementById('importProgress');
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    
    progressDiv.style.display = 'block';
    
    const result = await importFiles(files, (progress) => {
      const percentage = progress.percentage || 0;
      progressFill.style.width = `${percentage}%`;
      progressPercentage.textContent = `${percentage}%`;
    });
    
    handleImportResult(result);
  }
  
  async function handleImportResult(result) {
    const progressDiv = document.getElementById('importProgress');
    
    if (result.success) {
      showToast(result.message, 'success');
      await initializeLibrary();
    } else {
      showToast(result.message, 'error');
    }
    
    setTimeout(() => {
      progressDiv.style.display = 'none';
    }, 2000);
  }
  
  function updateProgress(progress) {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (progressFill && progressPercentage) {
      const percentage = progress.percentage || 0;
      progressFill.style.width = `${percentage}%`;
      progressPercentage.textContent = `${percentage}%`;
    }
  }
  
  async function applyFilters() {
    const artist = document.getElementById('filterArtist')?.value;
    const album = document.getElementById('filterAlbum')?.value;
    
    const filters = {};
    if (artist) filters.artist = artist;
    if (album) filters.album = album;
    
    let filtered = await filterLocalSongs(filters);
    
    // Apply current sort
    const sortValue = document.getElementById('sortSelect')?.value || 'addedAt-desc';
    const [sortBy, order] = sortValue.split('-');
    filtered = await sortLocalSongs(sortBy, order);
    
    await displaySongs(filtered);
  }
  
  function showToast(message, type = 'info') {
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
  
  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
  
  async function getStorageUsage() {
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
  
  return fragment;
}

// Re-export functions
export { getImportProgress, resetImportProgress } from '../importer.js';