import { definePlugin, type PluginDefinition, type WidgetDef } from '@tilewright/plugin-sdk';
import manifest from '../plugin.json' with { type: 'json' };

/**
 * Botanical UI: a full-screen, borderless, hard-cornered indie game UI for moonlit botanical games.
 * - Full-screen editorial Title menu (no centered modal box), with an atmospheric illustrated night-garden backdrop.
 * - Hard architectural corners (border-radius: 0) and zero clunky 4-sided outlines.
 * - Pure typographic menu items that reveal a sharp 2px golden accent bar and fading warm wash on hover/focus.
 * - Clean borderless HUD floating over subtle edge vignettes.
 * All CSS is scoped to `.tw-screens:has(.tw-botanical-scope)` so it only affects games using these widgets.
 */

const BOTANICAL_CSS = `
/* ---------- full-screen atmospheric night-garden backdrop ---------- */
.tw-botanical-backdrop {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle 420px at 74% 30%, rgba(255, 224, 140, 0.12) 0%, rgba(143, 184, 255, 0.06) 42%, transparent 72%),
    linear-gradient(105deg, rgba(9, 12, 22, 0.96) 0%, rgba(12, 16, 30, 0.88) 42%, rgba(14, 20, 38, 0.58) 72%, rgba(9, 13, 25, 0.78) 100%);
}
.tw-botanical-backdrop .tw-bg-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.tw-botanical-backdrop .tw-bfly {
  position: absolute;
  width: var(--sz, 5px);
  height: var(--sz, 5px);
  border-radius: 50%;
  background: radial-gradient(circle, #fff8d6 0%, #ffd76a 45%, rgba(242, 169, 59, 0) 75%);
  box-shadow: 0 0 12px 2px rgba(255, 215, 106, 0.55);
  left: var(--x, 50%);
  top: var(--y, 50%);
  opacity: 0;
  animation: tw-bfly-drift var(--dur, 9s) ease-in-out var(--delay, 0s) infinite;
}
.tw-botanical-backdrop .tw-bstar {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #dce7ff;
  left: var(--x, 20%);
  top: var(--y, 20%);
  opacity: 0.25;
  animation: tw-bstar-twinkle var(--dur, 5s) ease-in-out var(--delay, 0s) infinite;
}
@keyframes tw-bfly-drift {
  0%   { opacity: 0; transform: translate(0, 14px) scale(0.7); }
  20%  { opacity: 0.92; }
  50%  { opacity: 0.6; transform: translate(var(--dx, 18px), -20px) scale(1.15); }
  80%  { opacity: 0.95; }
  100% { opacity: 0; transform: translate(var(--dx2, -12px), -46px) scale(0.75); }
}
@keyframes tw-bstar-twinkle {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.75; }
}

/* ---------- crisp minimal golden accent rule (no clip-art clutter) ---------- */
.tw-botanical-flourish {
  width: 100%;
  height: 10px;
  display: flex;
  align-items: center;
  pointer-events: none;
  margin: 2px 0 6px;
}
.tw-botanical-flourish .line {
  width: 72px;
  height: 2px;
  background: linear-gradient(90deg, #ffd76a 0%, rgba(255, 215, 106, 0.15) 100%);
}

/* ---------- clean minimal keycap footer (hard corners, no heavy borders) ---------- */
.tw-botanical-keys {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 6px 16px;
  background: rgba(10, 13, 24, 0.68);
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 11.5px;
  letter-spacing: 0.03em;
  color: #9ba5c4;
  pointer-events: none;
}
.tw-botanical-keys .kpair {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tw-botanical-keys kbd {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 0;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffe28c;
  background: rgba(255, 215, 106, 0.14);
  border: none;
  border-bottom: 1px solid rgba(255, 215, 106, 0.55);
}

/* ==========================================================================
   Scoped game-wide UI: full-screen title, hard corners, zero ugly outlines
   ========================================================================== */
.tw-screens:has(.tw-botanical-scope) .tw-w {
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  border-radius: 0 !important;
}

/* Strip focus outlines globally inside botanical UI (we use clean left bars & washes instead) */
.tw-screens:has(.tw-botanical-scope) .tw-w.focused {
  outline: none !important;
}

/* ---------- FULL-SCREEN TITLE MENU (no square modal box!) ---------- */
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.box"] {
  position: absolute !important;
  inset: 0 !important;
  left: 0 !important;
  top: 0 !important;
  transform: none !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  padding: 28px 64px 24px 72px !important;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  justify-content: center !important;
  align-items: flex-start !important;
  zoom: 1 !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.box"] > .tw-scroll-content {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: flex-start !important;
  min-height: 100% !important;
  width: 100% !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.mark"] {
  width: 440px !important;
  align-items: flex-start !important;
  margin-bottom: 2px;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.name"],
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.subtitle"] {
  text-align: left !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.picture"] {
  width: 200px !important;
  height: 76px !important;
  margin-bottom: 2px;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.picture"] img {
  filter: drop-shadow(0 8px 26px rgba(242, 169, 59, 0.35));
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] .tw-w.panel.clickable {
  width: 360px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.rule.bottom"] {
  display: none !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-id$="title.hint"] {
  margin-top: 10px;
  opacity: 0.65;
}

/* ---------- PAUSE: sleek full-height left drawer (hard corners, no 4-sided outline) ---------- */
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Pause"] [data-id$="pause.box"] {
  position: absolute !important;
  top: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  transform: none !important;
  width: 420px !important;
  height: 100% !important;
  max-height: none !important;
  padding: 28px 36px 24px 48px !important;
  background: linear-gradient(90deg, rgba(10, 14, 26, 0.96) 0%, rgba(13, 18, 33, 0.92) 86%, rgba(13, 18, 33, 0.72) 100%) !important;
  backdrop-filter: blur(12px);
  border: none !important;
  border-right: 1px solid rgba(255, 215, 106, 0.24) !important;
  box-shadow: 24px 0 64px rgba(0, 0, 0, 0.68) !important;
  zoom: 1 !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Pause"] [data-id$="pause.box"] > .tw-scroll-content {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  min-height: 100% !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Pause"] [data-name="Label"],
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Pause"] [data-name="Detail"],
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-name="Label"],
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Title"] [data-name="Detail"] {
  white-space: nowrap !important;
}

/* ---------- FULL-SCREEN EDITORIAL ROOM CHOOSER (no cramped modal box!) ---------- */
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Rooms"] [data-id$="rooms.box"] {
  position: absolute !important;
  inset: 0 !important;
  left: 0 !important;
  top: 0 !important;
  transform: none !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  padding: 20px 44px 16px !important;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  zoom: 1 !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Rooms"] [data-id$="rooms.box"] > .tw-scroll-content {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  min-height: 100% !important;
  width: 100% !important;
  max-width: 1180px !important;
  margin: 0 auto !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Rooms"] [data-id$="rooms.grid"] {
  display: grid !important;
  grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
  gap: 8px 10px !important;
  width: 100% !important;
  margin: 4px 0 10px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Rooms"] [data-id$="rooms.back"] {
  width: 220px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Rooms"] [data-id$="rooms.rule.bottom"] {
  display: none !important;
}

/* ---------- FULL-SCREEN SETTINGS & CONTROLS (clean editorial layout, zero wonky boxes) ---------- */
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] [data-id$="settings.box"],
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Controls"] [data-id$="controls.box"] {
  position: absolute !important;
  inset: 0 !important;
  left: 0 !important;
  top: 0 !important;
  transform: none !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  padding: 36px 72px 28px !important;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  zoom: 1 !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] [data-id$="settings.box"] > .tw-scroll-content {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: flex-start !important;
  min-height: 100% !important;
  width: 100% !important;
  max-width: 540px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Controls"] [data-id$="controls.box"] > .tw-scroll-content {
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  width: 100% !important;
  max-width: 780px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] [data-id$="settings.rule.bottom"],
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Controls"] [data-id$="controls.rule.bottom"] {
  display: none !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] .tw-scroll-content > .tw-w.panel:not(.clickable) {
  width: 100% !important;
  background: rgba(15, 20, 35, 0.74) !important;
  backdrop-filter: blur(6px);
  border: none !important;
  border-left: 2px solid rgba(255, 215, 106, 0.24) !important;
  border-radius: 0 !important;
  padding: 11px 16px !important;
  overflow: hidden;
  transition: background 140ms ease, border-color 140ms ease;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] .tw-scroll-content > .tw-w.panel:not(.clickable):has(.focused),
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] .tw-scroll-content > .tw-w.panel:not(.clickable):hover {
  background: linear-gradient(90deg, rgba(255, 215, 106, 0.16) 0%, rgba(15, 20, 35, 0.78) 100%) !important;
  border-left-color: #ffd76a !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Settings"] .tw-w.panel.clickable {
  width: 100% !important;
}

/* Clean frameless sliders & toggles (strip ugly brown focus box) */
.tw-screens:has(.tw-botanical-scope) .tw-w.engine-slider,
.tw-screens:has(.tw-botanical-scope) .tw-w.engine-slider.focused,
.tw-screens:has(.tw-botanical-scope) .tw-w.engine-toggle,
.tw-screens:has(.tw-botanical-scope) .tw-w.engine-toggle.focused {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.tw-screens:has(.tw-botanical-scope) .tw-w.engine-slider {
  max-width: 220px !important;
  width: 220px !important;
  flex: 0 0 220px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Controls"] .tw-w.keybind {
  background: rgba(15, 20, 35, 0.72) !important;
  border: none !important;
  border-left: 2px solid transparent !important;
  border-radius: 0 !important;
  padding: 8px 14px !important;
  font-size: 14px !important;
}

.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Controls"] .tw-w.keybind:hover,
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-Controls"] .tw-w.keybind.focused {
  background: linear-gradient(90deg, rgba(255, 215, 106, 0.18) 0%, rgba(15, 20, 35, 0.78) 100%) !important;
  border-left: 2px solid #ffd76a !important;
}

/* ---------- ALL OTHER OVERLAY PANELS (Chapter, How to play, Herbarium, The end) ---------- */
/* Hard corners, zero 4-sided outline, clean dark tonal surface + single top 2px gold hairline.
   Use > .tw-w > so nested widgets whose id happens to end in ".box" (like settings.full.box) are never matched! */
.tw-screens:has(.tw-botanical-scope) .tw-screen > .tw-w > [data-id$=".box"]:not([data-id$="title.box"]):not([data-id$="pause.box"]):not([data-id$="rooms.box"]):not([data-id$="settings.box"]):not([data-id$="controls.box"]) {
  background: linear-gradient(180deg, rgba(18, 23, 40, 0.96) 0%, rgba(11, 14, 25, 0.98) 100%) !important;
  border: none !important;
  border-top: 2px solid #ffd76a !important;
  border-radius: 0 !important;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.82) !important;
  padding: 28px 32px 24px !important;
}

/* ---------- TYPOGRAPHY ---------- */
.tw-screens:has(.tw-botanical-scope) [data-name="Game title"] {
  font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', serif !important;
  font-size: 54px !important;
  font-weight: 400 !important;
  letter-spacing: 0.04em !important;
  line-height: 1.05 !important;
  color: #f6e7c1 !important;
  text-shadow: 0 0 36px rgba(255, 215, 106, 0.38), 0 4px 16px rgba(0, 0, 0, 0.85);
}

.tw-screens:has(.tw-botanical-scope) [data-name="Heading"] {
  font-family: Georgia, 'Palatino Linotype', serif !important;
  font-weight: 400 !important;
  letter-spacing: 0.03em !important;
  color: #f6e7c1 !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
}

.tw-screens:has(.tw-botanical-scope) [data-name="Subtitle"] {
  letter-spacing: 0.16em !important;
  text-transform: uppercase;
  color: #8f9bb8 !important;
}

/* ---------- BORDERLESS MENU ITEMS (no boxes, no outlines!) ---------- */
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]) {
  background: transparent !important;
  border: none !important;
  border-left: 2px solid transparent !important;
  border-radius: 0 !important;
  padding: 8px 14px !important;
  box-shadow: none !important;
  transition: transform 140ms ease, background 150ms ease, border-color 150ms ease, color 150ms ease;
}

.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]):hover,
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]).focused {
  background: linear-gradient(90deg, rgba(255, 215, 106, 0.18) 0%, rgba(255, 215, 106, 0.03) 78%, transparent 100%) !important;
  border-left: 2px solid #ffd76a !important;
  transform: translateX(6px);
}

.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]):hover [data-name="Label"],
.tw-screens:has(.tw-botanical-scope) [data-id$=".box"] .tw-w.panel.clickable:not([data-name="Room card"]).focused [data-name="Label"] {
  color: #ffe28c !important;
}

/* Primary action item: subtle resting golden bar + warm wash */
.tw-screens:has(.tw-botanical-scope) [data-id="title.continue"],
.tw-screens:has(.tw-botanical-scope) [data-id="title.new"],
.tw-screens:has(.tw-botanical-scope) [data-id="pause.resume"],
.tw-screens:has(.tw-botanical-scope) [data-id="chapter.go"],
.tw-screens:has(.tw-botanical-scope) [data-id="end.rooms.go"] {
  background: linear-gradient(90deg, rgba(255, 215, 106, 0.11) 0%, transparent 90%) !important;
  border-left: 2px solid rgba(255, 215, 106, 0.6) !important;
}

/* How-to-play rows: subtle tonal zebra strips, NO borders */
.tw-screens:has(.tw-botanical-scope) [data-testid="tw-screen-How to play"] .tw-scroll-content > .tw-w.panel:not(.clickable) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: none !important;
  border-radius: 0 !important;
  overflow: hidden;
}

/* ---------- SHARP-CORNERED BORDERLESS ROOM TILES ---------- */
.tw-screens:has(.tw-botanical-scope) [data-name="Room card"] {
  width: 100% !important;
  min-width: 0 !important;
  height: 68px !important;
  padding: 7px 10px !important;
  background: rgba(15, 20, 35, 0.78) !important;
  backdrop-filter: blur(6px);
  border: none !important;
  border-left: 2px solid rgba(255, 215, 106, 0.28) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
  justify-content: space-between !important;
  transition: background 140ms ease, border-color 140ms ease, transform 130ms ease;
}

.tw-screens:has(.tw-botanical-scope) [data-name="Room card"].disabled {
  background: rgba(12, 16, 28, 0.56) !important;
  border-left-color: rgba(143, 155, 184, 0.16) !important;
}

.tw-screens:has(.tw-botanical-scope) [data-name="Room card"]:hover:not(.disabled),
.tw-screens:has(.tw-botanical-scope) [data-name="Room card"].focused {
  background: linear-gradient(90deg, rgba(255, 215, 106, 0.2) 0%, rgba(255, 215, 106, 0.06) 100%) !important;
  border-left: 2px solid #ffd76a !important;
  transform: translateY(-2px);
}

.tw-screens:has(.tw-botanical-scope) [data-name="Room card"] [data-name="Number"] {
  font-family: Georgia, 'Palatino Linotype', serif !important;
  font-size: 19px !important;
  line-height: 1 !important;
}

.tw-screens:has(.tw-botanical-scope) [data-name="Room card"] [data-name="Room name"] {
  font-size: 13.5px !important;
  font-weight: 500 !important;
  line-height: 1.25 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.tw-screens:has(.tw-botanical-scope) [data-name="Room card"] [data-name="Difficulty"] {
  font-size: 11px !important;
  letter-spacing: 0.03em !important;
  opacity: 0.78 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* ---------- CLEAN BORDERLESS IN-GAME HUD ---------- */
.tw-screens:has(.tw-botanical-scope) [data-id="hud.where"] {
  background: linear-gradient(90deg, rgba(10, 13, 24, 0.84) 0%, rgba(10, 13, 24, 0.52) 85%, transparent 100%) !important;
  border: none !important;
  border-left: 2px solid #ffd76a !important;
  border-radius: 0 !important;
  padding: 8px 20px 8px 12px !important;
  box-shadow: none !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.tally"] {
  background: linear-gradient(270deg, rgba(10, 13, 24, 0.84) 0%, rgba(10, 13, 24, 0.52) 85%, transparent 100%) !important;
  border: none !important;
  border-right: 2px solid rgba(255, 215, 106, 0.7) !important;
  border-radius: 0 !important;
  padding: 8px 14px 8px 20px !important;
  box-shadow: none !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.fly.icon"] img,
.tw-screens:has(.tw-botanical-scope) [data-id="hud.lamp.icon"] img {
  filter: drop-shadow(0 0 6px rgba(255, 215, 106, 0.65));
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.hint"] {
  background: linear-gradient(90deg, transparent 0%, rgba(10, 13, 24, 0.82) 18%, rgba(10, 13, 24, 0.82) 82%, transparent 100%) !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 8px 32px !important;
  box-shadow: none !important;
}

.tw-screens:has(.tw-botanical-scope) [data-id="hud.hint.words"] {
  font-family: Georgia, 'Palatino Linotype', serif;
  font-style: italic;
  color: #f3ecd9 !important;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}
`;

