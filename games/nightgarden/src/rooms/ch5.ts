import type { Chapter } from '../build';

/** Chapter five: moonstones (on while lit), shadestones (on while dark), and the teal lamps and gates they are wired to. */
export const CH5: Chapter = {
  id: 'ch5',
  name: 'The Moonstone Terrace',
  line: 'Stones set in the path that feel the light. A moonstone wakes when lit, a shadestone when dark, and each is wired to something.',
  rooms: [
    {
      id: 'r501',
      name: 'Moonstone',
      hint: 'A moonstone opens its gate while it is lit.',
      rows: [
        '_  _  .l _   _   _',
        '.@ .  .  .s1 .g1 .E',
      ],
    },
    {
      id: 'r502',
      name: 'Shadestone',
      hint: 'A shadestone opens its gate while it is dark.',
      rows: [
        '_  .L .  .L  _   _',
        '.@ .  .  .S1 .g1 .E',
        '_  _  _  .*  _   _',
      ],
    },
    {
      id: 'r503',
      name: 'Passing it on',
      hint: 'A stone can light a lamp you cannot reach.',
      rows: [
        '_  .l _   w  .p1 _',
        '.@ .  .s1 ~b .   .E',
        '_  _  _   w  _   _',
      ],
    },
    {
      id: 'r504',
      name: 'Keeps its own light',
      hint: 'Once the teal lamp is lit, what lights its stone?',
      rows: [
        '.@ .z .  .   .p1 _  _',
        '_  _  .  .s1 .   .d .E',
      ],
    },
    {
      id: 'r505',
      name: 'Relay',
      hint: 'One lamp wakes a stone, which lights a lamp, which wakes a stone.',
      rows: [
        '_  .l _   .p1 _   .p2 _  _',
        '.@ .  .s1 .   .s2 .   ~b .E',
        '_  _  _   .*  _   _   ~  _',
      ],
    },
    {
      id: 'r506',
      name: 'Shadow switch',
      hint: 'A screen can give a shadestone the dark it wants.',
      rows: [
        '_  .  .  .  .   _   _  _',
        '.@ .  .  .h .   _   _  _',
        '_  .  .f .  .S1 .g1 .  .E',
        '_  _  .  .  .   .*  _  _',
      ],
    },
    {
      id: 'r507',
      name: 'Two watches',
      hint: 'A lamp can build a bridge and bar a gate at the same time.',
      rows: [
        '_  .  .  .   _   .   _   _',
        '.@ .  .l .s1 .p1 .   .S2 _',
        '_  .  .  .   w   .h  .g2 .E',
        '_  _  _  .   ~b  .   .   _',
        '_  _  _  _   ~   .*  _   _',
      ],
    },
    {
      id: 'r508',
      name: 'The night garden',
      hint: 'Every stone, every lamp and every shadow has its part.',
      rows: [
        '_  _  _  _   _   w   _   .   _   _   _',
        '.@ .z .  .   .o1 w   .p1 .   .S2 _   _',
        '_  _  _  .   .   w   .   .h  .g2 .   _',
        '_  _  _  _   .   ~b  .   .   #   .b  .l',
        '_  _  _  _   _   ~   .*  .   ^E  ^   _',
      ],
    },
  ],
};
