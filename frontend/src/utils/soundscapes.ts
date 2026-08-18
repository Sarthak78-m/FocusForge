// ─── Copyright-Free MP3 Study Tracks & Offline Audio Engine ────────────────────

export type StudyTrack = {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  audioUrl: string;
};

export const CURATED_MP3_TRACKS: StudyTrack[] = [
  {
    id: 'mp3-lofi',
    name: 'Lofi Chill Study Beats',
    subtitle: 'Relaxing Instrumental Beats',
    icon: '🎧',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: 'mp3-studybeats',
    name: 'Deep Study Beats',
    subtitle: 'Upbeat Flow State Music',
    icon: '🚀',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: 'mp3-neural',
    name: 'Neural Sync (Binaural)',
    subtitle: 'Deep Cognitive Focus Beats',
    icon: '🌌',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: 'mp3-rain',
    name: 'Cozy Rain & Cafe Ambience',
    subtitle: 'Soft Rainfall & Cozy Atmosphere',
    icon: '☕',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
  },
];

export type CustomMp3Track = {
  id: string;
  name: string;
  sizeFormatted: string;
  createdAt: number;
  data: ArrayBuffer;
};

const DB_NAME = 'focusforge_audio_db_v3';
const STORE_NAME = 'custom_mp3_tracks';
const MAX_CUSTOM_TRACKS = 5;

// ── IndexedDB Helpers ─────────────────────────────────────────────────────────

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredCustomTracks(): Promise<CustomMp3Track[]> {
  try {
    const db = await openAudioDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveCustomLocalTrack(file: File): Promise<CustomMp3Track> {
  const existing = await getStoredCustomTracks();
  if (existing.length >= MAX_CUSTOM_TRACKS) {
    throw new Error(`Maximum limit of ${MAX_CUSTOM_TRACKS} offline songs reached.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const track: CustomMp3Track = {
    id: 'mp3_' + Date.now(),
    name: file.name.replace(/\.[^/.]+$/, ''),
    sizeFormatted: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    createdAt: Date.now(),
    data: arrayBuffer,
  };

  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(track);
    req.onsuccess = () => resolve(track);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCustomTrack(id: string): Promise<void> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Master MP3 Audio Engine ───────────────────────────────────────────────────

class SoundscapeEngine {
  public isPlaying = false;
  public activeId: string | null = null;
  public activeType: 'curated' | 'custom' | null = null;
  public activeName: string | null = null;
  public volume = 0.5;
  public currentTime = 0;
  public duration = 0;

  private listeners: Set<() => void> = new Set();
  private audioEl: HTMLAudioElement | null = null;
  private blobUrl: string | null = null;

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private attachAudioEvents(audio: HTMLAudioElement) {
    audio.addEventListener('timeupdate', () => {
      this.currentTime = audio.currentTime || 0;
      this.notify();
    });
    audio.addEventListener('loadedmetadata', () => {
      this.duration = isNaN(audio.duration) ? 0 : audio.duration;
      this.notify();
    });
    audio.addEventListener('ended', () => {
      if (!audio.loop) {
        this.isPlaying = false;
        this.notify();
      }
    });
  }

  public seek(time: number) {
    if (this.audioEl) {
      this.audioEl.currentTime = time;
      this.currentTime = time;
      this.notify();
    }
  }

  public async playCurated(track: StudyTrack) {
    if (this.isPlaying && this.activeId === track.id) {
      this.stopAll();
      return;
    }
    this.stopAll();

    try {
      const audio = new Audio(track.audioUrl);
      audio.loop = true;
      audio.volume = this.volume;
      this.attachAudioEvents(audio);
      await audio.play();

      this.audioEl = audio;
      this.isPlaying = true;
      this.activeId = track.id;
      this.activeType = 'curated';
      this.activeName = track.name;
      this.notify();
    } catch {
      this.stopAll();
    }
  }

  public async playCustomTrack(track: CustomMp3Track) {
    if (this.isPlaying && this.activeId === track.id) {
      this.stopAll();
      return;
    }
    this.stopAll();

    try {
      const blob = new Blob([track.data], { type: 'audio/mpeg' });
      this.blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.blobUrl);
      audio.loop = true;
      audio.volume = this.volume;
      this.attachAudioEvents(audio);
      await audio.play();

      this.audioEl = audio;
      this.isPlaying = true;
      this.activeId = track.id;
      this.activeType = 'custom';
      this.activeName = track.name;
      this.notify();
    } catch {
      this.stopAll();
    }
  }

  public togglePlayCurated(track: StudyTrack) {
    if (this.isPlaying && this.activeId === track.id) {
      this.stopAll();
    } else {
      this.playCurated(track);
    }
  }

  public togglePlayCustom(track: CustomMp3Track) {
    if (this.isPlaying && this.activeId === track.id) {
      this.stopAll();
    } else {
      this.playCustomTrack(track);
    }
  }

  public stopAll() {
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {}
      this.audioEl = null;
    }
    if (this.blobUrl) {
      try {
        URL.revokeObjectURL(this.blobUrl);
      } catch {}
      this.blobUrl = null;
    }

    this.isPlaying = false;
    this.activeId = null;
    this.activeType = null;
    this.activeName = null;
    this.currentTime = 0;
    this.duration = 0;
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
    this.notify();
  }

  // Backwards compatibility aliases
  public play(type?: any, volume?: number) {
    if (volume !== undefined) this.setVolume(volume);
    this.playCurated(CURATED_MP3_TRACKS[0]);
  }

  public stop() {
    this.stopAll();
  }

  public playSoundscape(id: string, volume?: number) {
    if (volume !== undefined) this.setVolume(volume);
    const found = CURATED_MP3_TRACKS.find((t) => t.id === id);
    if (found) {
      this.playCurated(found);
    } else {
      this.playCurated(CURATED_MP3_TRACKS[0]);
    }
  }
}

export const soundscapes = new SoundscapeEngine();
export const CALMING_SOUNDSCAPES = CURATED_MP3_TRACKS;
export type SoundscapeId = string;
export type CustomTrack = CustomMp3Track;
