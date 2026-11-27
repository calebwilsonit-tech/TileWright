// What a room tells the rest of the game when it starts: its name and number for the heads-up display, the totals
// for the Rooms screen, the chapter card, step-by-step Undo (Z), Photo Mode (V), and live Milestone tracking.
/* The light rule (written here by the build from src/light.ts: change it there, never here). */
function groundTop(ch: string): number {
  return ch === '~' ? 1 : ch === '^' ? 5 : 3;
}

/** Which cells are lit: one true or false per cell, row by row. */
function litCells(m: { w: number; h: number; ground: string; tall: number[]; lights: { x: number; y: number; range: number }[] }): boolean[] {
  const out: boolean[] = [];
  for (let i = 0; i < m.w * m.h; i++) out.push(false);
  const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < m.w && y < m.h;
  for (const l of m.lights) {
    if (!inside(l.x, l.y)) continue;
    const base = groundTop(m.ground[l.y * m.w + l.x]!);
    // does this cell stop light from this lamp?
    const stops = (x: number, y: number): boolean => {
      if (!inside(x, y)) return true;
      const ch = m.ground[y * m.w + x]!;
      if (ch === '#') return true;
      if (ch === '_') return false;
      return groundTop(ch) + (m.tall[y * m.w + x] ?? 0) >= base + 2;
    };
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = l.x + dx;
        const y = l.y + dy;
        if (!inside(x, y) || dx * dx + dy * dy > l.range * l.range) continue;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const sx = Math.sign(dx);
        const sy = Math.sign(dy);
        let clear = true;
        if (ax === 2 && ay === 0) clear = !stops(l.x + sx, l.y);
        else if (ax === 0 && ay === 2) clear = !stops(l.x, l.y + sy);
        else if (ax === 1 && ay === 1) clear = !(stops(l.x + sx, l.y) && stops(l.x, l.y + sy));
        else if (ax === 2 && ay === 1) clear = !stops(l.x + sx, l.y) && !stops(l.x + sx, l.y + sy);
        else if (ax === 1 && ay === 2) clear = !stops(l.x, l.y + sy) && !stops(l.x + sx, l.y + sy);
        if (clear) out[y * m.w + x] = true;
      }
    }
  }
  return out;
}

/** Fireflies in the jar for the Conservatory's Garden shop: 1 for every room tended, 3 for every firefly caught, 2 for every par medal, less what was spent. */
const jar = (v: Record<string, unknown>): number => Math.max(0, Number(v.ng_done ?? 0) + 3 * Number(v.ng_flies ?? 0) + 2 * Number(v.ng_pars ?? 0) - Number(v.hub_spent ?? 0));
/** The Conservatory scene for the garden's current size. */
const hubScene = (v: Record<string, unknown>): string => `scenes/hub${Math.max(0, Math.min(3, Math.floor(Number(v.hub_size ?? 0))))}.scene.json`;

type Snap = {
  px: number;
  py: number;
  ph: number;
  pf: number;
  steps: number;
  lamps: [number, boolean][];
  crates: [number, number, number, number][];
};

const MILESTONES: { key: string; label: string; check: (v: Record<string, unknown>) => boolean }[] = [
  { key: 'ach_first', label: 'First Light', check: (v) => Number(v.ng_done ?? 0) >= 1 },
  { key: 'ach_ch2', label: 'Shadow Walker', check: (v) => Number(v.ng_done ?? 0) >= 6 },
  { key: 'ach_par5', label: 'Steady Hand', check: (v) => Number(v.ng_pars ?? 0) >= 5 },
  { key: 'ach_par10', label: 'Master Gardener', check: (v) => Number(v.ng_pars ?? 0) >= 10 },
  { key: 'ach_flies10', label: 'Firefly Keeper', check: (v) => Number(v.ng_flies ?? 0) >= 10 },
  { key: 'ach_builder', label: 'Conservatory Keeper', check: (v) => Number(v.hub_placed ?? 0) >= 8 },
  { key: 'ach_grand', label: 'Grand Conservatory', check: (v) => Number(v.hub_size ?? 0) >= 3 },
  { key: 'ach_all', label: "Elizabeth's Garden", check: (v) => Number(v.ng_done ?? 0) >= Number(v.ng_total ?? 30) },
];

