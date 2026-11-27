import type { Chapter } from '../build';

/** Chapter one: lamps, and moonblooms as walls and as lifts (Difficulty 0 -> 18). */
export const CH1: Chapter = {
  id: 'ch1',
  name: 'The Potting Shed',
  line: 'The lamps are out and the moonblooms have gone to ground. Light makes them rise. Start with one.',
  rooms: [
    {
      id: 'r101',
      name: 'First light',
      hint: 'A moonbloom rises while its bed is lit.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .  .  .L #  #  #',
        '#  .@ .  .b .  .E #',
        '#  #  .  #  .  #  #',
        '#  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r102',
      name: 'Garden step',
      hint: 'Whoever stands on a bed rides it.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .  .  .l ^  ^  #',
        '#  .@ .  .b ^  ^E #',
        '#  .  .  .  ^  ^  #',
        '#  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r103',
      name: 'Stepping stones',
      hint: 'A lamp lights two beds every way, less the far corners.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  #  #  #  .l .  ^  ^  #',
        '#  .@ .  .b .b .b ^  ^  #',
        '#  #  #  .  .  ^* #  ^E #',
        '#  #  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r104',
      name: 'Behind you',
      hint: 'The same lamp can open one way and close another.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .@ .  .  #  #  #',
        '#  #  .L .  #  ^  #',
        '#  #  #  .b .l ^  #',
        '#  #  #  .  .b ^E #',
        '#  #  #  .* #  #  #',
        '#  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r105',
      name: 'Two beds',
      hint: 'A risen bloom is a wall from the ground and a floor from above.',
      rows: [
        '#  #  #  #  #  #  #  #',
        '#  .  .L #  .l ^  ^  #',
        '#  .@ .b .  .b ^  ^E #',
        '#  .  ^* .  .  #  #  #',
        '#  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r106',
      name: 'The long way down',
      hint: 'A drop is easy. The way back up is not.',
      rows: [
        '#  #  #  #  #  #  #  #  #  #',
        '#  #  #  .l #  #  #  #  #  #',
        '#  ^@ ^  .b ^  ^  .b ^  ^E #',
        '#  ^l ^  .  ^  ^l .  #  #  #',
        '#  #  #  .* .  .  .  #  #  #',
        '#  #  #  #  #  #  #  #  #  #',
      ],
    },
  ],
};
