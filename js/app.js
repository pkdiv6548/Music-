// Minimal app stub
console.log('app.js loaded');

// Basic UI interactions
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('menuToggle')?.addEventListener('click', function(){
        document.querySelector('.sidebar')?.classList.toggle('collapsed');
    });

    document.getElementById('uploadBtn')?.addEventListener('click', function(){
        document.getElementById('fileInput')?.click();
    });
});

// Wire up player UI to player.js
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const favBtn = document.getElementById('favBtn');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const volumeBar = document.getElementById('volumeBar');

    playBtn?.addEventListener('click', () => window.player.togglePlay());
    prevBtn?.addEventListener('click', () => window.player.prev());
    nextBtn?.addEventListener('click', () => window.player.next());
    shuffleBtn?.addEventListener('click', () => window.player.toggleShuffle());
    repeatBtn?.addEventListener('click', () => window.player.cycleRepeat());

    progressBar?.addEventListener('input', (e) => {
        const pct = e.target.value;
        const dur = window.player.audio.duration || 0;
        window.player.seek((pct / 100) * dur);
    });

    volumeBar?.addEventListener('input', (e) => {
        window.player.setVolume(e.target.value / 100);
    });

    // File upload -> add to playlist (local file URLs)
    const fileInput = document.getElementById('fileInput');
    fileInput?.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        const tracks = files.map(f => ({ title: f.name, artist: 'Local', url: URL.createObjectURL(f) }));
        window.player.setPlaylist(tracks, 0);
        window.player.play();
        renderLibrary(tracks);
    });

    // Update UI on player events
    document.addEventListener('player:trackchange', (e) => {
        const { track } = e.detail;
        document.getElementById('currentTitle').textContent = track.title || 'अनजान गाना';
        document.getElementById('currentArtist').textContent = track.artist || '';
    });

    document.addEventListener('player:timeupdate', (e) => {
        const { currentTime, duration } = e.detail;
        if (duration && !isNaN(duration)) {
            const pct = duration ? (currentTime / duration) * 100 : 0;
            progressBar.value = pct;
            currentTimeEl.textContent = formatTime(currentTime);
            durationEl.textContent = formatTime(duration);
        }
    });
});

function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

function renderLibrary(tracks) {
    const list = document.getElementById('libraryList');
    if (!list) return;
    list.innerHTML = '';
    tracks.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'song-card';
        div.innerHTML = `
            <div class="song-thumbnail">🎵</div>
            <div class="song-meta"><strong>${t.title}</strong><div class="small">${t.artist}</div></div>
        `;
        div.addEventListener('click', () => { window.player.load(i); window.player.play(); });
        list.appendChild(div);
    });
}
