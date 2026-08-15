import { createMusicCard, createSectionHeader } from '../components/cards.js';
import { getHistory, clearHistory } from '../storage.js';

export function renderHistory({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('section');
  card.className = 'card history-card';
  
  const history = getHistory();
  
  if (history.length === 0) {
    card.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3 class="empty-state-title">No Listening History</h3>
        <p class="empty-state-description">Your listening history will appear here as you play songs.</p>
      </div>
    `;
  } else {
    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'view-btn history-clear-btn';
    clearBtn.textContent = 'Clear History';
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all listening history?')) {
        clearHistory();
        showToast('History cleared', 'success');
        renderHistory({ songs, createSongListItem, playSong });
      }
    });
    card.appendChild(clearBtn);
    
    // Group by date
    const grouped = groupByDate(history);
    
    Object.entries(grouped).forEach(([dateLabel, entries]) => {
      const timeHeader = document.createElement('div');
      timeHeader.className = 'history-time';
      timeHeader.textContent = dateLabel;
      card.appendChild(timeHeader);
      
      const grid = document.createElement('div');
      grid.className = 'card-grid stagger-children';
      
      entries.forEach((entry) => {
        const song = songs.find((s) => s.id === entry.songId);
        if (song) {
          const index = songs.findIndex((s) => s.id === song.id);
          grid.appendChild(createMusicCard({ song, index, playSong }));
        }
      });
      
      card.appendChild(grid);
    });
  }
  
  fragment.appendChild(card);
  return fragment;
}

function groupByDate(history) {
  const groups = {};
  
  history.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    let label;
    if (diffDays === 0) {
      label = 'Today';
    } else if (diffDays === 1) {
      label = 'Yesterday';
    } else if (diffDays < 7) {
      label = 'This Week';
    } else if (diffDays < 30) {
      label = 'This Month';
    } else {
      label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(entry);
  });
  
  return groups;
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