import type { Chapter } from '../build';

/** Chapter two: duskcaps, which rise in the dark, and the shadows risen things cast (Difficulty 20 -> 38). */
export const CH2: Chapter = {
  id: 'ch2',
  name: 'The Shade Walk',
  line: 'Under the old yews grow duskcaps. They stand tall in the dark and shrink from a lamp. Mind what stands between a lamp and a bed.',
  rooms: [
    {
      id: 'r201',
      name: 'Shy things',
      hint: 'A duskcap rises in the dark and sinks in light.',
      rows: [
        '#  #  #  #  #  #  #  #',
        '#  .  .  .l #  .  .  #',
        '#  .@ .  .  .d .  .E #',
        '#  #  .  .  #  .  #  #',
        '#  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r202',
      name: 'The yew hedge',
      hint: 'A hedge stops light as well as feet.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  .@ .  .  .l #  .  .  #',
        '#  #  #  .  .  .d .  .E #',
        '#  #  #  .  .l #  .* #  #',
        '#  #  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r203',
      name: 'Seesaw',
      hint: 'One lamp, two beds, never both the same.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  .  .  .  .l #  .  .  #',
        '#  .@ .  .b .  .d .  .E #',
        '#  #  .  .* #  .  .  #  #',
        '#  #  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r204',
      name: 'In its shadow',
      hint: 'A risen bloom keeps the light off what is behind it.',
      rows: [
        '#  #  #  #  #  #  #  #',
        '#  .@ .  .  #  ^  ^  #',
        '#  #  .l .b .d ^  ^E #',
        '#  #  .  .  .  ^  ^  #',
        '#  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r205',
      name: 'Lights out',
      hint: 'Stand on a sunken duskcap and take the light away.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  #  .L #  .L ^* ^  ^  #',
        '#  .@ .  .  .d ^  ^  ^E #',
        '#  #  .  .  .  #  #  #  #',
        '#  #  #  #  #  #  #  #  #',
      ],
    },
    {
      id: 'r206',
      name: 'Dark stair',
      hint: 'Tops are floors. Some tops need light, some need none.',
      rows: [
        '#  #  #  #  #  #  #  #',
        '#  .@ .  .  .  ^  ^E #',
        '#  #  .l .b .d .b .  #',
        '#  #  .  .  .  .  .l #',
        '#  #  #  #  #  #  #  #',
      ],
    },
  ],
};
