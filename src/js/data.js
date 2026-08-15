const sampleRate = 22050;

export async function loadSongs() {
  try {
    const response = await fetch('src/data/songs.json');
    if (!response.ok) throw new Error('Failed to load songs.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading songs:', error);
    return [];
  }
}

function buildSample(waveType, frequency, time) {
  const phase = 2 * Math.PI * frequency * time;
  switch (waveType) {
    case 'square':
      return Math.sign(Math.sin(phase));
    case 'triangle':
      return 2 * Math.abs(2 * (time * frequency - Math.floor(time * frequency + 0.5))) - 1;
    case 'sawtooth':
      return 2 * (time * frequency - Math.floor(time * frequency + 0.5));
    default:
      return Math.sin(phase);
  }
}

function envelope(position, length) {
  const release = 0.12;
  if (position < 0.1) {
    return position / 0.1;
  }
  if (position > 1 - release) {
    return (1 - position) / release;
  }
  return 1;
}

function createWavBlob(song) {
  const frameCount = sampleRate * song.durationSeconds;
  const dataSize = frameCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, text) {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < frameCount; i += 1) {
    const t = i / sampleRate;
    const amp = envelope(i / frameCount, frameCount) * 0.65;
    const sample = buildSample(song.wave, song.frequency, t) * amp;
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export function createAudioSource(song) {
  if (song.sourceUrl) return song.sourceUrl;
  const blob = createWavBlob(song);
  song.sourceUrl = URL.createObjectURL(blob);
  return song.sourceUrl;
}

export function formatPlays(plays) {
  if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return String(plays);
}