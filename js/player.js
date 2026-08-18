// Frontend audio player (no backend)
console.log('player.js loaded');

class Player {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.index = -1;
        this.isShuffle = false;
        this.repeat = 'none'; // none, one, all

        this.audio.addEventListener('timeupdate', () => {
            document.dispatchEvent(new CustomEvent('player:timeupdate', {
                detail: { currentTime: this.audio.currentTime, duration: this.audio.duration }
            }));
        });

        this.audio.addEventListener('ended', () => {
            if (this.repeat === 'one') { this.play(); return; }
            if (this.isShuffle) { this._playRandom(); return; }
            if (this.index < this.playlist.length - 1) { this.next(); return; }
            if (this.repeat === 'all') { this.index = 0; this.load(this.index); this.play(); return; }
            document.dispatchEvent(new Event('player:ended'));
        });
    }

    setPlaylist(list, startIndex = 0) {
        this.playlist = list.slice();
        this.index = startIndex >= 0 ? startIndex : this.index;
    }

    load(i) {
        if (!this.playlist || this.playlist.length === 0) return;
        if (i < 0 || i >= this.playlist.length) return;
        this.index = i;
        const track = this.playlist[this.index];
        this.audio.src = track.url;
        this.audio.load();
        document.dispatchEvent(new CustomEvent('player:trackchange', { detail: { track, index: this.index } }));
    }

    play() {
        if (!this.audio.src && this.playlist.length) this.load(0);
        return this.audio.play().then(() => document.dispatchEvent(new Event('player:play'))).catch(()=>{});
    }

    pause() {
        this.audio.pause();
        document.dispatchEvent(new Event('player:pause'));
    }

    togglePlay() {
        if (this.audio.paused) return this.play();
        this.pause();
    }

    next() {
        if (this.isShuffle) { this._playRandom(); return; }
        if (this.index < this.playlist.length - 1) {
            this.load(this.index + 1);
            this.play();
        }
    }

    prev() {
        if (this.audio.currentTime > 3) {
            this.seek(0);
            return;
        }
        if (this.index > 0) {
            this.load(this.index - 1);
            this.play();
        }
    }

    seek(seconds) { this.audio.currentTime = seconds; }
    setVolume(v) { this.audio.volume = Math.max(0, Math.min(1, v)); }

    toggleShuffle() { this.isShuffle = !this.isShuffle; document.dispatchEvent(new CustomEvent('player:shuffle', { detail: { enabled: this.isShuffle } })); }
    cycleRepeat() {
        if (this.repeat === 'none') this.repeat = 'one';
        else if (this.repeat === 'one') this.repeat = 'all';
        else this.repeat = 'none';
        document.dispatchEvent(new CustomEvent('player:repeat', { detail: { mode: this.repeat } }));
    }

    _playRandom() {
        if (!this.playlist.length) return;
        const idx = Math.floor(Math.random() * this.playlist.length);
        this.load(idx);
        this.play();
    }
}

window.player = new Player();
