/**
 * Soft, quiet sound effects and three calm looping nocturnes for Nightgarden, synthesized deterministically as 16-bit PCM WAVs.
 * Kept gentle and warm to match DESIGN.md ("Calm. Warm light in cool dark. Soft and few.").
 */

const RATE = 22050;
const TAU = Math.PI * 2;

function encodeWav(samples: Float32Array, sampleRate = RATE): Buffer {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); // PCM
  buf.writeUInt16LE(1, 20); // linear PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]!));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

/** Deterministic pseudo-random for soft earthy noise (push, bump, breeze, crickets). */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

function synth(seconds: number, fn: (t: number, i: number, total: number) => number): Float32Array {
  const n = Math.max(1, Math.round(seconds * RATE));
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / RATE, i, n);
  return out;
}

function env(t: number, attack: number, decay: number): number {
  if (t < 0) return 0;
  const a = attack > 0 ? Math.min(1, t / attack) : 1;
  return a * Math.exp(-t / Math.max(0.005, decay));
}

function addTone(buf: Float32Array, start: number, freq: number, amp: number, attack: number, decay: number, overtone = 0.18): void {
  const i0 = Math.max(0, Math.floor(start * RATE));
  for (let i = i0; i < buf.length; i++) {
    const t = i / RATE - start;
    if (t > decay * 6) break;
    const e = env(t, attack, decay);
    buf[i]! += amp * e * (Math.sin(TAU * freq * t) + overtone * Math.sin(TAU * freq * 2 * t));
  }
}

function addWrappedNotes(out: Float32Array, notes: [number, number, number][], decay = 0.38, overtone = 0.14): void {
  const n = out.length;
  const len = Math.floor(decay * 5 * RATE);
  for (const [start, freq, amp] of notes) {
    const i0 = Math.floor(start * RATE);
    for (let k = 0; k < len; k++) {
      const t = k / RATE;
      const e = env(t, 0.014, decay);
      const v = amp * e * (Math.sin(TAU * freq * t) + overtone * Math.sin(TAU * freq * 2 * t));
      out[(i0 + k) % n]! += v;
    }
  }
}

function lampOn(): Float32Array {
  const b = new Float32Array(Math.round(0.32 * RATE));
  addTone(b, 0.0, 587.33, 0.28, 0.004, 0.09, 0.22); // D5
  addTone(b, 0.03, 880.0, 0.22, 0.005, 0.12, 0.12); // A5
  return b;
}

function lampOff(): Float32Array {
  const b = new Float32Array(Math.round(0.24 * RATE));
  addTone(b, 0.0, 440.0, 0.22, 0.004, 0.06, 0.08); // A4
  addTone(b, 0.025, 293.66, 0.24, 0.005, 0.09, 0.05); // D4
  return b;
}

function bloomUp(): Float32Array {
  const b = new Float32Array(Math.round(0.38 * RATE));
  addTone(b, 0.0, 329.63, 0.18, 0.01, 0.11, 0.1);
  addTone(b, 0.06, 440.0, 0.2, 0.01, 0.13, 0.1);
  addTone(b, 0.12, 587.33, 0.18, 0.01, 0.16, 0.08);
  return b;
}

function bloomDown(): Float32Array {
  const b = new Float32Array(Math.round(0.34 * RATE));
  addTone(b, 0.0, 440.0, 0.16, 0.01, 0.09, 0.08);
  addTone(b, 0.06, 329.63, 0.18, 0.01, 0.11, 0.06);
  addTone(b, 0.12, 261.63, 0.16, 0.01, 0.13, 0.05);
  return b;
}

function pushSound(): Float32Array {
  const rand = lcg(17);
  let lp = 0;
  return synth(0.18, (t) => {
    lp = lp * 0.86 + rand() * 0.14;
    const e = Math.sin(Math.min(1, t / 0.18) * Math.PI);
    return (lp * 0.55 + Math.sin(TAU * (115 - t * 180) * t) * 0.12) * e;
  });
}

function gateOpen(): Float32Array {
  const b = new Float32Array(Math.round(0.28 * RATE));
  addTone(b, 0.0, 196.0, 0.22, 0.008, 0.09, 0.15);
  addTone(b, 0.05, 293.66, 0.2, 0.008, 0.12, 0.12);
  return b;
}

function gateShut(): Float32Array {
  const b = new Float32Array(Math.round(0.25 * RATE));
  addTone(b, 0.0, 220.0, 0.2, 0.005, 0.07, 0.12);
  addTone(b, 0.04, 146.83, 0.26, 0.005, 0.1, 0.08);
  return b;
}

