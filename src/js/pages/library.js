import { createMusicCard, createAlbumCard, createSectionHeader } from '../components/cards.js';

export function renderLibrary({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const libraryCard = document.createElement('section');
  libraryCard.className = 'card library-card';
  
  // Pinned Music Section
  const pinnedSection = document.createElement('div');
  pinnedSection.className = 'library-section';
  
  const pinnedHeader = document.createElement('h3');
  pinnedHeader.className = 'library-section-title';
  pinnedHeader.textContent = '📌 Pinned Music';
  pinnedSection.appendChild(pinnedHeader);
  
  const pinnedGrid = document.createElement('div');
  pinnedGrid.className = 'card-grid stagger-children';
  
  // Show first 4 songs as pinned (in a real app, this would be user-selected)
  songs.slice(0, 4).forEach((song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    pinnedGrid.appendChild(createMusicCard({ song, index, playSong }));
  });
  
  pinnedSection.appendChild(pinnedGrid);
  libraryCard.appendChild(pinnedSection);
  
  // Recently Added Section
  const recentSection = document.createElement('div');
  recentSection.className = 'library-section';
  
  const recentHeader = document.createElement('h3');
  recentHeader.className = 'library-section-title';
  recentHeader.textContent = '🆕 Recently Added';
  recentSection.appendChild(recentHeader);
  
  const recentGrid = document.createElement('div');
  recentGrid.className = 'card-grid stagger-children';
  
  const recentSongs = [...songs]
    .filter(s => s.newRelease)
    .slice(0, 6);
  
  if (recentSongs.length === 0) {
    recentSongs.push(...songs.slice(0, 6));
  }
  
  recentSongs.forEach((song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    recentGrid.appendChild(createMusicCard({ song, index, playSong }));
  });
  
  recentSection.appendChild(recentGrid);
  libraryCard.appendChild(recentSection);
  
  // All Albums Section
  const albums = getAlbums(songs);
  const albumSection = document.createElement('div');
  albumSection.className = 'library-section';
  
  const albumHeader = document.createElement('h3');
  albumHeader.className = 'library-section-title';
  albumHeader.textContent = '💿 Your Albums';
  albumSection.appendChild(albumHeader);
  
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
  
  albumSection.appendChild(albumGrid);
  libraryCard.appendChild(albumSection);
  
  // All Artists Section
  const artists = getArtists(songs);
  const artistSection = document.createElement('div');
  artistSection.className = 'library-section';
  
  const artistHeader = document.createElement('h3');
  artistHeader.className = 'library-section-title';
  artistHeader.textContent = '🎤 Your Artists';
  artistSection.appendChild(artistHeader);
  
  const artistGrid = document.createElement('div');
  artistGrid.className = 'card-grid stagger-children';
  
  artists.forEach((artist) => {
    const artistSongs = songs.filter((s) => s.artist === artist.name);
    const firstSong = artistSongs[0];
    artistGrid.appendChild(
      createAlbumCard({
        album: artist.name,
        artist: 'Artist',
        cover: firstSong.cover,
        songCount: artistSongs.length,
        onPlay: () => {
          const index = songs.findIndex((s) => s.id === artistSongs[0].id);
          playSong(index);
        },
      })
    );
  });
  
  artistSection.appendChild(artistGrid);
  libraryCard.appendChild(artistSection);
  
  fragment.appendChild(libraryCard);
  return fragment;
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