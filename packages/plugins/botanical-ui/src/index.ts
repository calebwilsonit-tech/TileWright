import { definePlugin, type PluginDefinition, type WidgetDef } from '@tilewright/plugin-sdk';
import manifest from '../plugin.json' with { type: 'json' };

/**
 * Botanical UI: a bespoke moonlit-conservatory game UI kit.
 * Replaces plain rounded boxes with layered wrought-iron & brass plaques, serif illuminated headings,
 * SVG botanical filigree corners & vine dividers, drifting golden firefly atmosphere, and embossed keycap badges.
 * All CSS is scoped to `.tw-screens:has(.tw-botanical-scope)` so it only styles games that use these widgets.
 */

const BOTANICAL_CSS = `
/* ---------- atmospheric moonlit backdrop & drifting fireflies ---------- */
.tw-botanical-backdrop {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse 68% 58% at 50% 44%, rgba(242, 169, 59, 0.11) 0%, rgba(28, 36, 68, 0.22) 48%, rgba(7, 10, 20, 0.72) 100%);
}
.tw-botanical-backdrop .tw-bfly {
  position: absolute;
  width: var(--sz, 5px);
  height: var(--sz, 5px);
  border-radius: 50%;
  background: radial-gradient(circle, #fff6cf 0%, #ffd76a 45%, rgba(242, 169, 59, 0) 75%);
  box-shadow: 0 0 10px 2px rgba(255, 215, 106, 0.55);
  left: var(--x, 50%);
  top: var(--y, 50%);
  opacity: 0;
  animation: tw-bfly-drift var(--dur, 9s) ease-in-out var(--delay, 0s) infinite;
}
.tw-botanical-backdrop .tw-bstar {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #d8e4ff;
  left: var(--x, 20%);
  top: var(--y, 20%);
  opacity: 0.25;
  animation: tw-bstar-twinkle var(--dur, 5s) ease-in-out var(--delay, 0s) infinite;
}
@keyframes tw-bfly-drift {
  0%   { opacity: 0; transform: translate(0, 12px) scale(0.7); }
  20%  { opacity: 0.9; }
  50%  { opacity: 0.65; transform: translate(var(--dx, 18px), -18px) scale(1.15); }
  80%  { opacity: 0.95; }
  100% { opacity: 0; transform: translate(var(--dx2, -10px), -42px) scale(0.75); }
}
@keyframes tw-bstar-twinkle {
  0%, 100% { opacity: 0.18; transform: scale(0.9); }
  50% { opacity: 0.75; transform: scale(1.3); }
}

/* ---------- ornate SVG vine & star divider ---------- */
.tw-botanical-flourish {
  width: 100%;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  margin: 2px 0;
}
.tw-botanical-flourish svg {
  width: 100%;
  max-width: 420px;
  height: 22px;
  display: block;
}

/* ---------- wrought-iron & gold-leaf corner filigree overlay ---------- */
.tw-botanical-corners {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.tw-botanical-corners svg {
  position: absolute;
  width: 34px;
  height: 34px;
  pointer-events: none;
  opacity: 0.92;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.75));
}
.tw-botanical-corners .c-tl { top: 5px; left: 5px; }
.tw-botanical-corners .c-tr { top: 5px; right: 5px; transform: scaleX(-1); }
.tw-botanical-corners .c-bl { bottom: 5px; left: 5px; transform: scaleY(-1); }
.tw-botanical-corners .c-br { bottom: 5px; right: 5px; transform: scale(-1, -1); }

/* ---------- embossed keycap footer ---------- */
.tw-botanical-keys {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(12, 16, 28, 0.74);
  border: 1px solid rgba(140, 112, 64, 0.38);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 232, 175, 0.1);
  font-family: Georgia, 'Palatino Linotype', serif;
  font-size: 12px;
  color: #b7c0da;
  pointer-events: none;
}
.tw-botanical-keys .kpair {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.tw-botanical-keys kbd {
  display: inline-block;
  min-width: 18px;
  text-align: center;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #ffe294;
  background: linear-gradient(180deg, #27304f 0%, #171d33 100%);
  border: 1px solid rgba(255, 215, 106, 0.45);
  box-shadow: 0 2px 0 #0a0d18, inset 0 1px 0 rgba(255, 243, 196, 0.25);
}

/* ==========================================================================
   Scoped game-wide Botanical Conservatory skin (only active when a botanical
   widget is present in the game's UI screens)
   ========================================================================== */
.tw-screens:has(.tw-botanical-scope) .tw-w {
  font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
}

/* Menu plaques: wrought-iron & moonlit stone with double antique-brass frame */
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] {
  background:
    radial-gradient(ellipse 90% 45% at 50% 0%, rgba(255, 215, 106, 0.09) 0%, transparent 65%),
    linear-gradient(180deg, rgba(27, 34, 58, 0.96) 0%, rgba(16, 21, 37, 0.97) 58%, rgba(11, 14, 26, 0.98) 100%) !important;
  border: 2px solid #8a6f42 !important;
  border-radius: 10px !important;
  box-shadow:
    inset 0 0 0 1px rgba(255, 224, 138, 0.26),
    inset 0 0 0 5px rgba(10, 13, 24, 0.72),
    inset 0 0 0 6px rgba(138, 111, 66, 0.32),
    0 28px 72px rgba(0, 0, 0, 0.85),
    0 0 42px rgba(242, 169, 59, 0.12) !important;
  overflow: visible !important;
}

/* Illuminated display headings */
.tw-screens:has(.tw-botanical-scope) [data-name="Game title"] {
  font-family: Georgia, 'Palatino Linotype', serif !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  color: #ffe28c !important;
  text-shadow: 0 0 32px rgba(255, 215, 106, 0.55), 0 3px 8px rgba(0, 0, 0, 0.92);
}

.tw-screens:has(.tw-botanical-scope) [data-name="Heading"] {
  font-family: Georgia, 'Palatino Linotype', serif !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  color: #ffd978 !important;
  text-shadow: 0 0 20px rgba(255, 215, 106, 0.36), 0 2px 4px rgba(0, 0, 0, 0.85);
}

.tw-screens:has(.tw-botanical-scope) [data-name="Subtitle"] {
  letter-spacing: 0.11em !important;
  text-transform: uppercase;
  color: #a6b0cf !important;
}

/* Tactile velvet-and-brass menu rows */
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]) {
  position: relative;
  background: linear-gradient(90deg, rgba(35, 44, 74, 0.72) 0%, rgba(20, 26, 46, 0.58) 100%) !important;
  border: 1px solid rgba(114, 126, 168, 0.34) !important;
  border-radius: 8px !important;
  padding: 10px 14px !important;
  box-shadow: inset 0 1px 0 rgba(230, 236, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.32);
  transition: transform 140ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"])::before {
  content: '✦';
  display: inline-block;
  margin-right: 8px;
  font-size: 12px;
  color: rgba(255, 215, 106, 0.35);
  transition: color 150ms ease, transform 150ms ease, text-shadow 150ms ease;
}

.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]):hover,
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]).focused {
  background: linear-gradient(90deg, rgba(242, 169, 59, 0.28) 0%, rgba(242, 169, 59, 0.08) 85%, rgba(30, 38, 66, 0.55) 100%) !important;
  border-color: #f2b44b !important;
  outline: none !important;
  transform: translateX(4px);
  box-shadow:
    inset 3px 0 0 #ffd76a,
    inset 0 1px 0 rgba(255, 243, 196, 0.24),
    0 6px 20px rgba(0, 0, 0, 0.45),
    0 0 18px rgba(242, 169, 59, 0.22) !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]):hover::before,
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]).focused::before {
  color: #ffe38e;
  transform: scale(1.25);
  text-shadow: 0 0 10px rgba(255, 215, 106, 0.9);
}

/* Primary action plaques (New game, Continue, Resume, Go on) */
.tw-screens:has(.tw-botanical-scope) [data-id="title.continue"],
.tw-screens:has(.tw-botanical-scope) [data-id="title.new"],
.tw-screens:has(.tw-botanical-scope) [data-id="pause.resume"],
.tw-screens:has(.tw-botanical-scope) [data-id="chapter.go"],
.tw-screens:has(.tw-botanical-scope) [data-id="end.rooms.go"] {
  background: linear-gradient(90deg, rgba(242, 169, 59, 0.22) 0%, rgba(164, 114, 42, 0.12) 60%, rgba(28, 35, 60, 0.65) 100%) !important;
  border-color: rgba(242, 180, 75, 0.62) !important;
}

/* Herbarium room cards */
.tw-screens:has(.tw-botanical-scope) [data-name="Room card"] {
  background: linear-gradient(160deg, rgba(34, 43, 72, 0.9) 0%, rgba(18, 23, 42, 0.95) 100%) !important;
  border: 1px solid rgba(138, 111, 66, 0.48) !important;
  border-radius: 8px !important;
  box-shadow: inset 0 1px 0 rgba(255, 236, 188, 0.12), 0 4px 12px rgba(0, 0, 0, 0.45) !important;
  transition: transform 130ms ease, border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}

.tw-screens:has(.tw-botanical-scope) [data-name="Room card"]:hover:not(.disabled),
.tw-screens:has(.tw-botanical-scope) [data-name="Room card"].focused {
  background: linear-gradient(160deg, rgba(242, 169, 59, 0.25) 0%, rgba(30, 38, 66, 0.96) 100%) !important;
  border-color: #ffd76a !important;
  outline: none !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 215, 106, 0.28) !important;
}

/* Bespoke HUD plaques */
.tw-screens:has(.tw-botanical-scope) [data-id="hud.where"] {
  background: linear-gradient(90deg, rgba(22, 28, 49, 0.92) 0%, rgba(14, 18, 33, 0.86) 100%) !important;
  border: 1px solid rgba(154, 124, 72, 0.55) !important;
  border-left: 3px solid #ffd76a !important;
  border-radius: 8px !important;
  padding: 8px 14px 8px 12px !important;
  box-shadow: inset 0 1px 0 rgba(255, 240, 195, 0.14), 0 8px 24px rgba(0, 0, 0, 0.65), 0 0 18px rgba(242, 169, 59, 0.12) !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.tally"] {
  background: linear-gradient(90deg, rgba(14, 18, 33, 0.86) 0%, rgba(22, 28, 49, 0.92) 100%) !important;
  border: 1px solid rgba(154, 124, 72, 0.55) !important;
  border-right: 3px solid #ffd76a !important;
  border-radius: 8px !important;
  padding: 8px 14px !important;
  box-shadow: inset 0 1px 0 rgba(255, 240, 195, 0.14), 0 8px 24px rgba(0, 0, 0, 0.65) !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.fly.icon"] img,
.tw-screens:has(.tw-botanical-scope) [data-id="hud.lamp.icon"] img {
  filter: drop-shadow(0 0 6px rgba(255, 215, 106, 0.7));
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.hint"] {
  background: linear-gradient(90deg, rgba(16, 21, 38, 0.62) 0%, rgba(25, 32, 56, 0.94) 18%, rgba(25, 32, 56, 0.94) 82%, rgba(16, 21, 38, 0.62) 100%) !important;
  border: 1px solid rgba(242, 180, 75, 0.52) !important;
  border-radius: 999px !important;
  padding: 7px 22px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65), 0 0 22px rgba(242, 169, 59, 0.14), inset 0 1px 0 rgba(255, 243, 196, 0.16) !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.hint.words"] {
  font-style: italic;
  color: #f4efe0 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
}

/* Title mark gentle lantern glow */
.tw-screens:has(.tw-botanical-scope) [data-id="title.picture"] img {
  filter: drop-shadow(0 6px 22px rgba(242, 169, 59, 0.32));
}
`;

