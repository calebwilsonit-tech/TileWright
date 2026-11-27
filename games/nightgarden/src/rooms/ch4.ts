import type { Chapter } from '../build';

/** Chapter four: braziers (a light you push), sunken beds and lily ponds (Difficulty 60 -> 78). */
export const CH4: Chapter = {
  id: 'ch4',
  name: 'The Brazier Court',
  line: 'Here the light has wheels. A brazier warms the eight beds round it, wherever you leave it. Mind the sunken beds and the pond.',
  rooms: [
    {
      id: 'r401',
      name: 'Cellar lamp',
      hint: 'Down in a sunken bed you can only reach what is down there with you.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .@ .  ~  ~l #  #',
        '#  #  #  ~  ~b .  .E',
        '#  #  #  ~* ~  #  #',
      ],
    },
    {
      id: 'r402',
      name: 'Warm hands',
      hint: 'A brazier lights the eight beds round it.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .@ .z .  .  #  #',
        '#  #  #  .  .d .  .E',
        '#  #  #  .  .  #  #',
      ],
    },
    {
      id: 'r403',
      name: 'Lily pond',
      hint: 'Light crosses water. Feet do not.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .@ .z .  w  .  #',
        '#  #  .  .  ~b .  .E',
        '#  #  #  .  w  .* #',
      ],
    },
    {
      id: 'r404',
      name: 'Fire walk',
      hint: 'Push the light to where it is wanted.',
      rows: [
        '#  #  #  #  #  #  #  #',
        '#  #  .  .  .  .  #  #',
        '#  .@ .z .  .  .  .  #',
        '#  #  #  ~b w  ~b .  .E',
        '#  #  #  .  .* .  #  #',
      ],
    },
    {
      id: 'r405',
      name: 'Warm bridge',
      hint: 'A brazier beside the water can wake a sunken bed.',
      rows: [
        '#  #  #  #  #  #  #  #  #  #',
        '#  #  .  .  .  .  w  #  #  #',
        '#  .@ .z .  .  .  w  .  .l #',
        '#  #  .  .  .d .  ~b .  .b ^E',
        '#  #  #  #  .  #  ~  #  #  #',
        '#  #  #  #  .* #  #  #  #  #',
      ],
    },
    {
      id: 'r406',
      name: 'Hearth and gate',
      hint: 'A brazier has weight as well as light.',
      rows: [
        '#  #  #  #  #  #  #  #  #  #',
        '#  #  .  .  .  .  w  #  #  #',
        '#  .@ .z .  .  .o1 w  .  .l #',
        '#  #  .  .  .  .  ~b .g1 .d .E',
        '#  #  #  #  #  #  ~  #  .* #',
      ],
    },
  ],
};
