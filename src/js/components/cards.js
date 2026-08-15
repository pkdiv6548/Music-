import { formatPlays } from '../data.js';
import { toggleFavorite, isFavorite } from '../storage.js';

export function createMusicCard({ song, index, playSong }) {
  const card = document.createElement('article');
  card.className = 'music-card reveal';
  const fav = isFavorite(song.id);
  card.innerHTML = `
    <div class="music-card-cover">
      <img src="${song.cover}" alt="${song.title} cover" loading="lazy" />
      <button class="play-overlay" type="button" aria-label="Play ${song.title}">
        <span class="play-icon">▶</span>
      </button>
      <span class="card-badge">${song.genre}</span>
      <button class="card-fav-btn${fav ? ' active' : ''}" type="button" aria-label="${fav ? 'Remove from' : 'Add to'} favorites" aria-pressed="${fav}">
        <span class="fav-icon">♥</span>
      </button>
    </div>
    <div class="music-card-body">
      <h4 class="music-card-title">${song.title}</h4>
      <p class="music-card-artist">${song.artist}</p>
      <div class="music-card-meta">
        <span>${song.album}</span>
        <span>${formatPlays(song.plays)} plays</span>
      </div>
    </div>
  `;

  const favBtn = card.querySelector('.card-fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(song.id);
    favBtn.classList.toggle('active', nowFav);
    favBtn.setAttribute('aria-pressed', String(nowFav));
    favBtn.setAttribute('aria-label', `${nowFav ? 'Remove from' : 'Add to'} favorites`);
  });

  card.querySelector('.play-overlay').addEventListener('click', (e) => {
    e.stopPropagation();
    playSong(index);
  });
  card.addEventListener('click', () => playSong(index));
  return card;
}

export function createAlbumCard({ album, artist, cover, songCount, onPlay }) {
  const card = document.createElement('article');
  card.className = 'album-card reveal';
  card.innerHTML = `
    <div class="album-card-cover">
      <img src="${cover}" alt="${album} album cover" loading="lazy" />
      <button class="play-overlay" type="button" aria-label="Play ${album}">
        <span class="play-icon">▶</span>
      </button>
    </div>
    <div class="album-card-body">
      <h4 class="album-card-title">${album}</h4>
      <p class="album-card-artist">${artist}</p>
      <p class="album-card-meta">${songCount} songs</p>
    </div>
  `;

  card.querySelector('.play-overlay').addEventListener('click', (e) => {
    e.stopPropagation();
    if (onPlay) onPlay();
  });
  card.addEventListener('click', () => {
    if (onPlay) onPlay();
  });
  return card;
}

export function createArtistCard({ artist, cover, songCount, onPlay }) {
  const card = document.createElement('article');
  card.className = 'artist-card reveal';
  card.innerHTML = `
    <div class="artist-card-cover">
      <img src="${cover}" alt="${artist}" loading="lazy" />
      <button class="play-overlay" type="button" aria-label="Play ${artist}">
        <span class="play-icon">▶</span>
      </button>
    </div>
    <div class="artist-card-body">
      <h4 class="artist-card-title">${artist}</h4>
      <p class="artist-card-meta">${songCount} songs</p>
    </div>
  `;

  card.querySelector('.play-overlay').addEventListener('click', (e) => {
    e.stopPropagation();
    if (onPlay) onPlay();
  });
  card.addEventListener('click', () => {
    if (onPlay) onPlay();
  });
  return card;
}

export function createPlaylistCard({ title, cover, songCount, description, onPlay }) {
  const card = document.createElement('article');
  card.className = 'playlist-card reveal';
  card.innerHTML = `
    <div class="playlist-card-cover">
      <img src="${cover}" alt="${title} playlist cover" loading="lazy" />
      <button class="play-overlay" type="button" aria-label="Play ${title}">
        <span class="play-icon">▶</span>
      </button>
    </div>
    <div class="playlist-card-body">
      <h4 class="playlist-card-title">${title}</h4>
      <p class="playlist-card-desc">${description || ''}</p>
      <p class="playlist-card-meta">${songCount} songs</p>
    </div>
  `;

  card.querySelector('.play-overlay').addEventListener('click', (e) => {
    e.stopPropagation();
    if (onPlay) onPlay();
  });
  card.addEventListener('click', () => {
    if (onPlay) onPlay();
  });
  return card;
}

export function createGenreCard({ genre, cover, songCount, onPlay }) {
  const card = document.createElement('article');
  card.className = 'genre-card reveal';
  card.innerHTML = `
    <div class="genre-card-cover">
      <img src="${cover}" alt="${genre} genre cover" loading="lazy" />
      <button class="play-overlay" type="button" aria-label="Play ${genre}">
        <span class="play-icon">▶</span>
      </button>
    </div>
    <div class="genre-card-body">
      <h4 class="genre-card-title">${genre}</h4>
      <p class="genre-card-meta">${songCount} songs</p>
    </div>
  `;

  card.querySelector('.play-overlay').addEventListener('click', (e) => {
    e.stopPropagation();
    if (onPlay) onPlay();
  });
  card.addEventListener('click', () => {
    if (onPlay) onPlay();
  });
  return card;
}

export function createSectionHeader(title, actionText, actionHandler) {
  const header = document.createElement('div');
  header.className = 'section-header';
  const action = actionText
    ? `<button class="section-action" type="button">${actionText}</button>`
    : '';
  header.innerHTML = `<h3>${title}</h3>${action}`;
  if (actionHandler) {
    header.querySelector('.section-action')?.addEventListener('click', actionHandler);
  }
  return header;
}