const FLOURISH_SVG = `<svg viewBox="0 0 420 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="tw-b-gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8a6f42" stop-opacity="0"/>
      <stop offset="22%" stop-color="#c9a45c" stop-opacity="0.75"/>
      <stop offset="50%" stop-color="#ffe28c" stop-opacity="1"/>
      <stop offset="78%" stop-color="#c9a45c" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#8a6f42" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="M 10 11 L 178 11 M 242 11 L 410 11" stroke="url(#tw-b-gold)" stroke-width="1.2" fill="none"/>
  <path d="M 152 11 C 162 4, 174 4, 184 11 C 174 18, 162 18, 152 11 Z" fill="none" stroke="#d8b468" stroke-width="1.1" opacity="0.85"/>
  <path d="M 268 11 C 258 4, 246 4, 236 11 C 246 18, 258 18, 268 11 Z" fill="none" stroke="#d8b468" stroke-width="1.1" opacity="0.85"/>
  <path d="M 124 11 Q 134 5 144 11 Q 134 15 128 11" fill="none" stroke="#8a6f42" stroke-width="1" opacity="0.8"/>
  <path d="M 296 11 Q 286 5 276 11 Q 286 15 292 11" fill="none" stroke="#8a6f42" stroke-width="1" opacity="0.8"/>
  <path d="M 210 2 L 212.4 8.6 L 219 11 L 212.4 13.4 L 210 20 L 207.6 13.4 L 201 11 L 207.6 8.6 Z" fill="#ffd76a"/>
  <circle cx="193" cy="11" r="1.8" fill="#ffd76a" opacity="0.8"/>
  <circle cx="227" cy="11" r="1.8" fill="#ffd76a" opacity="0.8"/>
</svg>`;

