// What a room tells the rest of the game when it starts: its name and number for the heads-up display, the totals
// for the Rooms screen, and the chapter card the first time a chapter is entered. R starts the room again.
/* The light rule (written here by the build from src/light.ts: change it there, never here). */
/*__LIGHT_RULE__*/

export default defineScript({
  name: 'Room',
  description: 'Works out which beds are lit (the light rule of the game), says which room this is (for the heads-up display and the Rooms screen), shows the chapter card the first time a chapter is entered, and starts the room again when the Restart button is pressed.',
  settings: {
    room: { value: '', label: 'Room id' },
    name: { value: '', label: 'Room name' },
    no: { value: 1, label: 'Number in the game', min: 1 },
    hint: { value: '', label: 'One line shown at the bottom' },
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
    v.ng_chapter = String(s.chapter);
    v.ng_chapter_no = Number(s.chapterNo);
    v.ng_chapter_line = String(s.chapterLine);
    v.ng_chapters = Number(s.chapters);
    v.ng_total = Number(s.total);
    v.ng_fly_total = Number(s.flyTotal);
    v.ng_par = Number(s.par);
    v.ng_difficulty = Number(s.difficulty);
    v.ng_steps = 0;
    if (v.ng_done === undefined) v.ng_done = 0;
    if (v.ng_flies === undefined) v.ng_flies = 0;
    if (v.ng_pars === undefined) v.ng_pars = 0;
    // every room up to the one being played can be gone back to
    if (Number(s.no) > 0) v.ng_reach = Math.max(Number(v.ng_reach ?? 1), Number(s.no));
    const seen = `seen_chapter_${s.chapterNo}`;
    if (Number(s.chapterNo) > 0 && !v[seen]) {
      v[seen] = 1;
      game.do('uiScreen', { op: 'open', screen: 'Chapter' });
    }
  },
  update(me, game) {
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
    game.vars.ng_lit = litCells({ w, h, ground, tall, lights }).map((v) => (v ? '1' : '0')).join('');
    game.vars.ng_w = w;
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
    if (game.input.pressed('restart')) game.do('restartArea');
    // a card of the Rooms screen was chosen
    const to = game.vars.ng_goto;
    if (typeof to === 'string' && to !== '') {
      game.vars.ng_goto = '';
      game.travel(to);
    }
  },
});
