import { CURRENT_SCHEMA_VERSION, FLAG, TileMap, locomotionController, makeAnimator, pauseButtonRow, tileMapToRows, type EntityData, type SceneData } from '@tilewright/runtime';
import { DARKNESS, FLOOR, LAMP_RANGE, TERRACE } from './model';
import { HEDGE_TOP, TILE } from './scene';

/**
 * The Travers Conservatory: a peaceful, customizable playable garden hub.
 * Players can walk around between puzzles, toggle the conservatory lamps, and press E beside
 * any of the 6 planters to arrange their unlocked nocturnal flora and garden decor.
 */
const HUB_GRID = [
  '#  #  #  #  #  #  #  #  #  #',
  '#  ^  ^  .  .  .  .  .  ^  ^',
  '#  ^  .  .  .  w  .  .  .  ^',
  '#  .  .  .  w  w  w  .  .  .',
  '#  .  .  .  .  w  .  .  .  .',
  '#  .  .  .  .  .  .  .  .  .',
];

const pic = (asset: string, w: number, height: number, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  shape: 'box',
  color: 0xffffff,
  w,
  d: w,
  height,
  sortOffset: 0,
  visible: true,
  asset,
  ...extra,
});

const solid = (w: number, height: number): Record<string, unknown> => ({
  w,
  d: w,
  height,
  solid: true,
  trigger: false,
  layer: 16,
  mask: 65535,
  enabled: true,
  inside: [],
});

export function hubScene(opts: { total: number; flyTotal: number; chapters: number }): SceneData {
  const rows = HUB_GRID.map((r) => r.trim().split(/\s+/));
  const h = rows.length;
  const w = rows[0]!.length;
  const map = new TileMap(w, h);
  let ground = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y]![x]!;
      ground += ch;
      if (ch === '#') {
        map.set(x, y, TILE.hedge, HEDGE_TOP);
        map.setFlag(x, y, FLAG.BLOCK);
      } else if (ch === 'w') {
        map.set(x, y, TILE.pond, FLOOR);
        map.setFlag(x, y, FLAG.WATER);
      } else if (ch === '^') {
        map.set(x, y, TILE.terrace, TERRACE);
      } else {
        map.set(x, y, TILE.path, FLOOR);
      }
    }
  }

  let n = 0;
  const id = (): string => `h${++n}`;
  const entities: EntityData[] = [
    {
      id: id(),
      name: 'Gardener',
      tags: ['player'],
      components: {
        transform: { x: 5.5, y: 5.5, h: FLOOR, facing: 7 },
        sprite: pic('gardener', 0.6, 1.2),
        animator: makeAnimator({ asset: 'gardener', clip: 'stand', controller: locomotionController({ idle: 'stand', walk: 'walk' }), state: 'idle' }),
        body: {
          vx: 0, vy: 0, vz: 0, radius: 0.3, height: 1.2, state: 'ground', stepUp: 0.35, stepDown: 0.4,
          ledge: 'fall', pits: 'fall', wade: false, gravity: 1, peakZ: 0, layer: 2, mask: 65535, noclip: false,
          blockedBy: [], blockedTerrain: false,
        },
        script_Gardener: { speed: 5 },
      },
    },
    // Two warm conservatory lamps you can light or douse
    {
      id: id(),
      name: 'Conservatory Lamp West',
      tags: ['lamp', 'handlamp'],
      components: {
        transform: { x: 3.5, y: 1.5, h: FLOOR, facing: 2 },
        sprite: pic('lamp_on', 0.4, 1.1),
        collider: solid(0.5, 1),
        light: { radius: LAMP_RANGE + 1.4, intensity: 1, color: 'warm', shadows: true, flicker: 0.08, mode: 'always' },
        script_Lamp: { startLit: true, byHand: true, look: 'lamp' },
      },
    },
    {
      id: id(),
      name: 'Conservatory Lamp East',
      tags: ['lamp', 'handlamp'],
      components: {
        transform: { x: 7.5, y: 1.5, h: FLOOR, facing: 2 },
        sprite: pic('lamp_on', 0.4, 1.1),
        collider: solid(0.5, 1),
        light: { radius: LAMP_RANGE + 1.4, intensity: 1, color: 'warm', shadows: true, flicker: 0.08, mode: 'always' },
        script_Lamp: { startLit: true, byHand: true, look: 'lamp' },
      },
    },
  ];

  // Six customizable botanical planters arranged symmetrically around the lily pond
  const plots: { x: number; y: number; slot: number; initial: string }[] = [
    { x: 2, y: 3, slot: 1, initial: 'moonbloom' },
    { x: 2, y: 4, slot: 2, initial: 'moonbloom' },
    { x: 4, y: 1, slot: 3, initial: 'moonbloom' },
    { x: 6, y: 1, slot: 4, initial: 'moonbloom' },
    { x: 8, y: 3, slot: 5, initial: 'moonbloom' },
    { x: 8, y: 4, slot: 6, initial: 'moonbloom' },
  ];
  for (const pl of plots) {
    entities.push({
      id: id(),
      name: `Planter ${pl.slot}`,
      tags: ['planter'],
      components: {
        transform: { x: pl.x + 0.5, y: pl.y + 0.5, h: FLOOR, facing: 2 },
        sprite: pic('moonbloom_3', 0.9, 1.2),
        collider: solid(0.8, 1),
        script_Planter: { slot: pl.slot, initial: pl.initial },
      },
    });
  }

  entities.push({
    id: id(),
    name: 'Room',
    tags: ['room'],
    components: {
      transform: { x: w / 2, y: h / 2, h: FLOOR, facing: 2 },
      roomCamera: { zoom: 1.5, on: true },
      script_Room: {
        room: 'hub',
        name: 'The Conservatory',
        no: 0,
        hint: 'Press E beside any planter to arrange your unlocked flora. Esc opens Rooms and the Herbarium.',
        chapter: 'The Travers Conservatory',
        chapterNo: 0,
        chapterLine: '',
        chapters: opts.chapters,
        total: opts.total,
        flyTotal: opts.flyTotal,
        par: 0,
        difficulty: 0,
        width: w,
        ground,
      },
    },
  });
  entities.push({
    id: id(),
    name: 'Lamp mark',
    tags: ['cursor'],
    components: { transform: { x: 5.5, y: 5.5, h: FLOOR, facing: 2 }, sprite: pic('cursor', 0.2, 0.2, { noShadow: true, visible: false, sortOffset: 2 }) },
  });

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: 'The Conservatory',
    map: tileMapToRows(map),
    entities,
    regions: [{ id: 'r1', name: 'The Conservatory', x: 0, y: 0, w, h, cameraBounds: false, music: 'nightgarden', darkness: DARKNESS * 0.75, bossActive: false }],
    wires: [],
    variables: [],
    events: [pauseButtonRow()],
    graphs: [],
  };
}