const CORNER_SVG = `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M 2 32 L 2 8 Q 2 2 8 2 L 32 2" fill="none" stroke="#d4af64" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 6 24 L 6 10 Q 6 6 10 6 L 24 6" fill="none" stroke="#8a6f42" stroke-width="1" opacity="0.85"/>
  <path d="M 8 16 C 12 10, 16 10, 16 8 C 12 8, 9 11, 8 16 Z" fill="#ffd76a" opacity="0.72"/>
  <circle cx="6.5" cy="6.5" r="2.2" fill="#ffe28c"/>
</svg>`;

const FIREFLIES = [
  { x: '11%', y: '78%', sz: '6px', dur: '8.4s', delay: '0s', dx: '22px', dx2: '-12px' },
  { x: '22%', y: '62%', sz: '4px', dur: '10.2s', delay: '-2.1s', dx: '-18px', dx2: '14px' },
  { x: '34%', y: '84%', sz: '5px', dur: '9.1s', delay: '-4.4s', dx: '16px', dx2: '-8px' },
  { x: '68%', y: '80%', sz: '6px', dur: '8.8s', delay: '-1.3s', dx: '-24px', dx2: '12px' },
  { x: '81%', y: '66%', sz: '5px', dur: '11.0s', delay: '-5.2s', dx: '14px', dx2: '-16px' },
  { x: '89%', y: '42%', sz: '4px', dur: '9.6s', delay: '-3.0s', dx: '-16px', dx2: '10px' },
  { x: '16%', y: '34%', sz: '5px', dur: '10.6s', delay: '-6.5s', dx: '20px', dx2: '-10px' },
  { x: '76%', y: '24%', sz: '4px', dur: '9.3s', delay: '-2.8s', dx: '-14px', dx2: '16px' },
  { x: '48%', y: '90%', sz: '5px', dur: '8.2s', delay: '-1.8s', dx: '12px', dx2: '-18px' },
  { x: '58%', y: '18%', sz: '4px', dur: '11.4s', delay: '-7.1s', dx: '-12px', dx2: '14px' },
];

