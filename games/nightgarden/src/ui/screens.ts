import { CURRENT_SCHEMA_VERSION, type TableData, type UiDoc, type UiLayout, type UiNode, type UiScreen } from '@tilewright/runtime';
import { COLOR, MENU_WIDTH, RADIUS, SPACE, THEME, TYPE, act, back, box, chip, close, heading, hint, menu, open, row, setting, slider, space, sub, tick, widget, words } from './kit';

/** Every screen of Nightgarden, as the plain data the UI designer saves (assets/screens.json). The look comes from kit.ts and DESIGN.md. */

export interface RoomRow {
  id: string;
  no: number;
  name: string;
  chapter: string;
  scene: string;
  par: number;
  difficulty: number;
}

const KEYS = 'W / S choose · E select · Esc back';
const leaveMenus = [close('Rooms'), close('Herbarium'), close('Chapter'), close('The end'), close('role:pause'), close('role:title')];
const goHub = [act('setVariable', { name: 'ng_goto', op: 'set', value: 'scenes/hub.scene.json' }), ...leaveMenus];

function title(): UiScreen {
  const mark = widget('panel', 'title.mark', {
    name: 'Title mark',
    layout: 'column',
    wMode: 'fill',
    hMode: 'auto',
    align: 'center',
    padding: 0,
    gap: SPACE.rowGap,
    style: {},
    children: [
      widget('image', 'title.picture', { name: 'Title picture', sprite: 'title_mark', w: 320, h: 128, wMode: 'fixed', hMode: 'fixed', style: {} }),
      words('title.name', '{game.title}', TYPE.title, { name: 'Game title', style: { color: COLOR.accent, align: 'center' }, wMode: 'fill' }),
      sub('title.subtitle', '{game.subtitle}', { wMode: 'fill', style: { align: 'center' } }),
    ],
  });
  return menu({
    id: 'ng-title',
    name: 'Title',
    role: 'title',
    back: 'nothing',
    dim: 0.86,
    box: box('title', 'Nightgarden', [
      row('title.continue', 'Continue', [act('loadGame', { slot: 'latest' }), close('role:title')], { detail: '{host.latestSave}', visible: '{host.hasSave}', primary: true }),
      row('title.new', 'New game', [close('role:title')], { primary: true }),
      row('title.hub', 'The Conservatory', goHub, { detail: 'Garden hub' }),
      row('title.rooms', 'Rooms', [open('Rooms')]),
      row('title.herbarium', 'Herbarium', [open('Herbarium')]),
      row('title.how', 'How to play', [open('How to play')]),
      row('title.settings', 'Settings', [open('role:settings')]),
      row('title.quit', 'Quit', [act('quitGame')], { visible: '{host.quit}' }),
    ], { hint: 'W / S choose · E select', titleNode: mark }),
  });
}

function pause(): UiScreen {
  return menu({
    id: 'ng-pause',
    name: 'Pause',
    role: 'pause',
    box: box('pause', 'Paused', [
      row('pause.resume', 'Resume', [close('role:pause')], { primary: true }),
      row('pause.restart', 'Restart room', [close('role:pause'), act('restartArea')], { detail: 'R' }),
      row('pause.rooms', 'Rooms', [open('Rooms')], { detail: '{ng_done} of {ng_total} tended' }),
      row('pause.hub', 'The Conservatory', goHub, { detail: 'Garden hub' }),
      row('pause.herbarium', 'Herbarium', [open('Herbarium')], { detail: '{ng_pars} par medals' }),
      row('pause.how', 'How to play', [open('How to play')]),
      row('pause.settings', 'Settings', [open('role:settings')]),
      row('pause.mainmenu', 'Main menu', [close('role:pause'), open('role:title')]),
      row('pause.quit', 'Quit', [act('quitGame')], { visible: '{host.quit}' }),
    ], { subtitle: '{ng_chapter} · {ng_room_no} {ng_room_name}', hint: KEYS }),
  });
}

function settings(): UiScreen {
  const volume = (id: string, label: string, key: string): UiNode => setting(`settings.${id}`, label, slider(`settings.${id}.slider`, `${label} slider`, `settings.${key}`, 0, 1, 0.1));
  return menu({
    id: 'ng-settings',
    name: 'Settings',
    role: 'settings',
    box: box('settings', 'Settings', [
      volume('master', 'Volume', 'master'),
      volume('music', 'Music', 'music'),
      volume('sfx', 'Sounds', 'sfx'),
      setting('settings.zoom', 'Zoom', slider('settings.zoom.slider', 'Zoom slider', 'settings.cameraZoom', 0.75, 1.5, 0.25)),
      setting('settings.full', 'Full screen', tick('settings.full.box', 'Full screen tick box', 'settings.fullscreen'), '{host.fullscreen}'),
      row('settings.controls', 'Controls', [open('role:controls')]),
    ], { hint: 'W / S choose · A / D change · Esc back' }),
  });
}

