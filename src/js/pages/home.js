import {
  createMusicCard,
  createAlbumCard,
  createArtistCard,
  createGenreCard,
  createPlaylistCard,
  createSectionHeader,
} from '../components/cards.js';
import { getContinueListening, getRecentlyPlayed, getFavorites } from '../storage.js';

export function renderHome({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();

  // Hero section with premium design
  const hero = document.createElement('section');
  hero.className = 'card hero-card';
  hero.innerHTML = `
    <div class="hero-content">
      <div class="section-header">
        <div>
          <h2>Feel the rhythm of Pulse Music</h2>
          <p>Discover curated playlists, new releases, and a responsive music experience with no backend required. Premium quality, zero cost.</p>
        </div>
      </div>
    </div>
    <div class="hero-stats">
      <div class="stat-item reveal">
        <h4>${songs.length}</h4>
        <p>Songs ready to play</p>
      </div>
      <div class="stat-item reveal">
        <h4>${getAlbumCount(songs)}</h4>
        <p>Albums in collection</p>
      </div>
      <div class="stat-item reveal">
        <h4>${getArtistCount(songs)}</h4>
        <p>Artists to discover</p>
      </div>
    </div>
  `;
  fragment.appendChild(hero);

  // Continue Listening
  const listening = getContinueListening();
  const listeningEntries = Object.entries(listening)
    .map(([id, data]) => {
      const song = songs.find((s) => s.id === id);
      return song ? { song, data } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.data.timestamp - a.data.timestamp)
    .slice(0, 6);

  if (listeningEntries.length) {
    const listeningSection = document.createElement('section');
    listeningSection.className = 'card section-card';
    const listeningGrid = document.createElement('div');
    listeningGrid.className = 'card-grid stagger-children';
    listeningEntries.forEach(({ song, data }) => {
      const index = songs.findIndex((s) => s.id === song.id);
      const card = createMusicCard({ song, index, playSong });
      const pct = data.duration > 0 ? Math.min(100, (data.position / data.duration) * 100) : 0;
      const progress = document.createElement('div');
      progress.className = 'continue-progress';
      progress.innerHTML = `
        <div class="continue-progress-bar">
          <div class="continue-progress-fill" style="width: ${pct}%"></div>
        </div>
        <span>${Math.round(pct)}%</span>
      `;
      card.appendChild(progress);
      listeningGrid.appendChild(card);
    });
    listeningSection.appendChild(createSectionHeader('Continue Listening', 'View all'));
    listeningSection.appendChild(listeningGrid);
    fragment.appendChild(listeningSection);
  }

  // Recently Played
  const recentIds = getRecentlyPlayed();
  const recentSongs = recentIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (recentSongs.length) {
    const recentSection = document.createElement('section');
    recentSection.className = 'card section-card';
    const recentGrid = document.createElement('div');
    recentGrid.className = 'card-grid stagger-children';
    recentSongs.forEach((song) => {
      const index = songs.findIndex((s) => s.id === song.id);
      recentGrid.appendChild(createMusicCard({ song, index, playSong }));
    });
    recentSection.appendChild(createSectionHeader('Recently Played', 'View all'));
    recentSection.appendChild(recentGrid);
    fragment.appendChild(recentSection);
  }

  // Favorites
  const favIds = getFavorites();
  const favSongs = favIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (favSongs.length) {
    const favSection = document.createElement('section');
    favSection.className = 'card section-card';
    const favGrid = document.createElement('div');
    favGrid.className = 'card-grid stagger-children';
    favSongs.forEach((song) => {
      const index = songs.findIndex((s) => s.id === song.id);
      favGrid.appendChild(createMusicCard({ song, index, playSong }));
    });
    favSection.appendChild(createSectionHeader('Your Favorites', 'View all'));
    favSection.appendChild(favGrid);
    fragment.appendChild(favSection);
  }

  // Featured Songs
  const featuredSongs = songs.filter((s) => s.featured);
  if (featuredSongs.length) {
    const featuredSection = document.createElement('section');
    featuredSection.className = 'card section-card';
    const grid = document.createElement('div');
    grid.className = 'card-grid stagger-children';
    featuredSongs.forEach((song, i) => {
      const index = songs.findIndex((s) => s.id === song.id);
      grid.appendChild(createMusicCard({ song, index, playSong }));
    });
    featuredSection.appendChild(createSectionHeader('Featured Songs', 'View all'));
    featuredSection.appendChild(grid);
    fragment.appendChild(featuredSection);
  }

  // Trending Songs (by plays)
  const trendingSongs = [...songs].sort((a, b) => b.plays - a.plays).slice(0, 8);
  const trendingSection = document.createElement('section');
  trendingSection.className = 'card section-card';
  const trendingGrid = document.createElement('div');
  trendingGrid.className = 'card-grid stagger-children';
  trendingSongs.forEach((song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    trendingGrid.appendChild(createMusicCard({ song, index, playSong }));
  });
  trendingSection.appendChild(createSectionHeader('Trending Songs', 'View all'));
  trendingSection.appendChild(trendingGrid);
  fragment.appendChild(trendingSection);

  // New Releases
  const newSongs = songs.filter((s) => s.newRelease);
  if (newSongs.length) {
    const newSection = document.createElement('section');
    newSection.className = 'card section-card';
    const newGrid = document.createElement('div');
    newGrid.className = 'card-grid stagger-children';
    newSongs.forEach((song) => {
      const index = songs.findIndex((s) => s.id === song.id);
      newGrid.appendChild(createMusicCard({ song, index, playSong }));
    });
    newSection.appendChild(createSectionHeader('New Releases', 'View all'));
    newSection.appendChild(newGrid);
    fragment.appendChild(newSection);
  }

  // Recommended
  const recommendedSongs = songs.filter((s) => s.recommended);
  if (recommendedSongs.length) {
    const recSection = document.createElement('section');
    recSection.className = 'card section-card';
    const recGrid = document.createElement('div');
    recGrid.className = 'card-grid stagger-children';
    recommendedSongs.forEach((song) => {
      const index = songs.findIndex((s) => s.id === song.id);
      recGrid.appendChild(createMusicCard({ song, index, playSong }));
    });
    recSection.appendChild(createSectionHeader('Recommended For You', 'View all'));
    recSection.appendChild(recGrid);
    fragment.appendChild(recSection);
  }

  // Albums
  const albums = getAlbums(songs);
  const albumSection = document.createElement('section');
  albumSection.className = 'card section-card';
  const albumGrid = document.createElement('div');
  albumGrid.className = 'card-grid stagger-children';
  albums.forEach((album) => {
    const albumSongs = songs.filter((s) => s.album === album.name);
    const firstSong = albumSongs[0];
    albumGrid.appendChild(
      createAlbumCard({
        album: album.name,
        artist: firstSong.artist,
        cover: firstSong.cover,
        songCount: albumSongs.length,
        onPlay: () => {
          const index = songs.findIndex((s) => s.id === albumSongs[0].id);
          playSong(index);
        },
      })
    );
  });
  albumSection.appendChild(createSectionHeader('Albums', 'View all'));
  albumSection.appendChild(albumGrid);
  fragment.appendChild(albumSection);

  // Artists
  const artists = getArtists(songs);
  const artistSection = document.createElement('section');
  artistSection.className = 'card section-card';
  const artistGrid = document.createElement('div');
  artistGrid.className = 'card-grid stagger-children';
  artists.forEach((artist) => {
    const artistSongs = songs.filter((s) => s.artist === artist.name);
    const firstSong = artistSongs[0];
    artistGrid.appendChild(
      createArtistCard({
        artist: artist.name,
        cover: firstSong.cover,
        songCount: artistSongs.length,
        onPlay: () => {
          const index = songs.findIndex((s) => s.id === artistSongs[0].id);
          playSong(index);
        },
      })
    );
  });
  artistSection.appendChild(createSectionHeader('Top Artists', 'View all'));
  artistSection.appendChild(artistGrid);
  fragment.appendChild(artistSection);

  // Genres
  const genres = getGenres(songs);
  const genreSection = document.createElement('section');
  genreSection.className = 'card section-card';
  const genreGrid = document.createElement('div');
  genreGrid.className = 'card-grid stagger-children';
  genres.forEach((genre) => {
    const genreSongs = songs.filter((s) => s.genre === genre.name);
    const firstSong = genreSongs[0];
    genreGrid.appendChild(
      createGenreCard({
        genre: genre.name,
        cover: firstSong.cover,
        songCount: genreSongs.length,
        onPlay: () => {
          const index = songs.findIndex((s) => s.id === genreSongs[0].id);
          playSong(index);
        },
      })
    );
  });
  genreSection.appendChild(createSectionHeader('Popular Genres', 'View all'));
  genreSection.appendChild(genreGrid);
  fragment.appendChild(genreSection);

  // Playlists
  const playlists = createPlaylists(songs);
  const playlistSection = document.createElement('section');
  playlistSection.className = 'card section-card';
  const playlistGrid = document.createElement('div');
  playlistGrid.className = 'card-grid stagger-children';
  playlists.forEach((playlist) => {
    playlistGrid.appendChild(
      createPlaylistCard({
        title: playlist.title,
        cover: playlist.cover,
        songCount: playlist.songCount,
        description: playlist.description,
        onPlay: () => {
          const index = songs.findIndex((s) => s.id === playlist.firstSongId);
          playSong(index);
        },
      })
    );
  });
  playlistSection.appendChild(createSectionHeader('Curated Playlists', 'View all'));
  playlistSection.appendChild(playlistGrid);
  fragment.appendChild(playlistSection);

  return fragment;
}

function getAlbumCount(songs) {
  return new Set(songs.map((s) => s.album)).size;
}

function getArtistCount(songs) {
  return new Set(songs.map((s) => s.artist)).size;
}

function getAlbums(songs) {
  const albumMap = new Map();
  songs.forEach((song) => {
    if (!albumMap.has(song.album)) {
      albumMap.set(song.album, { name: song.album, artist: song.artist, cover: song.cover });
    }
  });
  return Array.from(albumMap.values());
}

function getArtists(songs) {
  const artistMap = new Map();
  songs.forEach((song) => {
    if (!artistMap.has(song.artist)) {
      artistMap.set(song.artist, { name: song.artist, cover: song.cover });
    }
  });
  return Array.from(artistMap.values());
}

function getGenres(songs) {
  const genreMap = new Map();
  songs.forEach((song) => {
    if (!genreMap.has(song.genre)) {
      genreMap.set(song.genre, { name: song.genre, cover: song.cover });
    }
  });
  return Array.from(genreMap.values());
}

function createPlaylists(songs) {
  const playlists = [
    {
      title: 'Chill Vibes',
      cover: songs.find((s) => s.genre === 'Chill')?.cover || songs[0]?.cover,
      songCount: songs.filter((s) => s.genre === 'Chill').length,
      description: 'Relax and unwind',
      firstSongId: songs.find((s) => s.genre === 'Chill')?.id,
    },
    {
      title: 'Electronic Energy',
      cover: songs.find((s) => s.genre === 'Electronic')?.cover || songs[0]?.cover,
      songCount: songs.filter((s) => s.genre === 'Electronic').length,
      description: 'High energy beats',
      firstSongId: songs.find((s) => s.genre === 'Electronic')?.id,
    },
    {
      title: 'Ambient Escape',
      cover: songs.find((s) => s.genre === 'Ambient')?.cover || songs[0]?.cover,
      songCount: songs.filter((s) => s.genre === 'Ambient').length,
      description: 'Peaceful soundscapes',
      firstSongId: songs.find((s) => s.genre === 'Ambient')?.id,
    },
    {
      title: 'Lo-fi Beats',
      cover: songs.find((s) => s.genre === 'Lo-fi')?.cover || songs[0]?.cover,
      songCount: songs.filter((s) => s.genre === 'Lo-fi').length,
      description: 'Study and relax',
      firstSongId: songs.find((s) => s.genre === 'Lo-fi')?.id,
    },
    {
      title: 'Synthwave Nights',
      cover: songs.find((s) => s.genre === 'Synthwave')?.cover || songs[0]?.cover,
      songCount: songs.filter((s) => s.genre === 'Synthwave').length,
      description: 'Retro future sounds',
      firstSongId: songs.find((s) => s.genre === 'Synthwave')?.id,
    },
    {
      title: 'Top Hits',
      cover: [...songs].sort((a, b) => b.plays - a.plays)[0]?.cover || songs[0]?.cover,
      songCount: Math.min(8, songs.length),
      description: 'Most played tracks',
      firstSongId: [...songs].sort((a, b) => b.plays - a.plays)[0]?.id,
    },
  ];
  return playlists.filter((p) => p.firstSongId);
}