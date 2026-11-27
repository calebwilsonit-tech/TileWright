// A customizable planter in the Conservatory hub. Stand beside it and press Interact (E) to cycle through
// unlocked nocturnal flora and garden decor. Choices persist in game variables (hub_plot_1 .. hub_plot_6).
const CATALOG: { id: string; label: string; sprite: string; unlock: string; need: number }[] = [
  { id: 'empty', label: 'Empty bed', sprite: 'moonbloom_0', unlock: 'always', need: 0 },
  { id: 'moonbloom', label: 'Moonbloom (Lunaria alba)', sprite: 'moonbloom_3', unlock: 'always', need: 0 },
  { id: 'duskcap', label: 'Duskcap (Umbracapa violacea)', sprite: 'duskcap_3', unlock: 'done', need: 6 },
  { id: 'lantern', label: 'Amber lantern', sprite: 'lamp_on', unlock: 'done', need: 12 },
  { id: 'brazier', label: 'Warm brazier', sprite: 'brazier', unlock: 'done', need: 18 },
  { id: 'teallamp', label: 'Teal conservatory lamp', sprite: 'wirelamp_on', unlock: 'flies', need: 5 },
  { id: 'moonstone', label: 'Luminous moonstone', sprite: 'moonstone_on', unlock: 'flies', need: 10 },
  { id: 'gracelily', label: "Grace's Moon-Lily (Lilium gratiae)", sprite: 'glowlamp', unlock: 'pars', need: 10 },
  { id: 'traversrose', label: 'Travers Night-Rose (Rosa traversii)', sprite: 'shadestone_on', unlock: 'done', need: 30 },
];

export default defineScript({
  name: 'Planter',
  description: 'A customizable conservatory planter. Press Interact beside it to plant or swap unlocked nocturnal specimens.',
  settings: {
    slot: { value: 1, label: 'Planter slot number', min: 1, max: 12, step: 1 },
    initial: { value: 'moonbloom', label: 'Starting specimen' },
  },
  phase: 'actuator',
  update(me, game) {
    const key = `hub_plot_${me.settings.slot}`;
    if (!game.vars[key]) game.vars[key] = String(me.settings.initial || 'moonbloom');
    const unlocked = CATALOG.filter((c) => {
      if (c.unlock === 'always') return true;
      if (c.unlock === 'done') return Number(game.vars.ng_done ?? 0) >= c.need;
      if (c.unlock === 'flies') return Number(game.vars.ng_flies ?? 0) >= c.need;
      if (c.unlock === 'pars') return Number(game.vars.ng_pars ?? 0) >= c.need;
      return false;
    });
    const p = game.player;
    if (p && !game.vars.ng_moving && game.input.pressed('interact')) {
      const dx = Math.abs(Math.floor(p.x) - Math.floor(me.x));
      const dy = Math.abs(Math.floor(p.y) - Math.floor(me.y));
      if (dx + dy === 1 && Math.abs(p.h - me.h) <= 1.3) {
        const curId = String(game.vars[key]);
        const idx = unlocked.findIndex((c) => c.id === curId);
        const next = unlocked[(idx + 1) % unlocked.length]!;
        game.vars[key] = next.id;
        game.vars.ng_hint = `Planted: ${next.label} (${unlocked.length} of ${CATALOG.length} specimens unlocked).`;
        game.do('sound', { name: 'bloom_up', volume: 0.6 });
      }
    }
    const chosen = CATALOG.find((c) => c.id === String(game.vars[key])) ?? CATALOG[0]!;
    const sp = me.get<{ asset?: string }>('sprite');
    if (sp && sp.asset !== chosen.sprite) sp.asset = chosen.sprite;
  },
});
