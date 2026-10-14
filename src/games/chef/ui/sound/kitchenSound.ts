export type KitchenSound = "thunk" | "pop" | "flip" | "bubble" | "mm" | "sparkle" | "bell" | "chime" | "tick";

interface Note {
  readonly wave: OscillatorType;
  readonly from: number;
  readonly to: number;
  readonly start: number;
  readonly length: number;
  readonly volume: number;
}

const NOTES: Readonly<Record<KitchenSound, readonly Note[]>> = {
  thunk: [
    { wave: "triangle", from: 180, to: 70, start: 0, length: 0.09, volume: 0.32 },
    { wave: "square", from: 900, to: 300, start: 0, length: 0.025, volume: 0.05 },
  ],
  pop: [{ wave: "sine", from: 700, to: 1300, start: 0, length: 0.05, volume: 0.12 }],
  flip: [
    { wave: "triangle", from: 300, to: 620, start: 0, length: 0.08, volume: 0.16 },
    { wave: "sine", from: 1400, to: 900, start: 0.05, length: 0.05, volume: 0.06 },
  ],
  bubble: [{ wave: "sine", from: 260, to: 520, start: 0, length: 0.12, volume: 0.1 }],
  mm: [
    { wave: "sine", from: 330, to: 300, start: 0, length: 0.18, volume: 0.14 },
    { wave: "sine", from: 392, to: 440, start: 0.16, length: 0.2, volume: 0.12 },
  ],
  sparkle: [
    { wave: "sine", from: 1320, to: 1320, start: 0, length: 0.08, volume: 0.08 },
    { wave: "sine", from: 1760, to: 1760, start: 0.07, length: 0.08, volume: 0.08 },
    { wave: "sine", from: 2093, to: 2093, start: 0.14, length: 0.14, volume: 0.07 },
  ],
  bell: [
    { wave: "sine", from: 1568, to: 1568, start: 0, length: 0.9, volume: 0.2 },
    { wave: "sine", from: 3136, to: 3136, start: 0, length: 0.5, volume: 0.06 },
    { wave: "triangle", from: 784, to: 784, start: 0, length: 0.6, volume: 0.06 },
  ],
  chime: [
    { wave: "sine", from: 880, to: 880, start: 0, length: 0.16, volume: 0.1 },
    { wave: "sine", from: 1175, to: 1175, start: 0.12, length: 0.2, volume: 0.1 },
  ],
  tick: [{ wave: "square", from: 1200, to: 1200, start: 0, length: 0.02, volume: 0.03 }],
};

let shared: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  try {
    shared ??= new window.AudioContext();
    if (shared.state === "suspended") void shared.resume();
    return shared;
  } catch {
    return null;
  }
}

export function playKitchenSound(kind: KitchenSound): void {
  const context = audio();
  if (context === null) return;
  const now = context.currentTime;
  for (const note of NOTES[kind]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const begin = now + note.start;
    oscillator.type = note.wave;
    oscillator.frequency.setValueAtTime(note.from, begin);
    oscillator.frequency.exponentialRampToValueAtTime(note.to, begin + note.length);
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.exponentialRampToValueAtTime(note.volume, begin + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + note.length);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(begin);
    oscillator.stop(begin + note.length + 0.02);
  }
}
