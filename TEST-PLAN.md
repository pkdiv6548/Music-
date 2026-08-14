# Pulse Music - Complete Feature Test Plan

## Test Environment
- **URL**: http://127.0.0.1:3000/Projects/Pulse-Music/index.html?vscode-livepreview=true
- **Server**: Running on port 3000
- **Browser**: VS Code Integrated Browser (Live Preview)

---

## Features to Test

### 1. Navigation System
**Test Steps:**
- [ ] Click on "Home" in sidebar - should load home page
- [ ] Click on "Search" - should load search page
- [ ] Click on "Favorites" - should load favorites page
- [ ] Click on "Recently Played" - should show recently played songs
- [ ] Click on "Continue Listening" - should show songs in progress
- [ ] Click on "Playlists" - should load playlists page
- [ ] Click on "History" - should show listening history
- [ ] Click on "Library" - should load library page
- [ ] Click on "Local Library" - should show local files
- [ ] Click on "About" - should show about page
- [ ] Test mobile navigation (bottom nav on mobile viewport)

**Expected Result:** All pages load correctly with smooth transitions

---

### 2. Player Controls
**Test Steps:**
- [ ] Click play button (▶) - should start playback
- [ ] Click pause button (⏸) - should pause playback
- [ ] Click previous button (⏮) - should go to previous song
- [ ] Click next button (⏭) - should go to next song
- [ ] Drag progress bar - should seek to different position
- [ ] Verify current time updates during playback
- [ ] Verify duration time displays correctly
- [ ] Adjust volume slider - should change volume
- [ ] Click mute button (🔊/🔇) - should toggle mute
- [ ] Change playback speed dropdown - should change speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)

**Expected Result:** All player controls work smoothly

---

### 3. Advanced Player Features
**Test Steps:**
- [ ] Click shuffle button (🔀) - should enable shuffle mode
- [ ] Click repeat button (🔁) - should cycle through: off → all → one → off
- [ ] Click autoplay button (Auto) - should toggle autoplay on/off
- [ ] Click lyrics button (🎤) - should show lyrics panel
- [ ] Click queue button (📋) - should show queue panel
- [ ] Click queue reset button - should reset queue order
- [ ] Click mini player button (Mini) - should switch to mini player mode
- [ ] Click fullscreen button (⛶) - should open fullscreen player
- [ ] Click sleep timer button (⏰) - should show sleep timer options
- [ ] Set sleep timer for 5 minutes - should pause after 5 minutes

**Expected Result:** All advanced features function correctly

---

### 4. Theme Toggle
**Test Steps:**
- [ ] Click theme toggle button in topbar
- [ ] Verify theme changes from dark to light
- [ ] Verify theme persists on page refresh
- [ ] Click again to switch back to dark

**Expected Result:** Theme toggles smoothly and persists

---

### 5. Keyboard Shortcuts
**Test Steps:**
- [ ] Press Space - should play/pause
- [ ] Press Arrow Right - should go to next track
- [ ] Press Arrow Left - should go to previous track
- [ ] Press Arrow Up - should increase volume
- [ ] Press Arrow Down - should decrease volume
- [ ] Press M - should toggle mute
- [ ] Press S - should toggle shuffle
- [ ] Press R - should cycle repeat mode
- [ ] Press F - should toggle fullscreen
- [ ] Press L - should toggle lyrics panel
- [ ] Press Q - should toggle queue panel

**Expected Result:** All keyboard shortcuts work correctly

---

### 6. Mobile Responsiveness
**Test Steps:**
- [ ] Resize browser to mobile width (< 768px)
- [ ] Verify sidebar hides
- [ ] Verify hamburger menu appears
- [ ] Click hamburger menu - should open sidebar
- [ ] Verify bottom navigation appears
- [ ] Test all mobile nav buttons
- [ ] Verify player bar adapts to mobile
- [ ] Verify mini player works on mobile

**Expected Result:** UI adapts correctly to mobile viewport

---

### 7. Online/Offline Status
**Test Steps:**
- [ ] Check online status indicator in sidebar footer
- [ ] Disconnect network (DevTools → Network → Offline)
- [ ] Verify status changes to "Offline"
- [ ] Verify error toast appears
- [ ] Reconnect network
- [ ] Verify status changes back to "Online"

**Expected Result:** Online/offline status updates correctly

---