function controls(): UiScreen {
  const bind = widget('keybind', 'controls.bind', {
    name: 'Control',
    text: '{control.action}',
    label: '{control.label}',
    wMode: 'fill',
    hMode: 'auto',
    h: 36,
    padding: SPACE.rowPad,
    style: { radius: RADIUS.row, fontSize: TYPE.row },
    states: { hover: { fill: 'color-mix(in srgb, var(--tw-highlight) 22%, var(--tw-panel))' }, focus: { border: COLOR.highlight, borderWidth: 1 } },
  });
  const list = widget('list', 'controls.list', { name: 'Controls', source: 'controls', layout: 'column', wMode: 'fill', hMode: 'auto', gap: SPACE.rowGap, padding: 0, style: {}, children: [bind] });
  return menu({ id: 'ng-controls', name: 'Controls', role: 'controls', box: box('controls', 'Controls', [list, row('controls.reset', 'Put all controls back', [act('resetControls')])], { hint: 'E change the chosen control, then press the new key · Esc back' }) });
}

/** One page of plain words and pictures: what the things in the garden do. */
function howToPlay(): UiScreen {
  const line = (id: string, sprite: string, w: number, h: number, text: string): UiNode =>
    widget('panel', `how.${id}`, {
      name: id,
      layout: 'row',
      wMode: 'fill',
      hMode: 'auto',
      align: 'center',
      gap: SPACE.group,
      padding: SPACE.rowPad,
      style: { fill: 'color-mix(in srgb, var(--tw-border) 16%, var(--tw-panel))', border: 'color-mix(in srgb, var(--tw-border) 48%, var(--tw-panel))', borderWidth: 1, radius: RADIUS.row },
      children: [
        widget('panel', `how.${id}.frame`, { name: 'Picture frame', w: 56, h: 48, wMode: 'fixed', hMode: 'fixed', layout: 'free', padding: 0, style: {}, children: [widget('image', `how.${id}.picture`, { name: 'Picture', sprite, anchor: 'c', w, h, wMode: 'fixed', hMode: 'fixed', style: {} })] }),
        words(`how.${id}.words`, text, TYPE.body, { wMode: 'fill' }),
      ],
    });
  return menu({
    id: 'ng-how',
    name: 'How to play',
    box: box('how', 'How to play', [
      line('walk', 'gardener', 26, 36, 'The arrow keys or W A S D walk one bed at a time, along the paths. Hold Shift to turn on the spot.'),
      line('lamp', 'lamp_on', 24, 48, 'E lights or douses the lamp beside you. A gold mark shows which one.'),
      line('moonbloom', 'moonbloom_3', 48, 48, 'A moonbloom rises while its bed is lit and sinks in the dark. Stand on one to ride it.'),
      line('duskcap', 'duskcap_3', 48, 48, 'A duskcap rises in the dark and sinks in light.'),
      line('crate', 'crate', 48, 42, 'Walk into a crate to push it. A risen bloom or a tall screen casts a shadow.'),
      line('exit', 'exit', 56, 28, 'The green ring is the way out. R starts the room again. Fireflies are for the curious.'),
      row('how.back', 'Back', [back()]),
    ], { hint: 'Esc back', wide: true }),
  });
}

