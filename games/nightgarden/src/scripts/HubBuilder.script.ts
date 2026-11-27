// The Conservatory builder. The gardener holds one piece from the inventory (Q picks the next one), sees a see-through
// preview of it on the bed in front, and presses E to set it down. E on a placed piece lifts it back into the inventory,
// so anything can be moved. B opens the Garden shop, where fireflies buy pieces and grow the garden.
// Everything is kept in game variables, so it is saved with the game:
//   hub_layout  "x,y,piece;x,y,piece..."   inv_<piece>  how many are held   hub_sel  the piece in hand
const CATALOG: { id: string; label: string; sprite: string; w: number; height: number; solid: boolean; light?: string; flat?: boolean }[] = [
  { id: 'moonbloom', label: 'Moonbloom', sprite: 'moonbloom_3', w: 0.9, height: 1.2, solid: true },
  { id: 'duskcap', label: 'Duskcap', sprite: 'duskcap_3', w: 0.9, height: 1.2, solid: true },
  { id: 'crate', label: 'Potting crate', sprite: 'crate', w: 0.9, height: 0.9, solid: true },
  { id: 'screen', label: 'Trellis screen', sprite: 'screen', w: 0.9, height: 1.2, solid: true },
  { id: 'lantern', label: 'Amber lantern', sprite: 'lamp_on', w: 0.4, height: 1.1, solid: true, light: 'warm' },
  { id: 'brazier', label: 'Warm brazier', sprite: 'brazier', w: 0.9, height: 1.1, solid: true, light: 'warm' },
  { id: 'teallamp', label: 'Teal lamp', sprite: 'wirelamp_on', w: 0.4, height: 1.1, solid: true, light: 'cool' },
  { id: 'moonstone', label: 'Moonstone', sprite: 'moonstone_on', w: 0.7, height: 0.05, solid: false, flat: true },
  { id: 'gracelily', label: "Grace's Moon-Lily", sprite: 'glowlamp', w: 0.4, height: 1.1, solid: true, light: 'cool' },
  { id: 'traversrose', label: 'Travers Night-Rose', sprite: 'shadestone_on', w: 0.7, height: 0.05, solid: false, flat: true },
];
const DEFAULT_LAYOUT = '3,2,moonbloom;3,3,moonbloom;6,2,moonbloom;6,3,moonbloom';
const AHEAD: Record<number, [number, number]> = { 1: [1, 0], 3: [0, 1], 5: [-1, 0], 7: [0, -1] };

type Placed = { x: number; y: number; id: string };
const parse = (text: string): Placed[] =>
  text
    .split(';')
    .map((p) => p.split(','))
    .filter((p) => p.length === 3 && CATALOG.some((c) => c.id === p[2]))
    .map((p) => ({ x: Number(p[0]), y: Number(p[1]), id: String(p[2]) }));
const write = (list: Placed[]): string => list.map((p) => `${p.x},${p.y},${p.id}`).join(';');

