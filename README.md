# Pulse Music

A modern, Spotify-inspired frontend-only music website built with HTML5, CSS3, and vanilla JavaScript. Features offline support, favorites, playlists, and a fully responsive design.

## Features

- **Multiple Pages**: Home, Search, Library, About, Favorites, Recently Played, Continue Listening, Playlists, History
- **Responsive Design**: Works on desktop, laptop, tablet, and mobile devices
- **Music Player**: Full-featured player with play/pause, next/previous, shuffle, repeat, volume control, and playback speed
- **Theme Support**: Dark/light theme toggle with persistent preference
- **Favorites**: Save favorite songs using Local Storage
- **Recently Played**: Track your listening history
- **Continue Listening**: Resume songs from where you left off
- **Playlists**: Create and manage custom playlists
- **Listening History**: Detailed history with timestamps
- **Offline Support**: Service Worker for PWA functionality
- **Installable**: Can be installed as a PWA on supported browsers
- **Accessibility**: ARIA labels, skip links, keyboard shortcuts, focus styles, reduced motion support
- **SEO**: Meta tags, Open Graph, Twitter Cards
- **Performance**: Lazy loading, ES modules, optimized assets

## Quick Start

### Local Development

Serve the project over HTTP (required for ES modules and Service Worker):

```bash
# Python 3
python -m http.server 8080

# Node.js (if http-server is installed)
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

### VS Code Live Server

Install the Live Server extension and click "Go Live".

## Production Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect the static site and deploy
4. Your site will be live at `https://your-project.vercel.app`

### GitHub Pages

1. Go to repository Settings → Pages
2. Select source branch (e.g., `main`)
3. Select root folder
4. Save and wait for deployment
5. Your site will be live at `https://username.github.io/repo-name`

### Netlify

1. Drag and drop the `Projects/Pulse-Music` folder to Netlify
2. Or connect your GitHub repository
3. Deploy with default settings

## Project Structure

```
Projects/Pulse-Music/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline support
├── robots.txt              # Search engine directives
├── sitemap.xml             # SEO sitemap
├── LICENSE                 # MIT License
├── README.md               # This file
├── assets/
│   ├── audio/              # Audio files (empty, using generated audio)
│   ├── icons/              # PWA icons
│   └── images/             # Album covers and images
└── src/
    ├── css/
    │   ├── reset.css       # CSS reset
    │   ├── variables.css   # CSS custom properties
    │   ├── layout.css      # Layout styles
    │   ├── components.css  # Component styles
    │   ├── pages.css       # Page-specific styles
    │   ├── player.css      # Player styles
    │   ├── advanced.css    # Advanced features
    │   └── responsive.css  # Responsive breakpoints
    ├── data/
    │   └── songs.json       # Song metadata
    └── js/
        ├── main.js         # Main application logic
        ├── data.js         # Data loading and audio generation
        ├── storage.js      # Local Storage utilities
        ├── components/     # Reusable UI components
        └── pages/          # Page renderers
```

## Keyboard Shortcuts

- `Space` - Play/Pause
- `←` - Previous track
- `→` - Next track
- `↑` - Volume up
- `↓` - Volume down
- `M` - Mute/Unmute
- `S` - Toggle shuffle
- `R` - Cycle repeat mode

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Technologies

- HTML5
- CSS3 (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- Service Worker API
- Local Storage API
- Web Audio API (for generated audio)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Built with modern web standards. No frameworks, no dependencies, just pure web technologies.