/** Botanical journal & collection progress: nocturnal flora unlocked for the Conservatory hub. */
function herbarium(): UiScreen {
  const entry = (id: string, sprite: string, w: number, h: number, title: string, desc: string): UiNode =>
    widget('panel', `herb.${id}`, {
      name: title,
      layout: 'row',
      wMode: 'fill',
      hMode: 'auto',
      align: 'center',
      gap: SPACE.group,
      padding: SPACE.rowPad,
      style: { fill: 'color-mix(in srgb, var(--tw-border) 16%, var(--tw-panel))', radius: RADIUS.row },
      children: [
        widget('panel', `herb.${id}.frame`, { name: 'Picture frame', w: 56, h: 48, wMode: 'fixed', hMode: 'fixed', layout: 'free', padding: 0, style: {}, children: [widget('image', `herb.${id}.picture`, { name: 'Picture', sprite, anchor: 'c', w, h, wMode: 'fixed', hMode: 'fixed', style: {} })] }),
        widget('panel', `herb.${id}.copy`, {
          name: 'Copy',
          layout: 'column',
          wMode: 'fill',
          hMode: 'auto',
          gap: SPACE.rowGap,
          padding: 0,
          style: {},
          children: [
            words(`herb.${id}.title`, title, TYPE.body, { style: { color: COLOR.accent, bold: true } }),
            words(`herb.${id}.desc`, desc, TYPE.hint, { wMode: 'fill', style: { color: COLOR.dim } }),
          ],
        }),
      ],
    });
  return menu({
    id: 'ng-herbarium',
    name: 'Herbarium',
    box: box(
      'herb',
      'The Travers Herbarium',
      [
        entry('moonbloom', 'moonbloom_3', 48, 48, 'Moonbloom — Lunaria alba', 'Opens under warm lamplight and lifts whoever stands on its bed. Always available in the Conservatory.'),
        entry('duskcap', 'duskcap_3', 48, 48, 'Duskcap — Umbracapa violacea', 'Rises tall in shadow and shrinks from fire. Unlocks for the Conservatory at 6 rooms tended.'),
        entry('firefly', 'firefly', 24, 24, 'Conservatory Firefly — Ignis horti', 'Drawn to quiet side paths. Unlocks teal lamps at 5 fireflies and moonstones at 10.'),
        entry('gracelily', 'glowlamp', 24, 48, "Grace's Moon-Lily — Lilium gratiae", 'A rare pale bloom named for Elizabeth Grace. Unlocks at 10 Master Gardener Par medals.'),
        entry('traversrose', 'shadestone_on', 48, 24, 'Travers Night-Rose — Rosa traversii', 'An heirloom specimen of the Travers Conservatory. Unlocks when every room is tended.'),
        row('herb.hub', 'Visit the Conservatory', goHub, { primary: true }),
        row('herb.back', 'Back', [back()]),
      ],
      { subtitle: '{ng_done} of {ng_total} tended · {ng_flies} fireflies · {ng_pars} par medals', hint: 'Esc back', wide: true },
    ),
  });
}

/** The rooms of the game as cards: tended ones ticked, the firefly shown when caught, later ones shut until reached. */
function rooms(): UiScreen {
  const card = widget('panel', 'rooms.card', {
    name: 'Room card',
    w: 176,
    h: 68,
    wMode: 'fill',
    hMode: 'fixed',
    layout: 'column',
    align: 'start',
    gap: SPACE.rowGap,
    padding: SPACE.rowPad,
    style: { fill: 'color-mix(in srgb, var(--tw-border) 32%, var(--tw-panel))', border: COLOR.border, borderWidth: 1, radius: RADIUS.row, shadow: true },
    states: {
      hover: { fill: 'color-mix(in srgb, var(--tw-highlight) 20%, var(--tw-panel))', border: COLOR.highlight, borderWidth: 2 },
      focus: { fill: 'color-mix(in srgb, var(--tw-highlight) 20%, var(--tw-panel))', border: COLOR.highlight, borderWidth: 2 },
      pressed: { fill: 'color-mix(in srgb, var(--tw-highlight) 32%, var(--tw-panel))', border: COLOR.highlight, borderWidth: 2 },
      disabled: { opacity: 0.4 },
    },
    enabled: '{row.no} = 1 || {row.no} <= {ng_reach}',
    // the Room script of the room being played sees ng_goto and goes there (the row's scene is only known here, on the card)
    on: { click: [act('setVariable', { name: 'ng_goto', op: 'set', value: '{row.scene}' }), ...leaveMenus], hover: [], change: [] },
    tooltip: '{row.chapter} · {row.name}',
    children: [
      widget('panel', 'rooms.card.top', {
        name: 'Number and marks',
        layout: 'row',
        wMode: 'fill',
        hMode: 'auto',
        align: 'center',
        gap: SPACE.rowGap,
        padding: 0,
        style: {},
        children: [
          words('rooms.card.no', '{row.no}', TYPE.row, { name: 'Number', style: { color: COLOR.accent, bold: true } }),
          widget('spacer', 'rooms.card.gap', { name: 'Space', wMode: 'fill', hMode: 'auto', w: 4, h: 4 }),
          words('rooms.card.par', '★', TYPE.body, { name: 'Par medal', style: { color: COLOR.accent }, visible: '{par_{row.id}} = 1' }),
          words('rooms.card.fly', '✦', TYPE.body, { name: 'Firefly caught', style: { color: COLOR.firefly }, visible: '{fly_{row.id}} = 1' }),
          words('rooms.card.done', '✓', TYPE.body, { name: 'Tended', style: { color: COLOR.done }, visible: '{done_{row.id}} = 1' }),
        ],
      }),
      words('rooms.card.name', '{row.name}', TYPE.body, { name: 'Room name', wMode: 'fill', style: { color: COLOR.text } }),
      words('rooms.card.diff', 'Diff {row.difficulty} · Par {row.par}', TYPE.hint, { name: 'Difficulty', wMode: 'fill', style: { color: COLOR.dim } }),
    ],
  });
  const grid = widget('grid', 'rooms.grid', { name: 'Rooms', source: 'table:Rooms', columns: 6, wMode: 'fill', hMode: 'auto', gap: SPACE.rowPad, padding: 0, style: {}, children: [card] });
  return menu({ id: 'ng-rooms', name: 'Rooms', box: box('rooms', 'Rooms', [grid, row('rooms.back', 'Back', [back()])], { subtitle: '{ng_done} of {ng_total} tended · {ng_flies} fireflies · {ng_pars} par medals', hint: 'Arrows choose · E go to the room · Esc back', wide: true }) });
}

