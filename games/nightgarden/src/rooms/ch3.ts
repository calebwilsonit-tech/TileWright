import type { Chapter } from '../build';

/** Chapter three: crates, plates and gates, and screens that cast a shadow where you push them (Difficulty 40 -> 58). */
export const CH3: Chapter = {
  id: 'ch3',
  name: 'The Tool Yard',
  line: 'Crates, trellis screens, iron gates on stone plates. Everything here can be leaned on, and some of it throws a useful shadow.',
  rooms: [
    {
      id: 'r301',
      name: 'Trellis',
      hint: 'A screen is tall enough to throw a shadow.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  #  #  .  .  #  #',
        '#  .@ .  .  .h .  #',
        '#  #  .  .f .  .b .E',
        '#  #  #  #  .  #  #',
      ],
    },
    {
      id: 'r302',
      name: 'Weight',
      hint: 'A gate stays open while something rests on its plate.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .@ .c .  .o1 #  #',
        '#  .  .  .  .  .g1 .E',
        '#  #  .  .  #  #  #',
      ],
    },
    {
      id: 'r303',
      name: 'Doorstop',
      hint: 'A gate never shuts on what stands in its doorway.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  #  #  #  #  .* #',
        '#  .@ .o1 .c .g1 .  .',
        '#  #  .  .  #  .  .E',
      ],
    },
    {
      id: 'r304',
      name: 'Wired',
      hint: 'A teal lamp is lit by its plate, not by hand.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .@ .c .  .o1 #  #',
        '#  .  .  .  .  .p1 #',
        '#  #  #  .  .d .  .E',
      ],
    },
    {
      id: 'r305',
      name: 'Shade for the shy',
      hint: 'A duskcap in a shadow thinks it is night.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  #  #  #  .  .  #  #  #',
        '#  .@ .  .  .  .h .  #  #',
        '#  .l .b #  .f .  .d ^  ^E',
        '#  #  ^  ^  ^  ^  ^  #  #',
      ],
    },
    {
      id: 'r306',
      name: 'Yard work',
      hint: 'A crate is a weight, a doorstop and a step.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  .  .  .  #  .  .E',
        '#  .  .c .  #  .  #',
        '#  .  #  .  .  .L .d',
        '#  .@ #  .  .b .  .',
      ],
    },
  ],
};
