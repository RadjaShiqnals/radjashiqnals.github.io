let audioCtx: AudioContext | null = null;
let isSoundMuted = false;

export function initAudio() {
  if (typeof window === "undefined") return;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function setMuteState(muted: boolean) {
  isSoundMuted = muted;
  if (typeof window !== "undefined") {
    localStorage.setItem("radjaos_muted", muted ? "true" : "false");
  }
}

export function getMuteState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("radjaos_muted") === "true";
}

/**
 * Play a smooth, futuristic harmonic chime on system boot / unlock
 */
export function playBootChime() {
  if (isSoundMuted) return;
  initAudio();
  if (!audioCtx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Harmonic Chord)
  const now = audioCtx.currentTime;

  notes.forEach((freq, index) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.9);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 1.0);
  });
}

/**
 * Play an ascending subtle blip on window open
 */
export function playWindowOpen() {
  if (isSoundMuted) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Play a descending subtle blip on window close
 */
export function playWindowClose() {
  if (isSoundMuted) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.07);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Retro error buzz for terminal or alert
 */
export function playErrorBeep() {
  if (isSoundMuted) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(160, now);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}