function plateDown(): Float32Array {
  const b = new Float32Array(Math.round(0.14 * RATE));
  addTone(b, 0.0, 261.63, 0.22, 0.003, 0.05, 0.1);
  return b;
}

function plateUp(): Float32Array {
  const b = new Float32Array(Math.round(0.14 * RATE));
  addTone(b, 0.0, 329.63, 0.18, 0.003, 0.05, 0.1);
  return b;
}

function fireflySound(): Float32Array {
  const b = new Float32Array(Math.round(0.55 * RATE));
  addTone(b, 0.0, 880.0, 0.18, 0.005, 0.16, 0.15);
  addTone(b, 0.06, 1174.66, 0.2, 0.005, 0.18, 0.12);
  addTone(b, 0.13, 1318.51, 0.18, 0.005, 0.24, 0.1);
  return b;
}

function roomDone(): Float32Array {
  const b = new Float32Array(Math.round(0.85 * RATE));
  addTone(b, 0.0, 293.66, 0.2, 0.01, 0.35, 0.12);
  addTone(b, 0.08, 440.0, 0.2, 0.01, 0.35, 0.12);
  addTone(b, 0.16, 587.33, 0.22, 0.01, 0.4, 0.1);
  addTone(b, 0.25, 659.25, 0.2, 0.01, 0.45, 0.08);
  return b;
}

/** Sparkling ascending golden chord for Par medals and milestones. */
function parSound(): Float32Array {
  const b = new Float32Array(Math.round(1.05 * RATE));
  addTone(b, 0.0, 440.0, 0.18, 0.008, 0.32, 0.16); // A4
  addTone(b, 0.07, 587.33, 0.2, 0.008, 0.36, 0.15); // D5
  addTone(b, 0.14, 739.99, 0.2, 0.008, 0.4, 0.14); // F#5
  addTone(b, 0.22, 880.0, 0.22, 0.008, 0.48, 0.12); // A5
  addTone(b, 0.3, 1174.66, 0.16, 0.008, 0.55, 0.1); // D6
  return b;
}

/** Soft reverse-pluck for Undo. */
function undoSound(): Float32Array {
  const b = new Float32Array(Math.round(0.18 * RATE));
  addTone(b, 0.0, 440.0, 0.15, 0.004, 0.055, 0.08);
  addTone(b, 0.035, 329.63, 0.17, 0.004, 0.075, 0.06);
  return b;
}

/** Warm wooden chime for buying in the Garden shop. */
function shopSound(): Float32Array {
  const b = new Float32Array(Math.round(0.42 * RATE));
  addTone(b, 0.0, 523.25, 0.2, 0.005, 0.14, 0.18); // C5
  addTone(b, 0.06, 659.25, 0.2, 0.005, 0.18, 0.14); // E5
  addTone(b, 0.12, 783.99, 0.22, 0.005, 0.24, 0.1); // G5
  return b;
}

/** Soft subtle click for Photo Mode. */
function photoSound(): Float32Array {
  const b = new Float32Array(Math.round(0.12 * RATE));
  addTone(b, 0.0, 740.0, 0.16, 0.002, 0.03, 0.2);
  addTone(b, 0.025, 987.77, 0.12, 0.002, 0.04, 0.1);
  return b;
}

function bumpSound(): Float32Array {
  return synth(0.1, (t) => Math.sin(TAU * (130 - t * 400) * t) * env(t, 0.003, 0.035) * 0.28);
}

/** Track 1 (24s seamless): Early garden nocturne in D Dorian with warm pad, harp droplets, and faint evening breeze. */
function nightgardenMusic(): Float32Array {
  const seconds = 24;
  const n = seconds * RATE;
  const out = new Float32Array(n);
  const rand = lcg(42);
  let breeze = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const breath = 0.72 + 0.28 * Math.sin(TAU * (t / 6));
    const chord = t < 12 ? 146.83 : 130.81; // D3 -> C3
    const pad = (Math.sin(TAU * chord * t) * 0.06 + Math.sin(TAU * 220.0 * t) * 0.042 + Math.sin(TAU * 293.66 * t) * 0.024) * breath;
    breeze = breeze * 0.992 + rand() * 0.008;
    const cricketGate = Math.pow(Math.max(0, Math.sin(TAU * (t / 4))), 6) * (0.5 + 0.5 * Math.sin(TAU * 18 * t));
    const cricket = Math.sin(TAU * 4186 * t) * 0.004 * cricketGate;
    out[i] = pad + breeze * 0.06 + cricket;
  }
  addWrappedNotes(
    out,
    [
      [0.5, 587.33, 0.075], [1.75, 523.25, 0.06], [3.0, 440.0, 0.075], [4.5, 392.0, 0.065],
      [6.0, 440.0, 0.075], [7.25, 587.33, 0.07], [8.5, 659.25, 0.065], [10.0, 523.25, 0.06], [11.2, 440.0, 0.055],
      [12.5, 523.25, 0.075], [14.0, 440.0, 0.065], [15.5, 392.0, 0.07], [17.0, 329.63, 0.065],
      [18.5, 392.0, 0.07], [20.0, 440.0, 0.075], [21.5, 587.33, 0.07], [22.8, 523.25, 0.06],
    ],
    0.42,
    0.15,
  );
  return out;
}