/** Atmospheric illustrated moonlit-garden silhouette SVG for the full-screen backdrop. */
const GARDEN_BG_SVG = `<svg class="tw-bg-art" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="tw-moon-halo" cx="76%" cy="26%" r="32%">
      <stop offset="0%" stop-color="#ffe7a8" stop-opacity="0.22"/>
      <stop offset="45%" stop-color="#8fb8ff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#0b0f1d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="tw-lantern-halo" cx="72%" cy="62%" r="22%">
      <stop offset="0%" stop-color="#f2a93b" stop-opacity="0.24"/>
      <stop offset="55%" stop-color="#f2a93b" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0b0f1d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#tw-moon-halo)"/>
  <rect width="1280" height="720" fill="url(#tw-lantern-halo)"/>
  <!-- True crescent moon (no dark mask circle) -->
  <path d="M 976 100 A 46 46 0 1 0 1008 178 A 36 36 0 1 1 976 100 Z" fill="#f3f6ff" opacity="0.92"/>
  <!-- Distant rolling garden walls & yew hedge silhouettes -->
  <path d="M 0 580 Q 240 530 480 565 T 960 540 T 1280 560 L 1280 720 L 0 720 Z" fill="#0d1222" opacity="0.85"/>
  <path d="M 0 635 Q 320 595 640 625 T 1280 595 L 1280 720 L 0 720 Z" fill="#090d19" opacity="0.96"/>
  <!-- Stylized silhouette garden lantern post & glowing moonbloom on the right -->
  <g transform="translate(918, 412)" opacity="0.88">
    <rect x="-3" y="34" width="6" height="190" fill="#090d19"/>
    <rect x="-14" y="28" width="28" height="6" fill="#090d19"/>
    <rect x="-11" y="4" width="22" height="24" fill="#ffd76a" opacity="0.85"/>
    <rect x="-6" y="8" width="12" height="16" fill="#fff6d1"/>
    <polygon points="-16,4 0,-12 16,4" fill="#090d19"/>
  </g>
  <!-- Moonbloom silhouette -->
  <g transform="translate(1030, 480)" opacity="0.72">
    <rect x="-3" y="18" width="6" height="130" fill="#142b28"/>
    <ellipse cx="-18" cy="74" rx="18" ry="6" fill="#1a3d34"/>
    <ellipse cx="18" cy="54" rx="18" ry="6" fill="#1a3d34"/>
    <ellipse cx="0" cy="14" rx="34" ry="18" fill="#8fb8ff" opacity="0.55"/>
    <ellipse cx="0" cy="12" rx="20" ry="10" fill="#dbe9ff" opacity="0.8"/>
  </g>
</svg>`;

