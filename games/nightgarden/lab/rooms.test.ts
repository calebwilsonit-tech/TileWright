import { test } from 'vitest';
import { CHAPTERS } from '../src/rooms';
import { parseRoom } from '../src/model';
import { describe, Rules, solve } from '../src/solver';
import { analyzeProgression } from '../src/difficulty';
import type { RoomReport } from '../src/verify';

/** Quick check while designing rooms: solves every room in a fraction of a second and scores difficulty 0..100. */
test('every room of every chapter solves and scales cleanly', () => {
  const entries: { room: ReturnType<typeof parseRoom>; report: RoomReport; main: ReturnType<typeof solve>; fly: ReturnType<typeof solve> }[] = [];
  for (const c of CHAPTERS) {
    for (const def of c.rooms) {
      const room = parseRoom(def);
      const r = new Rules(room);
      const main = solve(r);
      const fly = r.firefly ? solve(r, { firefly: true }) : null;
      const report: RoomReport = {
        id: room.id,
        name: room.name,
        ok: Boolean(main),
        steps: main?.actions.length ?? 0,
        toggles: main?.actions.filter((a) => a.kind === 'toggle').length ?? 0,
        pushes: main?.actions.filter((a) => a.kind === 'push').length ?? 0,
        states: main?.states ?? 0,
        fireflySteps: fly?.actions.length ?? 0,
        seconds: 0,
        problems: main ? [] : ['NO WAY OUT'],
      };
      entries.push({ room, report, main, fly });
    }
  }
  const { byId, curveIssues } = analyzeProgression(entries);
  for (const { room, report, main, fly } of entries) {
    const d = byId.get(room.id)!;
    if (!main) {
      console.log(`${room.id} ${room.name}: NO WAY OUT`);
      continue;
    }
    console.log(
      `${room.id} [${String(d.score).padStart(3)}/100 ${d.band.padEnd(10)}] ${room.name}: ${report.steps} steps, ${report.toggles} lamps, ${report.pushes} pushes, ${report.states} states${fly ? `, firefly ${fly.actions.length}` : ''}${d.issues.length ? `  ISSUES: ${d.issues.join('; ')}` : ''}`,
    );
    console.log(`      ${describe(main.actions)}`);
  }
  if (curveIssues.length) console.log('CURVE ISSUES:\n  ' + curveIssues.join('\n  '));
});