export default defineScript({
  name: 'Room',
  description: 'Works out which beds are lit, manages HUD variables, Undo (Z), Photo Mode (V), Conservatory routing, and Milestones.',
  settings: {
    room: { value: '', label: 'Room id' },
    name: { value: '', label: 'Room name' },
    no: { value: 1, label: 'Number in the game', min: 1 },
    hint: { value: '', label: 'One line shown at the bottom' },
    nudge: { value: '', label: 'Optional gentle hint from Pause' },
    chapter: { value: '', label: 'Chapter name' },
    chapterNo: { value: 1, label: 'Chapter number', min: 1 },
    chapterLine: { value: '', label: 'The line on the chapter card' },
    chapters: { value: 1, label: 'Chapters in the game', min: 1 },
    total: { value: 1, label: 'Rooms in the game', min: 1 },
    flyTotal: { value: 0, label: 'Fireflies in the game', min: 0 },
    par: { value: 0, label: 'Par steps for Gold Leaf', min: 0 },
    difficulty: { value: 0, label: 'Difficulty (0-100)', min: 0, max: 100 },
    width: { value: 1, label: 'Cells across', min: 1 },
    ground: { value: '', label: 'The ground, one character a cell (# hedge, . path, ~ sunken bed, ^ terrace, w pond, _ nothing)' },
  },
  start(me, game) {
    const s = me.settings;
    const v = game.vars;
    v.ng_room = String(s.room);
    v.ng_room_name = String(s.name);
    v.ng_room_no = Number(s.no);
    v.ng_hint = String(s.hint);
    v.ng_nudge = String(s.nudge || 'Try lighting a lamp or pushing a crate toward a plate.');
    v.ng_chapter = String(s.chapter);
    v.ng_chapter_no = Number(s.chapterNo);
    v.ng_chapter_line = String(s.chapterLine);
    v.ng_chapters = Number(s.chapters);
    v.ng_total = Number(s.total);
    v.ng_fly_total = Number(s.flyTotal);
    v.ng_par = Number(s.par);
    v.ng_difficulty = Number(s.difficulty);
    v.ng_steps = 0;
    const inHub = String(s.room).startsWith('hub');
    v.ng_in_hub = inHub ? 1 : 0;
    v.darkness = Number(inHub ? 0.42 : 0.55);
    if (v.ng_done === undefined) v.ng_done = 0;
    if (v.ng_flies === undefined) v.ng_flies = 0;
    if (v.ng_pars === undefined) v.ng_pars = 0;
    if (v.ng_achs === undefined) v.ng_achs = 0;
    if (v.ng_photo === undefined) v.ng_photo = 0;
    if (v.ng_toast === undefined) v.ng_toast = '';
    if (v.ng_toast_t === undefined) v.ng_toast_t = 0;
    if (v.hub_size === undefined) v.hub_size = 0;
    if (v.hub_spent === undefined) v.hub_spent = 0;
    v.ng_jar = jar(v);
    me.state.history = [] as Snap[];
    // every room up to the one being played can be gone back to
    if (Number(s.no) > 0) {
      v.ng_reach = Math.max(Number(v.ng_reach ?? 1), Number(s.no));
      v.ng_last_room = `scenes/${s.room}.scene.json`;
    }
    const seen = `seen_chapter_${s.chapterNo}`;
    if (Number(s.chapterNo) > 0 && !v[seen]) {
      v[seen] = 1;
      game.do('uiScreen', { op: 'open', screen: 'Chapter' });
    }
  },
  update(me, game) {
    const v = game.vars;
    const room = String(me.settings.room);
    const inHub = room.startsWith('hub');

    // capture Undo snapshot before a step or lamp toggle in puzzle rooms
    if (!inHub && game.eventsOf('before-action').length > 0 && game.player) {
      const p = game.player;
      const hist = (me.state.history ?? []) as Snap[];
      hist.push({
        px: Math.floor(p.x) + 0.5,
        py: Math.floor(p.y) + 0.5,
        ph: p.h,
        pf: p.facing,
        steps: Number(v.ng_steps ?? 0),
        lamps: game.findAll('tag:handlamp').map((l) => [l.id, l.isOutputOn('lit')]),
        crates: game.findAll('tag:crate').map((c) => [c.id, Math.floor(c.x) + 0.5, Math.floor(c.y) + 0.5, c.h]),
      });
      if (hist.length > 200) hist.shift();
      me.state.history = hist;
    }

    // Undo (Z / Backspace): restore the previous snapshot cleanly
    if (!inHub && game.input.pressed('undo') && !v.ng_moving && game.player) {
      const hist = (me.state.history ?? []) as Snap[];
      const snap = hist.pop();
      if (snap) {
        const p = game.player;
        p.x = snap.px;
        p.y = snap.py;
        p.h = snap.ph;
        p.facing = snap.pf;
        v.ng_steps = snap.steps;
        const byId = new Map<number, typeof p>();
        for (const l of game.findAll('tag:handlamp')) byId.set(l.id, l);
        for (const [id, lit] of snap.lamps) {
          const l = byId.get(id);
          if (l) {
            l.state.on = lit;
            l.output('lit', lit);
          }
        }
        const cratesById = new Map<number, typeof p>();
        for (const c of game.findAll('tag:crate')) cratesById.set(c.id, c);
        const nowCrates: Record<number, number> = {};
        const w0 = Number(me.settings.width);
        for (const [id, cx, cy, ch] of snap.crates) {
          const c = cratesById.get(id);
          if (c) {
            c.x = cx;
            c.y = cy;
            c.h = ch;
            nowCrates[id] = Math.floor(cy) * w0 + Math.floor(cx);
          }
        }
        me.state.crates = nowCrates;
        game.do('sound', { name: 'undo', volume: 0.6 });
      }
    }

    // Photo Mode (V): hide/show HUD cleanly for screenshots
    if (game.input.pressed('photo')) {
      v.ng_photo = Number(v.ng_photo) ? 0 : 1;
      game.do('sound', { name: 'photo', volume: 0.55 });
    }

    // what is lit, for the blooms and the moonstones: the variable ng_lit holds one 1 or 0 for each cell, row by row
    const w = Number(me.settings.width);
    const ground = String(me.settings.ground);
    const h = Math.max(1, Math.round(ground.length / w));
    const tall: number[] = [];
    for (let i = 0; i < w * h; i++) tall.push(0);
    const cell = (o: { x: number; y: number }): number => Math.floor(o.y) * w + Math.floor(o.x);
    for (const b of game.findAll('tag:bloom')) if ((b.get<{ height: number }>('collider')?.height ?? 0) >= 1) tall[cell(b)] = 2;
    for (const s of game.findAll('tag:screen')) tall[cell(s)] = 2;
    for (const g of game.findAll('tag:gate')) if (g.get<{ enabled: boolean }>('collider')?.enabled) tall[cell(g)] = 2;
    const lights: { x: number; y: number; range: number }[] = [];
    for (const l of game.findAll('tag:lamp')) if (l.hasTag('glow') || l.isOutputOn('lit')) lights.push({ x: Math.floor(l.x), y: Math.floor(l.y), range: 2.3 });
    for (const z of game.findAll('tag:brazier')) lights.push({ x: Math.floor(z.x), y: Math.floor(z.y), range: 1.5 });
    v.ng_lit = litCells({ w, h, ground, tall, lights }).map((lit) => (lit ? '1' : '0')).join('');
    v.ng_w = w;

    // soft slide sound whenever a crate, brazier or screen moves into a new cell
    const crates = game.findAll('tag:crate');
    const prev = me.state.crates as Record<number, number> | undefined;
    const now: Record<number, number> = {};
    let pushed = false;
    for (const c of crates) {
      const at = cell(c);
      now[c.id] = at;
      if (prev && prev[c.id] !== undefined && prev[c.id] !== at) pushed = true;
    }
    me.state.crates = now;
    if (pushed) game.do('sound', { name: 'push', volume: 0.55 });

    // toast timer & live Milestone unlock checks
    if (Number(v.ng_toast_t ?? 0) > 0) {
      v.ng_toast_t = Math.max(0, Number(v.ng_toast_t) - game.dt);
      if (Number(v.ng_toast_t) <= 0) v.ng_toast = '';
    }
    for (const m of MILESTONES) {
      if (!v[m.key] && m.check(v)) {
        v[m.key] = 1;
        v.ng_achs = Number(v.ng_achs ?? 0) + 1;
        if (!v.ng_toast) {
          v.ng_toast = `Milestone unlocked · ${m.label}`;
          v.ng_toast_t = 4.2;
          game.do('sound', { name: 'par', volume: 0.65 });
        }
      }
    }

    if (game.input.pressed('restart')) game.do('restartArea');
    v.ng_jar = jar(v);
    if (inHub) {
      const want = hubScene(v);
      if (want !== `scenes/${room}.scene.json`) {
        game.travel(want);
        return;
      }
    }
    if (game.input.pressed('hub')) {
      game.travel(inHub ? String(v.ng_last_room || 'scenes/r101.scene.json') : hubScene(v));
      return;
    }
    // a card of the Rooms screen (or a Conservatory row) was chosen
    const to = v.ng_goto;
    if (typeof to === 'string' && to !== '') {
      v.ng_goto = '';
      game.travel(to === 'hub' ? hubScene(v) : to);
    }
  },
});
