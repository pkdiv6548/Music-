export function renderAbout({ songs, createSongListItem, playSong }) {
  const fragment = document.createDocumentFragment();
  
  const aboutCard = document.createElement('section');
  aboutCard.className = 'card about-card';
  
  aboutCard.innerHTML = `
    <div class="about-header">
      <h2>About Pulse Music</h2>
      <p>A premium music streaming experience built with modern web technologies. No backend required, no subscriptions, just pure music enjoyment.</p>
    </div>
    
    <div class="about-section">
      <h3>Our Mission</h3>
      <p>Pulse Music delivers a world-class music listening experience with a beautiful, intuitive interface. We believe that everyone deserves access to premium-quality music streaming without the hassle of accounts, subscriptions, or complicated setups.</p>
    </div>
    
    <div class="about-features">
      <div class="about-feature reveal">
        <div class="about-feature-icon">🎵</div>
        <h4>Premium Sound</h4>
        <p>High-quality audio with advanced player controls and visualizations.</p>
      </div>
      
      <div class="about-feature reveal">
        <div class="about-feature-icon">📱</div>
        <h4>Responsive Design</h4>
        <p>Perfect experience across all devices - mobile, tablet, and desktop.</p>
      </div>
      
      <div class="about-feature reveal">
        <div class="about-feature-icon">💾</div>
        <h4>Offline Ready</h4>
        <p>Progressive Web App with offline support for uninterrupted listening.</p>
      </div>
      
      <div class="about-feature reveal">
        <div class="about-feature-icon">🎨</div>
        <h4>Beautiful UI</h4>
        <p>Modern glassmorphism design with smooth animations and transitions.</p>
      </div>
      
      <div class="about-feature reveal">
        <div class="about-feature-icon">⚡</div>
        <h4>Lightning Fast</h4>
        <p>Optimized performance with lazy loading and GPU-accelerated animations.</p>
      </div>
      
      <div class="about-feature reveal">
        <div class="about-feature-icon">🔒</div>
        <h4>Privacy First</h4>
        <p>No tracking, no data collection. Your listening habits stay private.</p>
      </div>
    </div>
    
    <div class="about-section">
      <h3>Features</h3>
      <ul>
        <li>Instant search across songs, artists, and albums</li>
        <li>Create and manage custom playlists</li>
        <li>Add songs to favorites with one click</li>
        <li>Continue listening from where you left off</li>
        <li>Advanced audio player with queue management</li>
        <li>Sleep timer for bedtime listening</li>
        <li>Lyrics display for supported tracks</li>
        <li>Audio visualizer with real-time animation</li>
        <li>Dark and light theme support</li>
        <li>Keyboard shortcuts for power users</li>
        <li>Full-screen player mode</li>
        <li>Floating mini player</li>
      </ul>
    </div>
    
    <div class="about-section">
      <h3>Technology Stack</h3>
      <p>Built with vanilla JavaScript, modern CSS3, and HTML5. No frameworks, no dependencies, just pure web standards for maximum performance and compatibility.</p>
    </div>
    
    <div class="about-section">
      <h3>Version</h3>
      <p>Current Version: <strong>2.0.0 Premium</strong></p>
      <p>Last Updated: <strong>2025</strong></p>
    </div>
  `;
  
  fragment.appendChild(aboutCard);
  return fragment;
}