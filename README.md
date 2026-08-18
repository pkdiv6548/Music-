# Music- (Frontend only)

This repository contains a lightweight frontend-only music player. Drag or upload local audio files to play them — no backend required.

Features implemented in this fork:

- Upload local audio files and play them (uses `URL.createObjectURL`).
- Play / pause / previous / next / seek / volume controls.
- Shuffle and repeat modes.
- Responsive layout and improved dark theme styling.

Quick start (open locally):

1. Open `index.html` in your browser (File → Open File).
2. Or serve over HTTP (recommended):

```bash
# Python 3
python -m http.server 5500

# Then open http://localhost:5500
```

To deploy on GitHub Pages: push to this repository and enable Pages in Settings (branch `main`, folder `/`).

Files changed/added here:

- `index.html` — UI and markup
- `css/styles.css` — visuals, layout, responsive rules
- `js/player.js` — frontend player logic (audio element, playlist, events)
- `js/app.js` — UI wiring and local file upload handling
- `js/playlist.js` — small stub (placeholder)

If you want, I can further merge features from the original `Pulse Music` project into this fork (PWA, service worker, extended UI). For now, this is focused on a simple, local-first music player.

---
Original README content from upstream was preserved in history; this file is a concise guide to this fork's behavior.

