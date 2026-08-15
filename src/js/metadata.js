// Metadata extraction for audio files
// Default cover image as SVG data URL
const DEFAULT_COVER_SVG = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#1a1a2e"/>
  <circle cx="150" cy="150" r="80" fill="#16213e"/>
  <circle cx="150" cy="150" r="40" fill="#0f3460"/>
  <circle cx="150" cy="150" r="15" fill="#e94560"/>
  <text x="150" y="260" text-anchor="middle" fill="#8b5cf6" font-family="Arial" font-size="14">No Cover</text>
</svg>
`)}`;

export function getDefaultCover() {
  return DEFAULT_COVER_SVG;
}

// Parse duration from audio file
export function parseAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      URL.revokeObjectURL(url);
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
      } else {
        reject(new Error('Invalid duration'));
      }
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio'));
    });
    
    audio.src = url;
  });
}

// Extract metadata using binary parsing (fallback method)
export function extractMetadataBinary(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const view = new DataView(buffer);
        const metadata = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
          cover: getDefaultCover(),
        };
        
        // Try to parse duration from WAV files
        if (file.name.toLowerCase().endsWith('.wav')) {
          const duration = parseWavDuration(view, buffer.byteLength);
          if (duration) metadata.duration = duration;
        }
        
        resolve(metadata);
      } catch (error) {
        console.error('Binary parsing error:', error);
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
          cover: getDefaultCover(),
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        cover: getDefaultCover(),
      });
    };
    
    // Read first 100KB for metadata
    const blob = file.slice(0, 100 * 1024);
    reader.readAsArrayBuffer(blob);
  });
}

function parseWavDuration(view, fileSize) {
  try {
    // WAV header parsing
    const sampleRate = view.getUint32(24, true);
    const byteRate = view.getUint32(28, true);
    const blockAlign = view.getUint16(32, true);
    
    // Find data chunk
    let offset = 12;
    while (offset < fileSize - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true);
      
      if (chunkId === 'data') {
        const dataSize = chunkSize;
        const duration = dataSize / byteRate;
        return duration;
      }
      
      offset += 8 + chunkSize;
    }
  } catch (error) {
    console.error('WAV parsing error:', error);
  }
  return 0;
}

// Extract metadata from ID3 tags (MP3)
export function extractID3Tags(buffer) {
  const metadata = {};
  const view = new DataView(buffer);
  
  try {
    // Check for ID3v2 header
    if (buffer.byteLength > 10) {
      const id3 = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2)
      );
      
      if (id3 === 'ID3') {
        const version = view.getUint8(3);
        const size = decodeID3Size(view, 6);
        
        let offset = 10;
        const endOffset = 10 + size;
        
        while (offset < endOffset - 10) {
          const frameId = String.fromCharCode(
            view.getUint8(offset),
            view.getUint8(offset + 1),
            view.getUint8(offset + 2),
            view.getUint8(offset + 3)
          );
          
          if (frameId === '\x00\x00\x00\x00') break;
          
          const frameSize = version === 4 
            ? decodeID3v2Size(view, offset + 4)
            : view.getUint32(offset + 4, false);
          
          if (frameSize <= 0 || frameSize > endOffset) break;
          
          const frameData = new Uint8Array(buffer, offset + 10, frameSize);
          
          if (frameId.startsWith('T')) {
            const text = decodeTextFrame(frameData);
            if (text) {
              switch (frameId) {
                case 'TIT2':
                  metadata.title = text;
                  break;
                case 'TPE1':
                  metadata.artist = text;
                  break;
                case 'TALB':
                  metadata.album = text;
                  break;
                case 'TYER':
                case 'TDRC':
                  metadata.year = text;
                  break;
                case 'TRCK':
                  metadata.track = text;
                  break;
                case 'TCON':
                  metadata.genre = text;
                  break;
              }
            }
          } else if (frameId === 'APIC') {
            metadata.cover = extractCoverFromAPIC(frameData);
          }
          
          offset += 10 + frameSize;
        }
      }
    }
  } catch (error) {
    console.error('ID3 parsing error:', error);
  }
  
  return metadata;
}

