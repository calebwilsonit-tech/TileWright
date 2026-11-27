import { CURRENT_SCHEMA_VERSION, FLAG, TileMap, locomotionController, makeAnimator, pauseButtonRow, tileMapToRows, type EntityData, type SceneData } from '@tilewright/runtime';
import { FLOOR, LAMP_RANGE } from './model';
import { HEDGE_TOP, TILE } from './scene';

/**
 * The Travers Conservatory: the player's own garden between puzzles.
 * - Fireflies earned in the puzzle rooms fill a jar; the Garden shop (B) spends them on plants, lamps and decor.
 * - Walk up to an empty bed and press E to set the held piece down; press E on a placed piece to lift it again (to move it).
 * - The shop also grows the garden itself, in four sizes: each size is its own scene, and the layout carries over.
 * The layout lives in game variables (hub_layout, inv_<piece>, hub_size, hub_spent), so it is saved with the game.
 */

/** Inner beds across and deep, for each garden size. */
export const HUB_SIZES: readonly [number, number][] = [
  [8, 5],
  [10, 6],
  [12, 7],
  [14, 8],
];
/** How many pieces fit in the garden at each size. */
export const HUB_CAPACITY = (size: number): number => 12 + 6 * size;
/** The number of decor objects every hub scene holds ready (enough for the biggest garden). */
export const DECOR_POOL = HUB_CAPACITY(HUB_SIZES.length - 1);
export const hubScenePath = (size: number): string => `scenes/hub${size}.scene.json`;

const ZOOM = [1.75, 1.5, 1.3, 1.15];
const POND = new Set(['4,2', '5,2', '4,3', '5,3']);
const START = { x: 2.5, y: 4.5 };

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

const solid = (w: number, height: number, enabled = true): Record<string, unknown> => ({
  w,
  d: w,
  height,
  solid: true,
  trigger: false,
  layer: 16,
  mask: 65535,
  enabled,
  inside: [],
});

export function hubScene(opts: { total: number; flyTotal: number; chapters: number }, size = 0): SceneData {
  const [iw, ih] = HUB_SIZES[size]!;
  const w = iw + 1;
  const h = ih + 1;
  const lamps = [
    { x: 1, y: 1 },
    { x: iw, y: 1 },
  ];
  const map = new TileMap(w, h);
  let ground = '';
  let builderGround = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0) {
        map.set(x, y, TILE.hedge, HEDGE_TOP);
        map.setFlag(x, y, FLAG.BLOCK);
        ground += '#';
        builderGround += '#';
      } else if (POND.has(`${x},${y}`)) {
        map.set(x, y, TILE.pond, FLOOR);
        map.setFlag(x, y, FLAG.WATER);
        ground += 'w';
        builderGround += 'w';
      } else {
        map.set(x, y, TILE.path, FLOOR);
        ground += '.';
        builderGround += lamps.some((l) => l.x === x && l.y === y) ? 'L' : '.';
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
        transform: { x: START.x, y: START.y, h: FLOOR, facing: 1 },
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
  ];
  // two warm conservatory lamps in the back corners, lit or doused by hand
  lamps.forEach((l, i) =>
    entities.push({
      id: id(),
      name: i === 0 ? 'Conservatory Lamp West' : 'Conservatory Lamp East',
      tags: ['lamp', 'handlamp'],
      components: {
        transform: { x: l.x + 0.5, y: l.y + 0.5, h: FLOOR, facing: 2 },
        sprite: pic('lamp_on', 0.4, 1.1),
        collider: solid(0.5, 1),
        light: { radius: LAMP_RANGE + 1.4 + size * 0.4, intensity: 1, color: 'warm', shadows: true, flicker: 0.08, mode: 'always' },
        script_Lamp: { startLit: true, byHand: true, look: 'lamp' },
      },
    }),
  );
  // the decor the builder places: kept ready (hidden, not solid, dark) and dressed from the saved layout
  for (let i = 0; i < DECOR_POOL; i++) {
    entities.push({
      id: id(),
      name: `Decor ${String(i + 1).padStart(2, '0')}`,
      tags: ['decor'],
      components: {
        transform: { x: START.x, y: START.y, h: FLOOR, facing: 2 },
        sprite: pic('moonbloom_3', 0.9, 1.2, { visible: false }),
        collider: solid(0.8, 1, false),
        light: { radius: 2.6, intensity: 0.9, color: 'warm', shadows: false, flicker: 0.08, mode: 'whenOn' },
      },
    });
  }
  // the see-through preview of the piece being held, and the mark over a piece that E would lift
  entities.push({
    id: id(),
    name: 'Placement preview',
    tags: ['ghost'],
    components: { transform: { x: START.x, y: START.y, h: FLOOR, facing: 2 }, sprite: pic('moonbloom_3', 0.9, 1.2, { visible: false, noShadow: true }) },
  });
  entities.push({
    id: id(),
    name: 'Lift mark',
    tags: ['buildmark'],
    components: { transform: { x: START.x, y: START.y, h: FLOOR, facing: 2 }, sprite: pic('cursor', 0.2, 0.2, { noShadow: true, visible: false, sortOffset: 2 }) },
  });
  entities.push({
    id: id(),
    name: 'Builder',
    tags: ['builder'],
    components: {
      transform: { x: START.x, y: START.y, h: FLOOR, facing: 2 },
      script_HubBuilder: { size, width: w, ground: builderGround, capacity: HUB_CAPACITY(size) },
    },
  });
  entities.push({
    id: id(),
    name: 'Room',
    tags: ['room'],
    components: {
      transform: { x: w / 2, y: h / 2, h: FLOOR, facing: 2 },
      roomCamera: { zoom: ZOOM[size] ?? 1.15, on: true },
      script_Room: {
        room: `hub${size}`,
        name: 'The Conservatory',
        no: 0,
        hint: 'Walk up to an empty bed and press E to plant. B opens the Garden shop.',
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
  // ambient fireflies drifting gently over the lily pond and planted blooms
  for (let i = 0; i < 4; i++) {
    entities.push({
      id: id(),
      name: `Conservatory Firefly ${i + 1}`,
      tags: ['ambfly'],
      components: {
        transform: { x: 4.5 + (i % 2), y: 2.5 + Math.floor(i / 2), h: FLOOR + 1.1, facing: 2 },
        sprite: pic('firefly', 0.35, 0.35, { noShadow: true, sortOffset: 1.5 }),
      },
    });
  }
  entities.push({
    id: id(),
    name: 'Lamp mark',
    tags: ['cursor'],
    components: { transform: { x: START.x, y: START.y, h: FLOOR, facing: 2 }, sprite: pic('cursor', 0.2, 0.2, { noShadow: true, visible: false, sortOffset: 2 }) },
  });

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: 'The Conservatory',
    map: tileMapToRows(map),
    entities,
    regions: [{ id: 'r1', name: 'The Conservatory', x: 0, y: 0, w, h, cameraBounds: false, music: 'conservatory', darkness: 0, bossActive: false }],
    wires: [],
    variables: [],
    events: [pauseButtonRow()],
    graphs: [],
  };
}
