import { createMusicCard, createSectionHeader } from '../components/cards.js';
import { getRecentlyPlayed } from '../storage.js';

export function renderRecentlyPlayed({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('section');
  card.className = 'card section-card';
  
  const recentIds = getRecentlyPlayed();
  const recentSongs = recentIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean);
  
  if (recentSongs.length === 0) {
    card.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🕐</div>
        <h3 class="empty-state-title">No Recent Plays</h3>
        <p class="empty-state-description">Songs you play will appear here for quick access.</p>
      </div>
    `;
  } else {
    const header = createSectionHeader('Recently Played', `${recentSongs.length} songs`);
    card.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'card-grid stagger-children';
    
    recentSongs.forEach((song) => {
      const index = songs.findIndex((s) => s.id === song.id);
      grid.appendChild(createMusicCard({ song, index, playSong }));
    });
    
    card.appendChild(grid);
  }
  
  fragment.appendChild(card);
  return fragment;
}