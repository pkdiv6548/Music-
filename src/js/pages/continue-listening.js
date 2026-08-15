import { createMusicCard, createSectionHeader } from '../components/cards.js';
import { getContinueListening } from '../storage.js';

export function renderContinueListening({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('section');
  card.className = 'card section-card';
  
  const listening = getContinueListening();
  const listeningEntries = Object.entries(listening)
    .map(([id, data]) => {
      const song = songs.find((s) => s.id === id);
      return song ? { song, data } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.data.timestamp - a.data.timestamp);
  
  if (listeningEntries.length === 0) {
    card.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">▶️</div>
        <h3 class="empty-state-title">No Listening History</h3>
        <p class="empty-state-description">Start playing songs and we'll remember where you left off.</p>
      </div>
    `;
  } else {
    const header = createSectionHeader('Continue Listening', `${listeningEntries.length} songs`);
    card.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'card-grid stagger-children';
    
    listeningEntries.forEach(({ song, data }) => {
      const index = songs.findIndex((s) => s.id === song.id);
      const cardEl = createMusicCard({ song, index, playSong });
      
      // Add progress indicator
      const pct = data.duration > 0 ? Math.min(100, (data.position / data.duration) * 100) : 0;
      const progress = document.createElement('div');
      progress.className = 'continue-progress';
      progress.innerHTML = `
        <div class="continue-progress-bar">
          <div class="continue-progress-fill" style="width: ${pct}%"></div>
        </div>
        <span>${Math.round(pct)}%</span>
      `;
      cardEl.appendChild(progress);
      
      grid.appendChild(cardEl);
    });
    
    card.appendChild(grid);
  }
  
  fragment.appendChild(card);
  return fragment;
}