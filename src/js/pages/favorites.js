import { createMusicCard, createSectionHeader } from '../components/cards.js';
import { getFavorites } from '../storage.js';

export function renderFavorites({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const favoritesCard = document.createElement('section');
  favoritesCard.className = 'card favorites-card';
  
  const favIds = getFavorites();
  const favSongs = favIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean);
  
  if (favSongs.length === 0) {
    favoritesCard.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❤️</div>
        <h3 class="empty-state-title">No Favorites Yet</h3>
        <p class="empty-state-description">Start adding songs to your favorites by clicking the heart icon on any track.</p>
      </div>
    `;
  } else {
    const header = createSectionHeader('Your Favorite Songs', `${favSongs.length} songs`);
    favoritesCard.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'card-grid stagger-children';
    
    favSongs.forEach((song) => {
      const index = songs.findIndex((s) => s.id === song.id);
      grid.appendChild(createMusicCard({ song, index, playSong }));
    });
    
    favoritesCard.appendChild(grid);
  }
  
  fragment.appendChild(favoritesCard);
  return fragment;
}