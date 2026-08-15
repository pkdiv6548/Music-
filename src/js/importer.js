// File import functionality for Pulse Music
import { isAudioFile, extractMetadata, generateSongId, formatFileSize, formatDuration } from './metadata.js';
import { saveSong, saveSongs, getAllSongs, getSongsCount } from './db.js';
import { getSetting, setSetting } from './db.js';

let importProgress = {
  total: 0,
  current: 0,
  status: 'idle', // idle, scanning, importing, complete, error
  errors: [],
};

export function getImportProgress() {
  return { ...importProgress };
}

export function resetImportProgress() {
  importProgress = {
    total: 0,
    current: 0,
    status: 'idle',
    errors: [],
  };
}

// Validate and filter audio files
export function filterAudioFiles(files) {
  const audioFiles = Array.from(files).filter(isAudioFile);
  return audioFiles;
}

// Import single file
async function importFile(file) {
  try {
    // Extract metadata
    const metadata = await extractMetadata(file);
    
    // Generate unique ID
    const id = generateSongId(file);
    
    // Create song object
    const song = {
      id,
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      artist: metadata.artist || 'Unknown Artist',
      album: metadata.album || 'Unknown Album',
      duration: metadata.duration || 0,
      durationFormatted: formatDuration(metadata.duration || 0),
      cover: metadata.cover || getDefaultCover(),
      year: metadata.year || '',
      genre: metadata.genre || '',
      track: metadata.track || '',
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      fileType: file.type,
      source: 'local',
      sourceUrl: URL.createObjectURL(file),
      addedAt: Date.now(),
      plays: 0,
      isLocal: true,
    };
    
    return song;
  } catch (error) {
    console.error('Error importing file:', file.name, error);
    return {
      error: true,
      fileName: file.name,
      message: error.message || 'Failed to import file',
    };
  }
}

// Import multiple files
export async function importFiles(files, onProgress) {
  const audioFiles = filterAudioFiles(files);
  
  if (audioFiles.length === 0) {
    return {
      success: false,
      message: 'No valid audio files found',
      imported: 0,
      errors: 0,
    };
  }
  
  // Reset progress
  resetImportProgress();
  importProgress.total = audioFiles.length;
  importProgress.status = 'importing';
  
  const results = [];
  const errors = [];
  
  // Process files in batches to avoid overwhelming the browser
  const batchSize = 5;
  for (let i = 0; i < audioFiles.length; i += batchSize) {
    const batch = audioFiles.slice(i, i + batchSize);
    const batchPromises = batch.map(async (file) => {
      const song = await importFile(file);
      importProgress.current++;
      
      if (onProgress) {
        onProgress({
          ...importProgress,
          percentage: Math.round((importProgress.current / importProgress.total) * 100),
        });
      }
      
      return song;
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.error) {
        errors.push(result);
      } else {
        results.push(result);
      }
    });
  }
  
  // Save to IndexedDB
  if (results.length > 0) {
    try {
      await saveSongs(results);
      importProgress.status = 'complete';
    } catch (error) {
      console.error('Error saving to database:', error);
      importProgress.status = 'error';
      return {
        success: false,
        message: 'Failed to save songs to database',
        imported: 0,
        errors: audioFiles.length,
      };
    }
  } else {
    importProgress.status = errors.length > 0 ? 'error' : 'complete';
  }
  
  return {
    success: results.length > 0,
    message: results.length > 0 
      ? `Successfully imported ${results.length} song${results.length !== 1 ? 's' : ''}`
      : 'No songs were imported',
    imported: results.length,
    errors: errors.length,
    errorDetails: errors,
  };
}

// Import from folder (where supported)
export async function importFromFolder(folderHandle, onProgress) {
  try {
    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      return {
        success: false,
        message: 'Folder selection is not supported in this browser',
        imported: 0,
        errors: 0,
      };
    }
    
    const files = [];
    
    async function readDirectory(dirHandle) {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (isAudioFile(file)) {
            files.push(file);
          }
        } else if (entry.kind === 'directory') {
          await readDirectory(entry);
        }
      }
    }
    
    await readDirectory(folderHandle);
    
    if (files.length === 0) {
      return {
        success: false,
        message: 'No audio files found in folder',
        imported: 0,
        errors: 0,
      };
    }
    
    return await importFiles(files, onProgress);
  } catch (error) {
    console.error('Error importing from folder:', error);
    return {
      success: false,
      message: error.message || 'Failed to import from folder',
      imported: 0,
      errors: 0,
    };
  }
}