### 8. Data Persistence
**Test Steps:**
- [ ] Add song to favorites
- [ ] Refresh page - favorites should persist
- [ ] Play a song - should appear in recently played
- [ ] Play another song - should appear in history
- [ ] Refresh page - history should persist
- [ ] Play a song and seek to middle position
- [ ] Refresh page and play same song - should resume from saved position
- [ ] Add local file (if feature available) - should persist after refresh

**Expected Result:** All data persists using IndexedDB

---

### 9. Visual Features
**Test Steps:**
- [ ] Verify visualizer animates during playback
- [ ] Verify visualizer stops when paused
- [ ] Verify track cover shows "playing" animation
- [ ] Verify scroll reveal animations on page scroll
- [ ] Verify smooth page transitions
- [ ] Verify toast notifications appear and disappear

**Expected Result:** All visual effects work smoothly

---

### 10. Error Handling
**Test Steps:**
- [ ] Try to play without selecting a song - should show error
- [ ] Verify error toast appears for 4 seconds
- [ ] Check browser console for any errors
- [ ] Test with invalid audio source (if possible)

**Expected Result:** Errors handled gracefully with user feedback

---

### 11. Service Worker / PWA Features
**Test Steps:**
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker is registered
- [ ] Check Cache Storage for cached assets
- [ ] Verify manifest.json loads correctly
- [ ] Check if app can be installed (if supported)

**Expected Result:** PWA features work correctly

---

### 12. Accessibility
**Test Steps:**
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Check ARIA labels are present
- [ ] Verify skip link works
- [ ] Test screen reader announcements (if available)

**Expected Result:** App is accessible via keyboard

---

## Test Checklist Summary

### Core Functionality
- [ ] Navigation between all pages
- [ ] Audio playback (play/pause/next/previous)
- [ ] Progress seeking
- [ ] Volume control
- [ ] Playback speed control

### Advanced Features
- [ ] Shuffle mode
- [ ] Repeat modes (off/all/one)
- [ ] Autoplay toggle
- [ ] Lyrics panel
- [ ] Queue management
- [ ] Mini player mode
- [ ] Fullscreen player
- [ ] Sleep timer

### UI/UX
- [ ] Theme toggle (dark/light)
- [ ] Mobile responsiveness
- [ ] Visualizer animation
- [ ] Scroll animations
- [ ] Toast notifications
- [ ] Error handling

### Data Management
- [ ] Favorites persistence
- [ ] Recently played persistence
- [ ] History persistence
- [ ] Continue listening (resume position)
- [ ] Local library support

### Technical
- [ ] Keyboard shortcuts
- [ ] Online/offline detection
- [ ] Service worker registration
- [ ] IndexedDB functionality
- [ ] Accessibility features

---

## How to Test

1. Open the URL in VS Code integrated browser:
   ```
   http://127.0.0.1:3000/Projects/Pulse-Music/index.html?vscode-livepreview=true
   ```

2. Open browser DevTools (F12) to:
   - Monitor console for errors
   - Test responsive design (Device Toolbar)
   - Simulate offline mode
   - Check Application tab for service worker and storage

3. Follow each test section above systematically

4. Mark each checkbox as you verify the feature works

---

## Known Features from Code Analysis

### Pages Available:
- Home
- Search
- Favorites
- Recently Played
- Continue Listening
- Playlists
- History
- Library
- Local Library
- About

### Player Features:
- Play/Pause
- Previous/Next track
- Progress bar with seeking
- Volume control with mute
- Playback speed (0.5x - 2x)
- Shuffle mode
- Repeat modes (off/all/one)
- Autoplay toggle
- Lyrics panel
- Queue panel with reset
- Mini player mode
- Fullscreen player
- Sleep timer (5, 10, 15, 30, 45, 60 minutes)
- Audio visualizer
- Floating mini player

### Data Features:
- Favorites system
- Recently played tracking
- Listening history
- Continue listening (resume position)
- Local library (IndexedDB)
- Playlists

### UI Features:
- Dark/Light theme
- Responsive design
- Mobile navigation
- Sidebar navigation
- Scroll reveal animations
- Toast notifications
- Error handling

### Technical Features:
- Service Worker (PWA)
- IndexedDB for local storage
- Keyboard shortcuts
- Online/offline detection
- Accessibility (ARIA labels, keyboard navigation)