const FIREFLIES = [
  { x: '54%', y: '72%', sz: '6px', dur: '8.4s', delay: '0s', dx: '22px', dx2: '-12px' },
  { x: '62%', y: '56%', sz: '4px', dur: '10.2s', delay: '-2.1s', dx: '-18px', dx2: '14px' },
  { x: '70%', y: '68%', sz: '6px', dur: '9.1s', delay: '-4.4s', dx: '16px', dx2: '-8px' },
  { x: '78%', y: '52%', sz: '5px', dur: '8.8s', delay: '-1.3s', dx: '-24px', dx2: '12px' },
  { x: '84%', y: '74%', sz: '5px', dur: '11.0s', delay: '-5.2s', dx: '14px', dx2: '-16px' },
  { x: '90%', y: '44%', sz: '4px', dur: '9.6s', delay: '-3.0s', dx: '-16px', dx2: '10px' },
  { x: '66%', y: '34%', sz: '5px', dur: '10.6s', delay: '-6.5s', dx: '20px', dx2: '-10px' },
  { x: '82%', y: '26%', sz: '4px', dur: '9.3s', delay: '-2.8s', dx: '-14px', dx2: '16px' },
  { x: '46%', y: '84%', sz: '4px', dur: '8.2s', delay: '-1.8s', dx: '12px', dx2: '-18px' },
  { x: '74%', y: '86%', sz: '5px', dur: '11.4s', delay: '-7.1s', dx: '-12px', dx2: '14px' },
];