const STARS = [
  { x: '8%', y: '14%', dur: '4.6s', delay: '0s' },
  { x: '19%', y: '22%', dur: '6.1s', delay: '-1.4s' },
  { x: '31%', y: '11%', dur: '5.3s', delay: '-2.7s' },
  { x: '66%', y: '13%', dur: '4.9s', delay: '-0.8s' },
  { x: '84%', y: '19%', dur: '5.8s', delay: '-3.1s' },
  { x: '92%', y: '28%', dur: '6.4s', delay: '-2.2s' },
  { x: '13%', y: '51%', dur: '5.1s', delay: '-4.0s' },
  { x: '88%', y: '55%', dur: '4.8s', delay: '-1.9s' },
];

export const botanicalBackdropWidget: WidgetDef = {
  id: 'botanical-backdrop',
  label: 'Botanical moonlit backdrop (vignette, stars and drifting fireflies)',
  defaults: { w: 1280, h: 720, wMode: 'fill', hMode: 'fill' },
  css: BOTANICAL_CSS,
  render(el) {
    if (el.dataset.ready === '1') return;
    el.dataset.ready = '1';
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-backdrop tw-botanical-scope';
    for (const s of STARS) {
      const d = document.createElement('span');
      d.className = 'tw-bstar';
      d.style.setProperty('--x', s.x);
      d.style.setProperty('--y', s.y);
      d.style.setProperty('--dur', s.dur);
      d.style.setProperty('--delay', s.delay);
      wrap.append(d);
    }
    for (const f of FIREFLIES) {
      const d = document.createElement('span');
      d.className = 'tw-bfly';
      d.style.setProperty('--x', f.x);
      d.style.setProperty('--y', f.y);
      d.style.setProperty('--sz', f.sz);
      d.style.setProperty('--dur', f.dur);
      d.style.setProperty('--delay', f.delay);
      d.style.setProperty('--dx', f.dx);
      d.style.setProperty('--dx2', f.dx2);
      wrap.append(d);
    }
    el.replaceChildren(wrap);
  },
};

