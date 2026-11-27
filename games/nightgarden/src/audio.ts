/**
 * Soft, quiet sound effects and a calm looping nocturne for Nightgarden, synthesized deterministically as 16-bit PCM WAVs.
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

/** Deterministic pseudo-random for soft earthy noise (push, bump, clicks). */
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

function lampOn(): Float32Array {
  const b = new Float32Array(Math.round(0.32 * RATE));
  addTone(b, 0.0, 587.33, 0.28, 0.004, 0.09, 0.22); // D5 warm chime
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
  addTone(b, 0.0, 329.63, 0.18, 0.01, 0.11, 0.1); // E4
  addTone(b, 0.06, 440.0, 0.2, 0.01, 0.13, 0.1); // A4
  addTone(b, 0.12, 587.33, 0.18, 0.01, 0.16, 0.08); // D5
  return b;
}

function bloomDown(): Float32Array {
  const b = new Float32Array(Math.round(0.34 * RATE));
  addTone(b, 0.0, 440.0, 0.16, 0.01, 0.09, 0.08); // A4
  addTone(b, 0.06, 329.63, 0.18, 0.01, 0.11, 0.06); // E4
  addTone(b, 0.12, 261.63, 0.16, 0.01, 0.13, 0.05); // C4
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
  addTone(b, 0.0, 196.0, 0.22, 0.008, 0.09, 0.15); // G3
  addTone(b, 0.05, 293.66, 0.2, 0.008, 0.12, 0.12); // D4
  return b;
}

function gateShut(): Float32Array {
  const b = new Float32Array(Math.round(0.25 * RATE));
  addTone(b, 0.0, 220.0, 0.2, 0.005, 0.07, 0.12); // A3
  addTone(b, 0.04, 146.83, 0.26, 0.005, 0.1, 0.08); // D3
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
  addTone(b, 0.0, 880.0, 0.18, 0.005, 0.16, 0.15); // A5
  addTone(b, 0.06, 1174.66, 0.2, 0.005, 0.18, 0.12); // D6
  addTone(b, 0.13, 1318.51, 0.18, 0.005, 0.24, 0.1); // E6
  return b;
}

function roomDone(): Float32Array {
  const b = new Float32Array(Math.round(0.85 * RATE));
  addTone(b, 0.0, 293.66, 0.2, 0.01, 0.35, 0.12); // D4
  addTone(b, 0.08, 440.0, 0.2, 0.01, 0.35, 0.12); // A4
  addTone(b, 0.16, 587.33, 0.22, 0.01, 0.4, 0.1); // D5
  addTone(b, 0.25, 659.25, 0.2, 0.01, 0.45, 0.08); // E5
  return b;
}

function bumpSound(): Float32Array {
  return synth(0.1, (t) => Math.sin(TAU * (130 - t * 400) * t) * env(t, 0.003, 0.035) * 0.28);
}

/** A calm 12-second seamless loop: warm low pad + gentle plucked notes in D Dorian / pentatonic. */
function nightgardenMusic(): Float32Array {
  const seconds = 12;
  const n = seconds * RATE;
  const out = new Float32Array(n);
  // Warm pad on D3 + A3 with slow breathing LFO (integer cycles over 12s for seamless loop)
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const breath = 0.72 + 0.28 * Math.sin(TAU * (t / 6));
    const pad = (Math.sin(TAU * 146.83 * t) * 0.065 + Math.sin(TAU * 220.0 * t) * 0.045 + Math.sin(TAU * 293.66 * t) * 0.025) * breath;
    out[i] = pad;
  }
  // Gentle harp-like melody droplets, wrapped around the 12s loop so tails carry seamlessly
  const notes: [number, number, number][] = [
    [0.5, 587.33, 0.08], // D5
    [1.75, 523.25, 0.065], // C5
    [3.0, 440.0, 0.08], // A4
    [4.5, 392.0, 0.07], // G4
    [6.0, 440.0, 0.08], // A4
    [7.25, 587.33, 0.075], // D5
    [8.5, 659.25, 0.07], // E5
    [10.0, 523.25, 0.065], // C5
    [11.0, 440.0, 0.06], // A4
  ];
  for (const [start, freq, amp] of notes) {
    const len = Math.floor(1.4 * RATE);
    const i0 = Math.floor(start * RATE);
    for (let k = 0; k < len; k++) {
      const t = k / RATE;
      const e = env(t, 0.015, 0.35);
      const v = amp * e * (Math.sin(TAU * freq * t) + 0.15 * Math.sin(TAU * freq * 2 * t));
      out[(i0 + k) % n]! += v;
    }
  }
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
    ['bump', bumpSound],
    ['nightgarden', nightgardenMusic],
  ];
  return entries.map(([name, fn]) => ({ name, wav: encodeWav(fn()) }));
}