const STARS = [
  { x: '48%', y: '14%', dur: '4.6s', delay: '0s' },
  { x: '56%', y: '22%', dur: '6.1s', delay: '-1.4s' },
  { x: '64%', y: '11%', dur: '5.3s', delay: '-2.7s' },
  { x: '70%', y: '18%', dur: '4.9s', delay: '-0.8s' },
  { x: '84%', y: '15%', dur: '5.8s', delay: '-3.1s' },
  { x: '92%', y: '28%', dur: '6.4s', delay: '-2.2s' },
  { x: '60%', y: '42%', dur: '5.1s', delay: '-4.0s' },
  { x: '88%', y: '52%', dur: '4.8s', delay: '-1.9s' },
];

export const botanicalBackdropWidget: WidgetDef = {
  id: 'botanical-backdrop',
  label: 'Botanical moonlit backdrop (full-screen illustrated night garden and fireflies)',
  defaults: { w: 1280, h: 720, wMode: 'fill', hMode: 'fill' },
  css: BOTANICAL_CSS,
  render(el) {
    if (el.dataset.ready === '1') return;
    el.dataset.ready = '1';
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-backdrop tw-botanical-scope';
    wrap.innerHTML = GARDEN_BG_SVG;
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
  label: 'Botanical accent rule (clean golden hairline)',
  defaults: { w: 360, h: 10, wMode: 'fill', hMode: 'fixed' },
  css: BOTANICAL_CSS,
  render(el) {
    if (el.dataset.ready === '1') return;
    el.dataset.ready = '1';
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-flourish tw-botanical-scope';
    const line = document.createElement('div');
    line.className = 'line';
    wrap.append(line);
    el.replaceChildren(wrap);
  },
};

export const botanicalCornersWidget: WidgetDef = {
  id: 'botanical-corners',
  label: 'Botanical scope marker',
  defaults: { w: 1, h: 1, wMode: 'fixed', hMode: 'fixed' },
  css: BOTANICAL_CSS,
  render(el) {
    if (el.dataset.ready === '1') return;
    el.dataset.ready = '1';
    const wrap = document.createElement('div');
    wrap.className = 'tw-botanical-scope';
    el.replaceChildren(wrap);
  },
};

export const botanicalKeysWidget: WidgetDef = {
  id: 'botanical-keys',
  label: 'Botanical keycap bar (minimal sharp-cornered key labels)',
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