/** Track 2 (24s seamless): Deeper moonlit nocturne in A Dorian / B minor for Chapters 4 & 5. */
function deepgardenMusic(): Float32Array {
  const seconds = 24;
  const n = seconds * RATE;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const breath = 0.68 + 0.32 * Math.sin(TAU * (t / 8));
    const root = t < 12 ? 110.0 : 123.47; // A2 -> B2
    const fifth = t < 12 ? 164.81 : 185.0; // E3 -> F#3
    out[i] = (Math.sin(TAU * root * t) * 0.068 + Math.sin(TAU * fifth * t) * 0.044 + Math.sin(TAU * 246.94 * t) * 0.022) * breath;
  }
  addWrappedNotes(
    out,
    [
      [0.8, 440.0, 0.07], [2.4, 493.88, 0.06], [4.0, 587.33, 0.072], [5.8, 659.25, 0.065],
      [7.6, 587.33, 0.065], [9.4, 493.88, 0.06], [11.0, 440.0, 0.055],
      [12.8, 493.88, 0.072], [14.4, 587.33, 0.065], [16.2, 739.99, 0.068], [18.0, 659.25, 0.062],
      [19.8, 587.33, 0.065], [21.4, 493.88, 0.06], [22.8, 440.0, 0.058],
    ],
    0.52,
    0.11,
  );
  return out;
}

/** Track 3 (24s seamless): Warm cozy waltz-like botanical theme for The Travers Conservatory. */
function conservatoryMusic(): Float32Array {
  const seconds = 24;
  const n = seconds * RATE;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const sway = 0.76 + 0.24 * Math.sin(TAU * (t / 4));
    const root = t < 12 ? 196.0 : 164.81; // G3 -> E3
    out[i] = (Math.sin(TAU * root * t) * 0.055 + Math.sin(TAU * 246.94 * t) * 0.038 + Math.sin(TAU * 293.66 * t) * 0.026) * sway;
  }
  addWrappedNotes(
    out,
    [
      [0.4, 392.0, 0.07], [1.4, 493.88, 0.065], [2.4, 587.33, 0.072], [3.6, 783.99, 0.065],
      [5.0, 739.99, 0.062], [6.4, 587.33, 0.068], [7.8, 493.88, 0.062], [9.2, 587.33, 0.068], [10.6, 659.25, 0.062],
      [12.4, 659.25, 0.07], [13.6, 587.33, 0.064], [14.8, 493.88, 0.068], [16.2, 392.0, 0.065],
      [17.6, 493.88, 0.065], [19.0, 587.33, 0.072], [20.4, 739.99, 0.064], [21.8, 783.99, 0.062], [23.0, 587.33, 0.058],
    ],
    0.46,
    0.16,
  );
  return out;
}

/** Every audio asset of Nightgarden, as `{ name, wav }` ready to write into `assets/audio/<name>.wav`. */
export function nightgardenAudio(): { name: string; wav: Buffer }[] {
  const entries: [string, () => Float32Array][] = [
    ['lamp_on', lampOn],
    ['lamp_off', lampOff],
    ['bloom_up', bloomUp],
    ['bloom_down', bloomDown],
    ['push', pushSound],
    ['gate_open', gateOpen],
    ['gate_shut', gateShut],
    ['plate_down', plateDown],
    ['plate_up', plateUp],
    ['firefly', fireflySound],
    ['room_done', roomDone],
    ['par', parSound],
    ['undo', undoSound],
    ['shop', shopSound],
    ['photo', photoSound],
    ['bump', bumpSound],
    ['nightgarden', nightgardenMusic],
    ['deepgarden', deepgardenMusic],
    ['conservatory', conservatoryMusic],
  ];
  return entries.map(([name, fn]) => ({ name, wav: encodeWav(fn()) }));
}