function decodeID3Size(view, offset) {
  return (
    ((view.getUint8(offset) & 0x7f) << 21) |
    ((view.getUint8(offset + 1) & 0x7f) << 14) |
    ((view.getUint8(offset + 2) & 0x7f) << 7) |
    (view.getUint8(offset + 3) & 0x7f)
  );
}

function decodeID3v2Size(view, offset) {
  return (
    ((view.getUint8(offset) & 0x7f) << 21) |
    ((view.getUint8(offset + 1) & 0x7f) << 14) |
    ((view.getUint8(offset + 2) & 0x7f) << 7) |
    (view.getUint8(offset + 3) & 0x7f)
  );
}

function decodeTextFrame(data) {
  const encoding = data[0];
  let text = '';
  
  try {
    if (encoding === 0 || encoding === 3) {
      // ISO-8859-1 or UTF-8
      text = new TextDecoder('utf-8', { fatal: false }).decode(data.slice(1));
    } else if (encoding === 1) {
      // UTF-16 with BOM
      text = new TextDecoder('utf-16', { fatal: false }).decode(data.slice(1));
    } else if (encoding === 2) {
      // UTF-16BE
      text = new TextDecoder('utf-16be', { fatal: false }).decode(data.slice(1));
    }
    
    // Remove null terminators and trim
    text = text.replace(/\0/g, '').trim();
    return text || null;
  } catch (error) {
    return null;
  }
}

function extractCoverFromAPIC(data) {
  try {
    let offset = 1; // Skip encoding byte
    
    // Skip MIME type (null-terminated string)
    while (offset < data.length && data[offset] !== 0) offset++;
    offset++; // Skip null terminator
    
    // Skip picture type
    offset++;
    
    // Skip description (null-terminated string)
    while (offset < data.length && data[offset] !== 0) offset++;
    offset++; // Skip null terminator
    
    // Remaining data is the image
    const imageData = data.slice(offset);
    
    // Determine image format
    let mimeType = 'image/jpeg';
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47) {
      mimeType = 'image/png';
    } else if (imageData[0] === 0x47 && imageData[1] === 0x49 && imageData[2] === 0x46) {
      mimeType = 'image/gif';
    } else if (imageData[0] === 0x52 && imageData[1] === 0x49 && imageData[2] === 0x46 && imageData[3] === 0x46) {
      mimeType = 'image/webp';
    }
    
    const blob = new Blob([imageData], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Cover extraction error:', error);
    return getDefaultCover();
  }
}

// Main metadata extraction function
export async function extractMetadata(file) {
  try {
    // First try to get duration
    let duration = 0;
    try {
      duration = await parseAudioDuration(file);
    } catch (error) {
      console.warn('Could not parse duration:', error);
    }
    
    // Read file for metadata
    const metadata = await extractMetadataBinary(file);
    metadata.duration = duration;
    
    // Try to extract ID3 tags for MP3 files
    if (file.name.toLowerCase().endsWith('.mp3')) {
      const buffer = await file.slice(0, 200 * 1024).arrayBuffer();
      const id3Tags = extractID3Tags(buffer);
      
      // Merge ID3 tags
      if (id3Tags.title) metadata.title = id3Tags.title;
      if (id3Tags.artist) metadata.artist = id3Tags.artist;
      if (id3Tags.album) metadata.album = id3Tags.album;
      if (id3Tags.year) metadata.year = id3Tags.year;
      if (id3Tags.cover) metadata.cover = id3Tags.cover;
    }
    
    // Clean up title from filename if no metadata found
    if (!metadata.title || metadata.title === file.name) {
      metadata.title = file.name.replace(/\.[^/.]+$/, '');
    }
    
    return metadata;
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      cover: getDefaultCover(),
    };
  }
}

// Generate unique ID
export function generateSongId(file) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  const name = file.name.replace(/\.[^/.]+$/, '');
  return `local-${timestamp}-${random}-${name}`;
}

// Format duration
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Validate audio file
export function isAudioFile(file) {
  const validTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/aac',
    'audio/mp4',
    'audio/x-m4a',
    'audio/flac',
    'audio/x-flac',
  ];
  
  const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidType = validTypes.includes(file.type);
  
  return hasValidExtension || hasValidType;
}

// Get file size in human readable format
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}