// Remove song from library
export async function removeSong(songId) {
  try {
    await deleteSong(songId);
    return { success: true };
  } catch (error) {
    console.error('Error removing song:', error);
    return { success: false, error };
  }
}

// Remove multiple songs
export async function removeSongs(songIds) {
  try {
    await deleteSongs(songIds);
    return { success: true, removed: songIds.length };
  } catch (error) {
    console.error('Error removing songs:', error);
    return { success: false, error };
  }
}

// Clear entire library
export async function clearLibrary() {
  try {
    await clearAllSongs();
    return { success: true };
  } catch (error) {
    console.error('Error clearing library:', error);
    return { success: false, error };
  }
}

// Get library statistics
export async function getLibraryStats() {
  try {
    const songs = await getAllSongs();
    const count = songs.length;
    const totalSize = songs.reduce((sum, song) => sum + (song.fileSize || 0), 0);
    
    return {
      count,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      songs: songs.slice(0, 10), // Return first 10 for preview
    };
  } catch (error) {
    console.error('Error getting library stats:', error);
    return {
      count: 0,
      totalSize: 0,
      totalSizeFormatted: '0 Bytes',
      songs: [],
    };
  }
}

// Search songs in library
export async function searchLocalSongs(query) {
  try {
    const songs = await getAllSongs();
    const lowerQuery = query.toLowerCase();
    
    return songs.filter(song => 
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery) ||
      song.album.toLowerCase().includes(lowerQuery) ||
      (song.genre && song.genre.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
}

// Sort songs
export async function sortLocalSongs(sortBy = 'addedAt', order = 'desc') {
  try {
    const songs = await getAllSongs();
    
    return songs.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle string comparisons
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      // Handle undefined values
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  } catch (error) {
    console.error('Error sorting songs:', error);
    return [];
  }
}

// Filter songs
export async function filterLocalSongs(filters) {
  try {
    let songs = await getAllSongs();
    
    if (filters.artist) {
      songs = songs.filter(s => s.artist === filters.artist);
    }
    
    if (filters.album) {
      songs = songs.filter(s => s.album === filters.album);
    }
    
    if (filters.genre) {
      songs = songs.filter(s => s.genre === filters.genre);
    }
    
    if (filters.year) {
      songs = songs.filter(s => s.year === filters.year);
    }
    
    return songs;
  } catch (error) {
    console.error('Error filtering songs:', error);
    return [];
  }
}

// Get unique values for filters
export async function getUniqueValues(field) {
  try {
    const songs = await getAllSongs();
    const values = new Set();
    
    songs.forEach(song => {
      if (song[field]) {
        values.add(song[field]);
      }
    });
    
    return Array.from(values).sort();
  } catch (error) {
    console.error('Error getting unique values:', error);
    return [];
  }
}

// Restore library from IndexedDB
export async function restoreLibrary() {
  try {
    const songs = await getAllSongs();
    return songs;
  } catch (error) {
    console.error('Error restoring library:', error);
    return [];
  }
}

// Check if library has songs
export async function hasLocalSongs() {
  try {
    const count = await getSongsCount();
    return count > 0;
  } catch (error) {
    console.error('Error checking library:', error);
    return false;
  }
}

// Get default cover (placeholder)
function getDefaultCover() {
  return `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#1a1a2e"/>
  <circle cx="150" cy="150" r="80" fill="#16213e"/>
  <circle cx="150" cy="150" r="40" fill="#0f3460"/>
  <circle cx="150" cy="150" r="15" fill="#e94560"/>
  <text x="150" y="260" text-anchor="middle" fill="#8b5cf6" font-family="Arial" font-size="14">No Cover</text>
</svg>
`)}`;
}

// Re-export db functions
export { deleteSong, deleteSongs, clearAllSongs, getAllSongs, getSong, saveSong } from './db.js';