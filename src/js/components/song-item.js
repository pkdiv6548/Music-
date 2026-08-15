import { formatPlays } from '../data.js';
import { isFavorite, toggleFavorite, getFavorites } from '../storage.js';

export function createSongListItem({ song, index, playSong }) {
  const item = document.createElement('article');
  item.className = 'song-item';
  const fav = isFavorite(song.id);
  item.innerHTML = `
    <img class="song-cover" src="${song.cover}" alt="${song.title} cover" loading="lazy" />
    <div class="song-details">
      <p class="song-title">${song.title}</p>
      <p class="song-artist">${song.artist}</p>
      <p class="song-meta">${song.album} • ${song.duration} • ${formatPlays(song.plays)} plays</p>
    </div>
    <div class="song-tags">
      <span class="song-genre">${song.genre}</span>
      <span class="song-year">${song.year}</span>
    </div>
    <div class="song-actions">
      <button class="fav-btn${fav ? ' active' : ''}" type="button" aria-label="${fav ? 'Remove from' : 'Add to'} favorites" aria-pressed="${fav}">
        <span class="fav-icon">♥</span>
      </button>
      <button class="song-action" type="button" aria-label="Play ${song.title}">
        <span class="play-icon">▶</span>
      </button>
    </div>
  `;

  const favBtn = item.querySelector('.fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(song.id);
    favBtn.classList.toggle('active', nowFav);
    favBtn.setAttribute('aria-pressed', String(nowFav));
    favBtn.setAttribute('aria-label', `${nowFav ? 'Remove from' : 'Add to'} favorites`);
  });

  item.querySelector('.song-action').addEventListener('click', (e) => {
    e.stopPropagation();
    playSong(index);
  });
  item.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    playSong(index);
  });
  return item;
}

export function getFavoriteSongs(songs) {
  const ids = getFavorites();
  return ids.map((id) => songs.find((s) => s.id === id)).filter(Boolean);
}