import type { Room } from './model';
import type { RoomReport } from './verify';

/**
 * Playability and difficulty analyzer (0 to 100) for Nightgarden rooms.
 * - Room 1 ("First light") starts at 0.
 * - Difficulty scales smoothly through all 5 chapters up to 100 on the finale.
 * - Also checks architectural layout quality (no bare 2-row strips, proper garden framing).
 */

export interface DifficultyBreakdown {
  /** Normalized 0..100 difficulty score (0 = gentle intro, 100 = grand finale). */
  score: number;
  /** Raw unscaled complexity score before 0..100 normalization. */
  raw: number;
  /** Optimal steps (Par for the Master Gardener Gold Leaf medal). */
  par: number;
  /** Human-readable band: "Gentle", "Thoughtful", "Clever", "Demanding", "Master". */
  band: string;
  /** Layout & playability issues found (empty when clean). */
  issues: string[];
}

const MECHANIC_WEIGHTS: Record<string, number> = {
  handLamp: 1,
  glowLamp: 3,
  moonbloom: 2,
  duskcap: 7,
  terrace: 3,
  trench: 9,
  pond: 7,
  crate: 9,
  plate: 8,
  gate: 8,
  screen: 12,
  wiredLamp: 12,
  brazier: 14,
  moonstone: 18,
  shadestone: 20,
};

/** Count distinct mechanics present in a room and sum their cognitive weights. */
export function mechanicWeight(room: Room): number {
  const seen = new Set<string>();
  for (const row of room.ground) {
    for (const g of row) {
      if (g === 'terrace' || g === 'trench' || g === 'pond') seen.add(g);
    }
  }
  for (const t of room.things) {
    if (t.kind === 'lamp') seen.add(t.mode === 'hand' ? 'handLamp' : t.mode === 'fixed' ? 'glowLamp' : 'wiredLamp');
    else if (t.kind === 'bloom') seen.add(t.bloom!);
    else if (t.kind === 'stone') seen.add(t.flag ? 'shadestone' : 'moonstone');
    else if (t.kind === 'crate' || t.kind === 'brazier' || t.kind === 'screen' || t.kind === 'plate' || t.kind === 'gate') seen.add(t.kind);
  }
  let sum = 0;
  for (const k of seen) sum += MECHANIC_WEIGHTS[k] ?? 0;
  return sum;
}

/** Check that a room looks like a proper walled garden rather than a tiny floating strip. */
export function layoutIssues(room: Room): string[] {
  const issues: string[] = [];
  if (room.w < 5 || room.h < 4) issues.push(`layout too narrow (${room.w}x${room.h}; gardens should be at least 5x4)`);
  let hedges = 0;
  let walkable = 0;
  for (const row of room.ground) {
    for (const g of row) {
      if (g === 'hedge') hedges++;
      if (g === 'floor' || g === 'trench' || g === 'terrace') walkable++;
    }
  }
  if (hedges < 4) issues.push(`needs garden framing (only ${hedges} hedge cells; expected at least 4)`);
  if (walkable < 6) issues.push(`too cramped (${walkable} walkable cells)`);
  return issues;
}

/** Raw complexity score combining solution depth, actions, branching, and mechanic interplay. */
export function rawDifficulty(room: Room, report: Pick<RoomReport, 'steps' | 'toggles' | 'pushes' | 'states'>): number {
  const mech = mechanicWeight(room);
  const stateScore = Math.log2(Math.max(2, report.states));
  return report.steps * 1.35 + report.toggles * 3.2 + report.pushes * 4.0 + stateScore * 3.8 + mech * 1.45;
}

export function bandOf(score: number): string {
  if (score <= 15) return 'Gentle';
  if (score <= 38) return 'Thoughtful';
  if (score <= 62) return 'Clever';
  if (score <= 84) return 'Demanding';
  return 'Master';
}

/**
 * Score a full ordered list of rooms from 0 to 100, anchored so the first room is 0 and the hardest finale is 100.
 * Also returns curve-health warnings if the difficulty jumps wildly or drops sharply.
 */
export function analyzeProgression(entries: { room: Room; report: RoomReport }[]): {
  byId: Map<string, DifficultyBreakdown>;
  curveIssues: string[];
} {
  const raws = entries.map(({ room, report }) => rawDifficulty(room, report));
  const minRaw = raws[0] ?? 0;
  const maxRaw = Math.max(minRaw + 1, ...raws);
  const byId = new Map<string, DifficultyBreakdown>();
  const scores: number[] = [];

  entries.forEach(({ room, report }, i) => {
    const raw = raws[i]!;
    const norm = i === 0 ? 0 : Math.round(((raw - minRaw) / (maxRaw - minRaw)) * 100);
    const score = Math.max(0, Math.min(100, norm));
    scores.push(score);
    const issues = [...layoutIssues(room)];
    if (!report.ok || report.steps <= 0) issues.push('not playable');
    byId.set(room.id, { score, raw, par: report.steps, band: bandOf(score), issues });
  });

  const curveIssues: string[] = [];
  if (scores.length > 0 && scores[0] !== 0) curveIssues.push(`first room must start at difficulty 0 (got ${scores[0]})`);
  if (scores.length > 1 && scores[scores.length - 1]! < 95) curveIssues.push(`final room should reach 95-100 difficulty (got ${scores[scores.length - 1]})`);
  // Within each chapter (same leading digit, e.g. r1xx, r2xx), rooms should climb cleanly; across chapters, both average and peak must rise.
  const chapters = new Map<string, number[]>();
  entries.forEach(({ room }, i) => {
    const ch = room.id.slice(0, 2);
    const list = chapters.get(ch) ?? [];
    if (list.length > 0 && scores[i]! < list[list.length - 1]! - 3) {
      curveIssues.push(`${room.id} drops within chapter (${list[list.length - 1]} -> ${scores[i]})`);
    }
    list.push(scores[i]!);
    chapters.set(ch, list);
  });
  let prevAvg = -1;
  let prevPeak = -1;
  for (const [ch, list] of chapters) {
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    const peak = Math.max(...list);
    if (avg <= prevAvg) curveIssues.push(`chapter ${ch} average (${avg.toFixed(1)}) did not rise above previous (${prevAvg.toFixed(1)})`);
    if (peak <= prevPeak) curveIssues.push(`chapter ${ch} peak (${peak}) did not rise above previous (${prevPeak})`);
    prevAvg = avg;
    prevPeak = peak;
  }
  return { byId, curveIssues };
}
