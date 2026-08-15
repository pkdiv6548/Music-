import { createMusicCard, createSectionHeader } from '../components/cards.js';

export function renderSearch({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const searchCard = document.createElement('section');
  searchCard.className = 'card search-card';
  
  // Search header with instant search
  const searchHeader = document.createElement('div');
  searchHeader.className = 'search-container';
  searchHeader.innerHTML = `
    <span class="search-icon">🔍</span>
    <input 
      type="text" 
      class="search-field" 
      id="searchInput" 
      placeholder="Search for songs, artists, albums..." 
      autocomplete="off"
    />
    <button class="search-clear" id="searchClear" aria-label="Clear search">✕</button>
    <div class="search-suggestions" id="searchSuggestions"></div>
  `;
  
  // Search results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'searchResults';
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🎵</div>
      <h3 class="empty-state-title">Start Searching</h3>
      <p class="empty-state-description">Find your favorite songs, artists, and albums from our collection.</p>
    </div>
  `;
  
  searchCard.appendChild(searchHeader);
  searchCard.appendChild(resultsContainer);
  fragment.appendChild(searchCard);
  
  // Initialize search functionality
  setTimeout(() => {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    // Instant search with debounce
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      // Show/hide clear button
      searchClear.classList.toggle('visible', query.length > 0);
      
      // Clear previous timeout
      clearTimeout(searchTimeout);
      
      if (query.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎵</div>
            <h3 class="empty-state-title">Start Searching</h3>
            <p class="empty-state-description">Find your favorite songs, artists, and albums from our collection.</p>
          </div>
        `;
        searchSuggestions.classList.remove('active');
        return;
      }
      
      // Debounce search
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 150);
    });
    
    // Clear search
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎵</div>
          <h3 class="empty-state-title">Start Searching</h3>
          <p class="empty-state-description">Find your favorite songs, artists, and albums from our collection.</p>
        </div>
      `;
      searchSuggestions.classList.remove('active');
      searchInput.focus();
    });
    
    // Show suggestions on focus
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        searchSuggestions.classList.add('active');
      }
    });
    
    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!searchHeader.contains(e.target)) {
        searchSuggestions.classList.remove('active');
      }
    });
    
    function performSearch(query) {
      const lowerQuery = query.toLowerCase();
      
      // Search in songs, artists, albums, and genres
      const matchedSongs = songs.filter(song => 
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        song.album.toLowerCase().includes(lowerQuery) ||
        song.genre.toLowerCase().includes(lowerQuery)
      );
      
      // Show suggestions
      if (matchedSongs.length > 0) {
        searchSuggestions.innerHTML = matchedSongs.slice(0, 5).map(song => `
          <div class="search-suggestion-item" data-song-id="${song.id}">
            <img src="${song.cover}" alt="${song.title}" />
            <div class="search-suggestion-info">
              <div class="search-suggestion-title">${song.title}</div>
              <div class="search-suggestion-subtitle">${song.artist} • ${song.album}</div>
            </div>
          </div>
        `).join('');
        searchSuggestions.classList.add('active');
        
        // Add click handlers to suggestions
        searchSuggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            const songId = item.dataset.songId;
            const index = songs.findIndex(s => s.id === songId);
            if (index >= 0) {
              playSong(index);
              searchInput.value = '';
              searchClear.classList.remove('visible');
              searchSuggestions.classList.remove('active');
            }
          });
        });
      } else {
        searchSuggestions.classList.remove('active');
      }
      
      // Display results
      displayResults(matchedSongs, query);
    }
    
    function displayResults(matchedSongs, query) {
      if (matchedSongs.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">No Results Found</h3>
            <p class="empty-state-description">We couldn't find anything matching "${query}". Try a different search term.</p>
          </div>
        `;
        return;
      }
      
      const resultsHeader = document.createElement('div');
      resultsHeader.className = 'search-results-header';
      resultsHeader.innerHTML = `
        <div class="search-results-count">
          Found <strong>${matchedSongs.length}</strong> result${matchedSongs.length !== 1 ? 's' : ''} for "<strong>${query}</strong>"
        </div>
      `;
      
      const resultsGrid = document.createElement('div');
      resultsGrid.className = 'card-grid stagger-children';
      
      matchedSongs.forEach((song) => {
        const index = songs.findIndex((s) => s.id === song.id);
        resultsGrid.appendChild(createMusicCard({ song, index, playSong }));
      });
      
      resultsContainer.innerHTML = '';
      resultsContainer.appendChild(resultsHeader);
      resultsContainer.appendChild(resultsGrid);
    }
    
    // Focus search input on load
    searchInput.focus();
  }, 100);
  
  return fragment;
}