export default defineScript({
  name: 'HubBuilder',
  description: 'Lets the player place, lift and move garden pieces in the Conservatory, from an inventory bought with fireflies in the Garden shop.',
  settings: {
    size: { value: 0, label: 'Garden size (0 to 3)', min: 0, max: 3 },
    width: { value: 9, label: 'Cells across', min: 1 },
    ground: { value: '', label: 'Beds, one character a cell (. bed, # hedge, w pond, L lamp)' },
    capacity: { value: 12, label: 'Pieces that fit', min: 1 },
  },
  phase: 'actuator',
  start(me, game) {
    const v = game.vars;
    if (v.hub_layout === undefined) v.hub_layout = DEFAULT_LAYOUT;
    if (v.hub_size === undefined) v.hub_size = 0;
    if (v.hub_spent === undefined) v.hub_spent = 0;
    if (v.hub_sel === undefined) v.hub_sel = '';
    for (const c of CATALOG) if (v[`inv_${c.id}`] === undefined) v[`inv_${c.id}`] = c.id === 'moonbloom' ? 2 : 0;
    me.state.sig = '';
  },
  update(me, game) {
    const v = game.vars;
    const w = Number(me.settings.width);
    const ground = String(me.settings.ground);
    const cap = Number(me.settings.capacity);
    const at = (x: number, y: number): string => (x < 0 || y < 0 || x >= w ? '#' : ground[y * w + x] ?? '#');
    const layout = parse(String(v.hub_layout ?? ''));

    // dress the decor from the layout whenever it changes
    const sig = String(v.hub_layout ?? '');
    if (me.state.sig !== sig) {
      me.state.sig = sig;
      const pool = game.findAll('tag:decor').sort((a, b) => (a.name < b.name ? -1 : 1));
      pool.forEach((d, i) => {
        const p = layout[i];
        const sp = d.get<{ asset?: string; w: number; d: number; height: number; visible: boolean; sortOffset: number; noShadow?: boolean }>('sprite');
        const col = d.get<{ enabled: boolean }>('collider');
        const glow = d.get<{ mode: string; color: string }>('light');
        const c = p ? CATALOG.find((k) => k.id === p.id) : undefined;
        if (!p || !c) {
          d.visible = false;
          if (col) col.enabled = false;
          if (glow) glow.mode = 'whenOn';
          return;
        }
        d.x = p.x + 0.5;
        d.y = p.y + 0.5;
        d.h = me.h;
        d.visible = true;
        if (sp) {
          sp.asset = c.sprite;
          sp.w = c.w;
          sp.d = c.w;
          sp.height = c.height;
          sp.visible = true;
          sp.sortOffset = c.flat ? -0.5 : 0;
          sp.noShadow = c.flat === true;
        }
        if (col) col.enabled = c.solid;
        if (glow) {
          glow.mode = c.light ? 'always' : 'whenOn';
          if (c.light) glow.color = c.light;
        }
      });
    }

    // the piece in hand: Q picks the next one held
    const owned = CATALOG.filter((c) => Number(v[`inv_${c.id}`] ?? 0) > 0);
    let sel = owned.find((c) => c.id === v.hub_sel);
    if (!sel) sel = owned[0];
    if (sel && game.input.pressed('hub_next') && owned.length > 0) {
      sel = owned[(owned.indexOf(sel) + 1) % owned.length]!;
      game.do('sound', { name: 'bump', volume: 0.3 });
    }
    v.hub_sel = sel ? sel.id : '';
    v.hub_sel_label = sel ? `${sel.label} ×${Number(v[`inv_${sel.id}`])}` : 'nothing yet — buy pieces in the Garden shop (B)';
    v.hub_placed = layout.length;
    v.hub_cap = cap;

    if (game.input.pressed('shop')) {
      game.do('uiScreen', { op: 'open', screen: 'Garden shop' });
      return;
    }

    // the bed in front of the gardener
    const p = game.player;
    const ghost = game.find('tag:ghost');
    const mark = game.find('tag:buildmark');
    if (ghost) ghost.visible = false;
    if (mark) mark.visible = false;
    if (!p || game.vars.ng_moving) return;
    const ahead = AHEAD[((Math.round(p.facing) % 8) + 8) % 8];
    if (!ahead) return;
    const tx = Math.floor(p.x) + ahead[0];
    const ty = Math.floor(p.y) + ahead[1];
    const here = layout.findIndex((q) => q.x === tx && q.y === ty);
    const free = here < 0 && at(tx, ty) === '.';

    if (here >= 0 && mark) {
      mark.visible = true;
      mark.x = tx + 0.5;
      mark.y = ty + 0.5;
      mark.h = me.h + 1.9 + 0.1 * Math.sin(game.time * 5);
    } else if (free && sel && ghost && layout.length < cap) {
      ghost.visible = true;
      ghost.x = tx + 0.5;
      ghost.y = ty + 0.5;
      ghost.h = me.h;
      ghost.alpha = 0.45 + 0.1 * Math.sin(game.time * 4);
      const gs = ghost.get<{ asset?: string; w: number; d: number; height: number; visible: boolean }>('sprite');
      if (gs) {
        gs.asset = sel.sprite;
        gs.w = sel.w;
        gs.d = sel.w;
        gs.height = sel.height;
        gs.visible = true;
      }
    }

    if (!game.input.pressed('interact')) return;
    if (here >= 0) {
      const lifted = layout.splice(here, 1)[0]!;
      const c = CATALOG.find((k) => k.id === lifted.id)!;
      v[`inv_${c.id}`] = Number(v[`inv_${c.id}`] ?? 0) + 1;
      v.hub_sel = c.id;
      v.hub_layout = write(layout);
      v.ng_hint = `Lifted the ${c.label}. Face an empty bed and press E to set it down again.`;
      game.do('sound', { name: 'bloom_down', volume: 0.6 });
    } else if (free) {
      if (!sel) v.ng_hint = 'Nothing in hand. Press B to spend fireflies in the Garden shop.';
      else if (layout.length >= cap) v.ng_hint = 'The garden is full. Lift something, or grow the garden in the shop (B).';
      else {
        layout.push({ x: tx, y: ty, id: sel.id });
        v[`inv_${sel.id}`] = Number(v[`inv_${sel.id}`]) - 1;
        v.hub_layout = write(layout);
        v.ng_hint = `Planted a ${sel.label}. E on it lifts it again; Q picks another piece.`;
        game.do('sound', { name: 'bloom_up', volume: 0.6 });
      }
    }
  },
});