/** Shown when a chapter is entered for the first time. */
function chapterCard(): UiScreen {
  const header = widget('panel', 'chapter.header', {
    name: 'Chapter header',
    layout: 'row',
    wMode: 'fill',
    hMode: 'auto',
    align: 'center',
    gap: SPACE.group,
    padding: 0,
    style: {},
    children: [
      widget('image', 'chapter.emblem', { name: 'Emblem', sprite: 'moonbloom_3', w: 48, h: 48, wMode: 'fixed', hMode: 'fixed', style: {} }),
      widget('panel', 'chapter.titles', {
        name: 'Titles',
        layout: 'column',
        wMode: 'fill',
        hMode: 'auto',
        gap: SPACE.rowGap,
        padding: 0,
        style: {},
        children: [heading('chapter.title', '{ng_chapter}'), sub('chapter.sub', 'Part {ng_chapter_no} of {ng_chapters}')],
      }),
    ],
  });
  return menu({
    id: 'ng-chapter',
    name: 'Chapter',
    dim: 0.86,
    box: box('chapter', '{ng_chapter}', [words('chapter.line', '{ng_chapter_line}', TYPE.body, { wMode: 'fill' }), space('chapter.space'), row('chapter.go', 'Go on', [close('Chapter')], { primary: true })], { hint: 'E go on', titleNode: header }),
  });
}

function theEnd(): UiScreen {
  const header = widget('panel', 'end.header', {
    name: 'End header',
    layout: 'row',
    wMode: 'fill',
    hMode: 'auto',
    align: 'center',
    gap: SPACE.group,
    padding: 0,
    style: {},
    children: [
      widget('image', 'end.emblem', { name: 'Emblem', sprite: 'moonbloom_3', w: 48, h: 48, wMode: 'fixed', hMode: 'fixed', style: {} }),
      widget('panel', 'end.titles', {
        name: 'Titles',
        layout: 'column',
        wMode: 'fill',
        hMode: 'auto',
        gap: SPACE.rowGap,
        padding: 0,
        style: {},
        children: [heading('end.title', 'The garden is awake'), sub('end.sub', 'Nightgarden')],
      }),
    ],
  });
  return menu({
    id: 'ng-end',
    name: 'The end',
    dim: 0.9,
    box: box('end', 'The garden is awake', [
      words('end.line', 'Every bed is tended and every lamp has had its turn. Thank you for walking the garden.', TYPE.body, { wMode: 'fill' }),
      words('end.dedication', 'For Elizabeth Grace — who brings every garden to life.', TYPE.hint, { wMode: 'fill', style: { color: COLOR.accent } }),
      space('end.space'),
      setting('end.rooms', 'Rooms tended', words('end.rooms.n', '{ng_done} of {ng_total}', TYPE.row, { style: { color: COLOR.accent, bold: true } })),
      setting('end.flies', 'Fireflies caught', words('end.flies.n', '{ng_flies} of {ng_fly_total}', TYPE.row, { style: { color: COLOR.accent, bold: true } })),
      setting('end.pars', 'Master Gardener Par medals', words('end.pars.n', '{ng_pars} of {ng_total}', TYPE.row, { style: { color: COLOR.accent, bold: true } })),
      space('end.space2'),
      row('end.hub', 'Visit the Conservatory', goHub, { primary: true }),
      row('end.rooms.go', 'Rooms', [open('Rooms')]),
      row('end.title.go', 'Main menu', [close('The end'), open('role:title')]),
      row('end.stay', 'Stay in the garden', [close('The end')]),
    ], { hint: KEYS, titleNode: header }),
  });
}

