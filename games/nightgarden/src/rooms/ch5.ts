import type { Chapter } from '../build';

/** Chapter five: moonstones, shadestones, relays, and the finale (Difficulty 80 -> 100). */
export const CH5: Chapter = {
  id: 'ch5',
  name: 'The Travers Conservatory',
  line: 'Stones set in the path that feel the light. A moonstone wakes when lit, a shadestone when dark, and each is wired to the conservatory.',
  rooms: [
    {
      id: 'r501',
      name: 'Shadestone',
      hint: 'A shadestone opens its gate while it is dark.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  #  .L .  .L #  #',
        '#  .@ .  .  .S1 .g1 .E',
        '#  #  #  #  .* #  #',
      ],
    },
    {
      id: 'r502',
      name: 'Passing it on',
      hint: 'A stone can light a lamp you cannot reach.',
      rows: [
        '#  #  #  #  #  #  #',
        '#  #  .l #  w  .p1 #',
        '#  .@ .  .s1 ~b .  .E',
        '#  #  #  #  w  #  #',
      ],
    },
    {
      id: 'r503',
      name: 'Relay',
      hint: 'One lamp wakes a stone, which lights a lamp, which wakes a stone.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  #  .l #  .p1 #  .p2 #  #',
        '#  .@ .  .s1 .  .s2 .  ~b .E',
        '#  #  #  #  .* #  #  ~  #',
      ],
    },
    {
      id: 'r504',
      name: 'Shadow switch',
      hint: 'A screen can give a shadestone the dark it wants.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  #  .  .  .  .  #  #  #',
        '#  .@ .  .  .h .  #  #  #',
        '#  #  #  .f .  .S1 .g1 .  .E',
        '#  #  #  .  .  .  .* #  #',
      ],
    },
    {
      id: 'r505',
      name: 'Two watches',
      hint: 'A lamp can build a bridge and bar a gate at the same time.',
      rows: [
        '#  #  #  #  #  #  #  #  #',
        '#  #  .  .  .  #  .  #  #',
        '#  .@ .  .l .s1 .p1 .  .S2 #',
        '#  #  .  .  .  w  .h .g2 .E',
        '#  #  #  #  .  ~b .  .  #',
        '#  #  #  #  #  ~  .* #  #',
      ],
    },
    {
      id: 'r506',
      name: "Elizabeth's garden",
      hint: 'Every stone, every lamp and every shadow has its part.',
      rows: [
        '#  #  #  #  #  #  #  #  #  #  #  #',
        '#  #  #  #  #  #  w  #  .  #  #  #',
        '#  .@ .z .  .  .o1 w  .p1 .  .S2 #  #',
        '#  #  #  #  .  .  w  .  .h .g2 .  #',
        '#  #  #  #  #  .  ~b .  .  #  .b .l',
        '#  #  #  #  #  #  ~  .* .  ^E ^  #',
      ],
    },
  ],
};
