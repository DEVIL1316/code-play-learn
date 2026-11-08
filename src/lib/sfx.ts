/** Very small WebAudio blips for the AI range. No files, no autoplay. */
let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  } catch {
    return null;
  }
}

function blip(
  from: number,
  to: number,
  duration: number,
  type: OscillatorType,
  volume = 0.05,
) {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(to, 1), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function playShot() {
  blip(240, 70, 0.09, "square", 0.045);
}

export function playHit() {
  blip(620, 900, 0.09, "triangle", 0.06);
  window.setTimeout(() => blip(900, 1200, 0.08, "sine", 0.04), 70);
}

export function playMiss() {
  blip(170, 90, 0.18, "sawtooth", 0.035);
}