/** Always up while a room is played: where you are, what you have done, and the keys. */
function hud(): UiScreen {
  const where = chip(
    'hud.where',
    [
      widget('image', 'hud.lamp.icon', { name: 'Lamp', sprite: 'lamp_on', w: 12, h: 24, wMode: 'fixed', hMode: 'fixed', style: {} }),
      words('hud.chapter', '{ng_chapter}', TYPE.body, { style: { color: COLOR.dim } }),
      words('hud.sep0', '·', TYPE.body, { style: { color: COLOR.dim } }),
      words('hud.room', '{ng_room_no}', TYPE.body, { style: { color: COLOR.accent, bold: true }, visible: '{ng_room_no}' }),
      words('hud.name', '{ng_room_name}', TYPE.body),
    ],
    { anchor: 'tl', x: SPACE.edge, y: SPACE.edge, visible: '{ng_room_name}' },
  );
  const tally = chip(
    'hud.tally',
    [
      widget('image', 'hud.fly.icon', { name: 'Firefly', sprite: 'firefly', w: 16, h: 16, wMode: 'fixed', hMode: 'fixed', style: {} }),
      words('hud.flies', '{ng_flies}', TYPE.body, { style: { color: COLOR.firefly, bold: true } }),
      words('hud.sep', '·', TYPE.body, { style: { color: COLOR.dim } }),
      words('hud.done', '{ng_done} / {ng_total}', TYPE.body, { style: { bold: true } }),
      words('hud.done.label', 'tended', TYPE.body, { style: { color: COLOR.dim } }),
      words('hud.sep2', '·', TYPE.body, { style: { color: COLOR.dim }, visible: '{ng_par} > 0' }),
      words('hud.steps', 'Steps {ng_steps}/{ng_par}', TYPE.body, { style: { color: COLOR.dim }, visible: '{ng_par} > 0' }),
    ],
    { anchor: 'tr', x: -SPACE.edge, y: SPACE.edge, visible: '{ng_room_name}' },
  );
  const foot = widget('panel', 'hud.foot', {
    name: 'Hint and keys',
    visible: '{ng_room_name}',
    anchor: 'b',
    x: 0,
    y: -SPACE.edge,
    layout: 'column',
    align: 'center',
    gap: SPACE.rowGap,
    padding: 0,
    wMode: 'auto',
    hMode: 'auto',
    style: {},
    children: [
      chip('hud.hint', [words('hud.hint.words', '{ng_hint}', TYPE.body)], { visible: '{ng_hint}' }),
      widget('plugin', 'hud.keys', { name: 'Keys', source: 'botanical-keys', text: 'Arrows:walk|E:lamp|Shift:turn|R:restart|H:hub|Esc:pause', wMode: 'auto', hMode: 'auto', padding: 0, style: {} }),
    ],
  });
  const root = widget('panel', 'hud.root', { name: 'HUD root', anchor: 'fill', layout: 'free', padding: 0, style: {}, children: [where, tally, foot] });
  return { id: 'ng-hud', name: 'HUD', root, modal: false, back: 'auto', backTo: '', priority: 0, dim: 0, transition: 'none', mapX: 0, mapY: 0, opensOnStart: true, role: 'hud' };
}

export function screensDoc(): UiDoc {
  const list = [title(), hud(), pause(), rooms(), herbarium(), howToPlay(), settings(), controls(), chapterCard(), theEnd()];
  // where each box sits on the designer's screen-flow map
  list.forEach((s, i) => {
    s.mapX = 40 + (i % 4) * 220;
    s.mapY = 40 + Math.floor(i / 4) * 130;
  });
  return { schemaVersion: CURRENT_SCHEMA_VERSION, screens: list, prefabs: [], safeArea: 0 };
}

/** The theme, and the engine's own heads-up pieces switched off (the game has its own display). */
export function uiLayout(): UiLayout {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, theme: { ...THEME }, widgets: [] };
}

export function roomsTable(rows: RoomRow[]): TableData {
  const col = (id: string, type: 'text' | 'number'): TableData['columns'][number] => ({ id, label: id, type, options: [], table: '' });
  return {
    schemaVersion: 1,
    name: 'Rooms',
    description: 'Every room of the game in play order (written by the build; the Rooms screen shows it).',
    columns: [col('no', 'number'), col('name', 'text'), col('chapter', 'text'), col('scene', 'text'), col('par', 'number'), col('difficulty', 'number')],
    rows: rows.map((r) => ({ id: r.id, no: r.no, name: r.name, chapter: r.chapter, scene: r.scene, par: r.par, difficulty: r.difficulty })),
  } as TableData;
}

export const MENU = MENU_WIDTH;
export { heading, hint };