export const botanicalFlourishWidget: WidgetDef = {
  id: 'botanical-flourish',
  label: 'Botanical divider (golden vine tendrils and star)',
  defaults: { w: 360, h: 22, wMode: 'fill', hMode: 'fixed' },
  css: BOTANICAL_CSS,
  render(el) {
    if (el.dataset.ready === '1') return;
    el.dataset.ready = '1';
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-flourish tw-botanical-scope';
    wrap.innerHTML = FLOURISH_SVG;
    el.replaceChildren(wrap);
  },
};

export const botanicalCornersWidget: WidgetDef = {
  id: 'botanical-corners',
  label: 'Botanical filigree corners (four wrought-iron corner brackets)',
  defaults: { w: 480, h: 320, wMode: 'fill', hMode: 'fill' },
  css: BOTANICAL_CSS,
  render(el) {
    if (el.dataset.ready === '1') return;
    el.dataset.ready = '1';
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-corners tw-botanical-scope';
    wrap.innerHTML = `${CORNER_SVG.replace('<svg ', '<svg class="c-tl" ')}${CORNER_SVG.replace('<svg ', '<svg class="c-tr" ')}${CORNER_SVG.replace('<svg ', '<svg class="c-bl" ')}${CORNER_SVG.replace('<svg ', '<svg class="c-br" ')}`;
    el.replaceChildren(wrap);
  },
};

export const botanicalKeysWidget: WidgetDef = {
  id: 'botanical-keys',
  label: 'Botanical keycap bar (embossed brass keycaps for controls)',
  defaults: { w: 460, h: 30, wMode: 'auto', hMode: 'auto' },
  css: BOTANICAL_CSS,
  render(el, node) {
    const raw = node.text || 'Arrows:walk|E:lamp|Shift:turn|R:restart|Esc:pause';
    if (el.dataset.sig === raw) return;
    el.dataset.sig = raw;
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-keys tw-botanical-scope';
    for (const item of raw.split('|')) {
      const [key, label] = item.split(':');
      if (!key) continue;
      const pair = document.createElement('span');
      pair.className = 'kpair';
      const kbd = document.createElement('kbd');
      kbd.textContent = key.trim();
      pair.append(kbd);
      if (label) {
        const txt = document.createElement('span');
        txt.textContent = label.trim();
        pair.append(txt);
      }
      wrap.append(pair);
    }
    el.replaceChildren(wrap);
  },
};

export const botanicalUiPlugin: PluginDefinition = definePlugin(manifest, {
  install(api) {
    for (const w of [botanicalBackdropWidget, botanicalFlourishWidget, botanicalCornersWidget, botanicalKeysWidget]) {
      api.widget(w);
    }
  },
});
