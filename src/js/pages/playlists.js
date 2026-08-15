import { createPlaylistCard, createSectionHeader } from '../components/cards.js';
import { getPlaylists, savePlaylist, deletePlaylist, generateId } from '../storage.js';

export function renderPlaylists({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('section');
  card.className = 'card playlists-card';
  
  // Create playlist form
  const form = document.createElement('div');
  form.className = 'playlist-form';
  form.innerHTML = `
    <input 
      type="text" 
      class="search-field" 
      id="playlistNameInput" 
      placeholder="Create new playlist..." 
      maxlength="50"
    />
    <button class="btn btn-primary" id="createPlaylistBtn">+ Create</button>
  `;
  card.appendChild(form);
  
  // Get playlists
  const playlists = getPlaylists();
  
  if (playlists.length === 0) {
    card.innerHTML += `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">No Playlists Yet</h3>
        <p class="empty-state-description">Create your first playlist to organize your favorite tracks.</p>
      </div>
    `;
  } else {
    const header = createSectionHeader('Your Playlists', `${playlists.length} playlists`);
    card.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'playlist-list stagger-children';
    
    playlists.forEach((playlist) => {
      const playlistCard = createPlaylistCard({
        title: playlist.name,
        cover: playlist.cover || songs[0]?.cover || 'assets/images/cover-01.svg',
        songCount: playlist.songs?.length || 0,
        description: playlist.description || 'Custom playlist',
        onPlay: () => {
          if (playlist.songs && playlist.songs.length > 0) {
            const firstSongId = playlist.songs[0];
            const index = songs.findIndex((s) => s.id === firstSongId);
            if (index >= 0) playSong(index);
          }
        },
      });
      
      // Add delete button
      const actions = document.createElement('div');
      actions.className = 'playlist-actions';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'view-btn playlist-delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${playlist.name}"?`)) {
          deletePlaylist(playlist.id);
          renderPlaylists({ songs, createSongListItem, playSong });
        }
      });
      
      actions.appendChild(deleteBtn);
      playlistCard.appendChild(actions);
      
      grid.appendChild(playlistCard);
    });
    
    card.appendChild(grid);
  }
  
  // Initialize form functionality
  setTimeout(() => {
    const nameInput = document.getElementById('playlistNameInput');
    const createBtn = document.getElementById('createPlaylistBtn');
    
    if (nameInput && createBtn) {
      const createPlaylist = () => {
        const name = nameInput.value.trim();
        if (!name) {
          showToast('Please enter a playlist name', 'error');
          return;
        }
        
        const playlist = {
          id: generateId(),
          name: name,
          songs: [],
          cover: songs[0]?.cover || 'assets/images/cover-01.svg',
          description: 'Custom playlist',
          createdAt: Date.now(),
        };
        
        savePlaylist(playlist);
        nameInput.value = '';
        showToast(`Playlist "${name}" created!`, 'success');
        
        // Refresh the page
        const currentPage = window.location.hash.replace(/^#\/?/, '') || 'playlists';
        setActivePage(currentPage);
      };
      
      createBtn.addEventListener('click', createPlaylist);
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createPlaylist();
      });
    }
  }, 100);
  
  fragment.appendChild(card);
  return fragment;
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

function setActivePage(page) {
  window.location.hash = `/${page}`;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}