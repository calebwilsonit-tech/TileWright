// The way out of a room: stepping onto it marks the room as tended, awards Par medals & fireflies, and leads on to the next one.
export default defineScript({
  name: 'Exit',
  description: 'The way out of a room. When the player steps onto it the room is marked as finished and the next scene opens.',
  settings: {
    room: { value: '', label: 'Room id (for the finished flag)' },
    next: { value: '', label: 'Scene to go to' },
  },
  update(me, game) {
    const p = game.player;
    if (!p || me.state.gone) return;
    if (Math.floor(p.x) !== Math.floor(me.x) || Math.floor(p.y) !== Math.floor(me.y) || Math.abs(p.h - me.h) > 0.5) return;
    if (Math.abs(p.x - me.x) > 0.3 || Math.abs(p.y - me.y) > 0.3) return;
    me.state.gone = true;
    const key = `done_${me.settings.room}`;
    let earned = 0;
    if (!game.vars[key]) {
      game.vars[key] = 1;
      game.vars.ng_done = Number(game.vars.ng_done ?? 0) + 1;
      earned += 1;
    }
    const par = Number(game.vars.ng_par ?? 0);
    const steps = Number(game.vars.ng_steps ?? 0);
    const parKey = `par_${me.settings.room}`;
    let gotPar = false;
    if (par > 0 && steps > 0 && steps <= par && !game.vars[parKey]) {
      game.vars[parKey] = 1;
      game.vars.ng_pars = Number(game.vars.ng_pars ?? 0) + 1;
      earned += 2;
      gotPar = true;
    }
    const name = String(game.vars.ng_room_name ?? 'Room');
    const bonus = earned > 0 ? ` · +${earned} ✦` : '';
    game.vars.ng_toast = gotPar
      ? `${name} tended · ★ Par (${steps}/${par})${bonus}`
      : par > 0
        ? `${name} tended · ${steps} steps (Par ${par})${bonus}`
        : `${name} tended${bonus}`;
    game.vars.ng_toast_t = 4.2;
    game.emit('room-done', { room: String(me.settings.room) });
    game.do('sound', { name: gotPar ? 'par' : 'room_done', volume: 0.8 });
    game.vars.ng_reach = Math.max(Number(game.vars.ng_reach ?? 1), Number(game.vars.ng_room_no ?? 1) + 1);
    if (me.settings.next) game.travel(String(me.settings.next));
    else game.do('uiScreen', { op: 'open', screen: 'The end' });
  },
});
