/**
 * Singleton audio player: stopping previous before playing next prevents
 * games' welcome / instruction / question / answer cues from overlapping.
 */
let currentAudio: HTMLAudioElement | null = null;
let globalVolume = 1;

export function setGlobalVolume(v: number): void {
  globalVolume = Math.max(0, Math.min(1, v));
  if (currentAudio) currentAudio.volume = globalVolume;
}

export function getGlobalVolume(): number {
  return globalVolume;
}

export function stop(): void {
  if (!currentAudio) return;
  currentAudio.onended = null;
  currentAudio.onerror = null;
  currentAudio.pause();
  currentAudio.removeAttribute('src');
  currentAudio.load();
  currentAudio = null;
}

export function play(url?: string | null): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }

    stop();

    const audio = new Audio();
    currentAudio = audio;
    audio.preload = 'auto';
    audio.volume = globalVolume;

    const done = () => {
      if (currentAudio === audio) currentAudio = null;
      audio.onended = null;
      audio.onerror = null;
      resolve();
    };

    audio.onended = done;
    audio.onerror = done;
    audio.src = url;
    audio.play().catch(done);
  });
}
