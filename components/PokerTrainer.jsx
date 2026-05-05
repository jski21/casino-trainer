"use client";

import React, { useState } from "react";
import { HAND_QUIZ, WINNING_HAND_QUIZ, PREFLOP_QUIZ, POSTFLOP_QUIZ } from "@/components/pokerScenarios";

const e = React.createElement;
const AnimatePresence = ({ children }) => e(React.Fragment, null, children);
const MotionDiv = ({ children, ...props }) => e("div", props, children);
const motion = { div: MotionDiv };



// ============= STYLES =============
// Hooks into the global theme tokens defined in app/globals.css so the
// Poker pane themes alongside Blackjack and Baccarat (light + dark).
const styles = `
.app {
  --felt-deep: var(--bg);
  --felt: var(--bg-elev);
  --felt-light: var(--bg-elev-2);
  --brass: var(--accent);
  --brass-bright: var(--accent-strong);
  --brass-dim: color-mix(in srgb, var(--accent) 35%, var(--bg));
  --cream: var(--text);
  --cream-dim: var(--text-2);
  --ivory: var(--text);
  --burgundy: var(--danger);
  --burgundy-dark: color-mix(in srgb, var(--danger) 45%, var(--bg));
  --ink: var(--bg);
  --shadow: var(--shadow);
  --surface-0: var(--bg);
  --surface-1: var(--bg-elev);
  --surface-2: var(--bg-elev-2);
  --surface-3: var(--bg-elev-3);
  --line-soft: var(--border);
  --line-strong: var(--border-strong);
  --text-main: var(--text);
  --text-dim: var(--text-3);
  --accent: var(--accent);
  --accent-strong: var(--accent-strong);
  --warn: var(--warn);
  --bad: var(--danger);
}

.app * { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  background:
    radial-gradient(ellipse at top, var(--felt-light) 0%, var(--felt-deep) 70%),
    var(--felt-deep);
  font-family: 'Courier New', monospace;
  color: var(--cream);
  min-height: 100vh;
  overflow-x: hidden;
}

.app { position: relative; z-index: 2; min-height: 100vh; }

/* Header */
.header {
  padding: 1.15rem 1rem 0.9rem;
  text-align: center;
  border-bottom: 1px solid rgba(79,255,176,0.16);
  position: relative;
}

.header::before, .header::after {
  content: '♠';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--brass);
  font-size: 1.5rem;
  opacity: 0.4;
}
.header::before { left: 2rem; }
.header::after { right: 2rem; content: '♣'; }

.eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--brass);
  margin-bottom: 0.28rem;
}

.title {
  font-family: 'Courier New', monospace;
  font-size: clamp(1.5rem, 4.5vw, 2.6rem);
  font-weight: 900;
  font-style: normal;
  color: var(--ivory);
  letter-spacing: 0.09em;
  line-height: 1;
}

.title .amp {
  color: var(--brass);
  font-style: normal;
  font-weight: 900;
}

.subtitle {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: var(--cream-dim);
  margin-top: 0.35rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Navigation */
.nav {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 0.75rem;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(79,255,176,0.12);
  background: #0a130d;
}

.nav-item {
  background: #0d1810;
  border: 1px solid #1c3326;
  color: var(--cream-dim);
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.13em;
  padding: 0.62rem 0.9rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  text-transform: uppercase;
  font-weight: 900;
  border-radius: 8px;
}

.nav-item:hover {
  color: var(--cream);
  border-color: #2d5f44;
  transform: translateY(-1px);
}

.nav-item.active {
  color: #070c0a;
  background: var(--accent);
  border-color: var(--accent);
}

.nav-item.active::after {
  content: none;
}

.nav-num {
  font-family: 'Courier New', monospace;
  font-size: 0.58rem;
  color: currentColor;
  margin-right: 0.35rem;
  vertical-align: super;
  opacity: 0.8;
}

/* Section */
.section {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 1rem 2.75rem;
}

.section-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.section-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  color: var(--brass);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.section-title {
  font-family: 'Courier New', monospace;
  font-size: clamp(1.6rem, 3.2vw, 2.5rem);
  font-weight: 900;
  color: var(--ivory);
  font-style: normal;
  letter-spacing: 0.03em;
}

.section-desc {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: var(--cream-dim);
  margin-top: 0.75rem;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.quick-start {
  margin: 1rem auto 0;
  max-width: 820px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(79, 255, 176, 0.2);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  color: var(--cream-dim);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  line-height: 1.6;
  text-transform: uppercase;
}

.quick-start strong {
  color: var(--brass-bright);
}

/* Tab toggle (Learn/Practice) */
.mode-toggle {
  display: inline-flex;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--brass-dim);
  border-radius: 2px;
  padding: 4px;
  margin: 0 auto 2rem;
  position: relative;
}

.mode-toggle-wrap {
  display: flex;
  justify-content: center;
}

.mode-btn {
  background: none;
  border: none;
  color: var(--cream-dim);
  padding: 0.6rem 2rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 1px;
}

.mode-btn.active {
  background: var(--brass);
  color: var(--ink);
  box-shadow: 0 2px 8px rgba(79,255,176,0.3);
}

/* Cards */
.card-wrap { display: inline-block; perspective: 600px; }

.card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 64px;
  height: 90px;
  background: linear-gradient(180deg, #ffffff 0%, #f3f7f4 100%);
  border-radius: 10px;
  padding: 6px 8px;
  box-shadow: 
    0 6px 16px rgba(0,0,0,0.35),
    inset 0 0 0 1px rgba(0,0,0,0.12),
    inset 0 0 0 3px rgba(255,255,255,0.65);
  font-family: 'Courier New', monospace;
  font-weight: 600;
  position: relative;
  margin: 0 3px;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 25%, rgba(255,255,255,0.8) 0%, transparent 45%);
  pointer-events: none;
}

.card.lg { width: 80px; height: 112px; padding: 8px 10px; }
.card.sm { width: 48px; height: 68px; padding: 5px 7px; font-size: 0.85rem; }

.card.red { color: var(--burgundy); }
.card.black { color: var(--ink); }

.card-corner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1;
  z-index: 1;
}

.card-corner.bottom {
  position: absolute;
  right: 8px;
  bottom: 6px;
  transform: rotate(180deg);
  align-items: flex-start;
}

.card-rank {
  font-size: 1.05rem;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.card-suit {
  font-size: 0.95rem;
  line-height: 1;
}

.card-center-suit {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  font-size: 1.55rem;
  opacity: 0.9;
  text-shadow: 0 1px 0 rgba(255,255,255,0.55);
}

.card.lg .card-rank { font-size: 1.25rem; }
.card.lg .card-suit { font-size: 1.2rem; }
.card.lg .card-center-suit { font-size: 2.05rem; }

.card.sm .card-rank { font-size: 0.82rem; }
.card.sm .card-suit { font-size: 0.72rem; }
.card.sm .card-center-suit { font-size: 1rem; }

.card-back {
  background: 
    repeating-linear-gradient(45deg, var(--burgundy) 0, var(--burgundy) 4px, var(--burgundy-dark) 4px, var(--burgundy-dark) 8px);
  border: 2px solid var(--brass);
}

/* Hand row */
.hand-row {
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%);
  border: 1px solid rgba(79,255,176,0.15);
  border-radius: 4px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.75rem;
  display: grid;
  grid-template-columns: 60px 200px 1fr;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.3s;
}

.hand-row:hover {
  background: linear-gradient(180deg, rgba(79,255,176,0.05) 0%, rgba(0,0,0,0.1) 100%);
  border-color: rgba(79,255,176,0.4);
}

.hand-rank-num {
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: 500;
  font-style: italic;
  color: var(--brass);
  text-align: center;
  line-height: 1;
}

.hand-name {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ivory);
  font-style: italic;
}

.hand-desc {
  font-size: 0.9rem;
  color: var(--cream-dim);
  line-height: 1.5;
}

.hand-cards {
  display: flex;
  align-items: center;
}

@media (max-width: 700px) {
  .hand-row {
    grid-template-columns: 50px 1fr;
    grid-template-areas: "num name" "num desc" "cards cards";
    gap: 0.5rem;
  }
  .hand-rank-num { grid-area: num; font-size: 2rem; }
  .hand-name { grid-area: name; font-size: 1.2rem; }
  .hand-desc { grid-area: desc; }
  .hand-cards { grid-area: cards; margin-top: 0.5rem; flex-wrap: wrap; }
}

/* Practice panel */
.practice-panel {
  background: linear-gradient(180deg, rgba(16,28,19,0.95) 0%, rgba(13,24,16,0.95) 100%);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  padding: 1.6rem 1.4rem;
  position: relative;
  box-shadow: inset 0 0 0 1px rgba(79,255,176,0.06);
}

.practice-panel::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(79,255,176,0.12);
  border-radius: 8px;
  pointer-events: none;
}

.practice-prompt {
  font-family: 'Courier New', monospace;
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  color: var(--cream);
  text-align: center;
  margin-bottom: 1rem;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.cards-display {
  display: flex;
  justify-content: center;
  gap: 0.65rem;
  margin: 1.25rem 0;
  flex-wrap: wrap;
}

.choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  max-width: 700px;
  margin: 0 auto;
}

.choice-btn {
  background: #0d1810;
  border: 1px solid #2a4a35;
  color: var(--cream);
  padding: 0.8rem 0.9rem;
  font-family: 'Courier New', monospace;
  font-size: 0.92rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  font-weight: 900;
}

.choice-btn:hover:not(:disabled) {
  background: #132619;
  border-color: var(--accent);
  color: var(--ivory);
  transform: translateY(-1px) scale(1.01);
}

.choice-btn:disabled { cursor: default; }

.choice-btn.correct {
  background: #183624;
  border-color: #4fffb0;
  color: #7fffc9;
}

.choice-btn.incorrect {
  background: #33131b;
  border-color: var(--bad);
  color: #ff9eb3;
}

.feedback {
  margin-top: 1.5rem;
  padding: 1rem 1.1rem;
  background: #0d1810;
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--cream);
}

.feedback.correct { border-left-color: #5a9c66; }
.feedback.incorrect { border-left-color: var(--burgundy); }

.feedback strong {
  color: var(--brass-bright);
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-style: normal;
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.4rem;
  letter-spacing: 0.05em;
}

.next-btn {
  display: block;
  margin: 1.5rem auto 0;
  background: var(--brass);
  color: var(--ink);
  border: none;
  padding: 0.75rem 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 900;
  transition: all 0.2s;
}

.next-btn:hover {
  background: var(--brass-bright);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79,255,176,0.3);
}

/* Score display */
.score-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: #0d1810;
  border: 1px solid #2a4a35;
  border-radius: 10px;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.score-bar .label { color: var(--cream-dim); }
.score-bar .val { color: var(--brass-bright); font-weight: 500; }

/* Education content */
.edu {
  background: linear-gradient(180deg, rgba(16,28,19,0.95) 0%, rgba(13,24,16,0.9) 100%);
  border: 1px solid #1f3f2d;
  border-radius: 12px;
  padding: 1.4rem 1.2rem;
  margin-bottom: 1.1rem;
  box-shadow: inset 0 0 0 1px rgba(79,255,176,0.05);
}

.edu h3 {
  font-family: 'Courier New', monospace;
  font-size: clamp(1rem, 2.4vw, 1.35rem);
  font-style: normal;
  color: var(--brass-bright);
  margin-bottom: 1rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.edu h4 {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: var(--ivory);
  margin: 1.1rem 0 0.55rem;
  font-weight: 900;
  font-style: normal;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.edu p {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--cream);
  margin-bottom: 0.8rem;
}

.edu ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 1rem;
}

.edu li {
  padding: 0.42rem 0 0.42rem 1.3rem;
  position: relative;
  line-height: 1.6;
  color: var(--cream);
  border-bottom: 1px solid rgba(79,255,176,0.09);
  font-size: 0.9rem;
}

.edu li:last-child { border-bottom: none; }

.edu li::before {
  content: '◆';
  position: absolute;
  left: 0;
  top: 0.5rem;
  color: var(--brass);
  font-size: 0.7rem;
}

.edu strong { color: var(--brass-bright); font-weight: 600; }

/* Position chart */
.pos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.pos-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--brass-dim);
  border-radius: 3px;
  padding: 1rem;
}

.pos-card .name {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  color: var(--brass-bright);
  font-style: italic;
  font-weight: 600;
}

.pos-card .abbr {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: var(--cream-dim);
  letter-spacing: 0.1em;
}

.pos-card .desc {
  font-size: 0.85rem;
  color: var(--cream);
  margin-top: 0.5rem;
  line-height: 1.5;
}

/* Range table */
.range-table {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 3px;
  margin: 1.5rem 0;
  background:
    radial-gradient(circle at 20% 10%, rgba(79,255,176,0.12) 0%, transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(79,255,176,0.08) 0%, transparent 36%),
    #07110c;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid #2b5d43;
  box-shadow:
    inset 0 0 0 1px rgba(79,255,176,0.12),
    0 10px 24px rgba(0,0,0,0.35);
  max-width: 700px;
}

.range-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-size: 0.58rem;
  font-weight: 700;
  border-radius: 5px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  color: #a3b9ae;
  text-shadow: 0 1px 0 rgba(0,0,0,0.3);
}

.range-cell.premium {
  background: linear-gradient(180deg, #74ffd1 0%, #3adf9f 100%);
  border-color: #7fffc9;
  color: #041009;
}
.range-cell.strong {
  background: linear-gradient(180deg, #48d89b 0%, #1ea06c 100%);
  border-color: #5df1b3;
  color: #041009;
}
.range-cell.playable {
  background: linear-gradient(180deg, #2f8f66 0%, #22684b 100%);
  border-color: #3ca97a;
  color: #d7eee3;
}
.range-cell.marginal {
  background: linear-gradient(180deg, #1d4a36 0%, #153729 100%);
  border-color: #2d7051;
  color: #9ec0af;
}
.range-cell.fold {
  background: linear-gradient(180deg, #101917 0%, #0b1210 100%);
  border-color: #1b2b25;
  color: #5e746a;
}

.range-legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.range-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-swatch {
  width: 12px;
  height: 12px;
  border-radius: 1px;
}

/* Pot/board for postflop */
.board-display {
  background: 
    radial-gradient(ellipse at center, var(--felt-light) 0%, var(--felt-deep) 100%);
  border: 1px solid #2a4a35;
  border-radius: 12px;
  padding: 1.2rem 1rem;
  margin: 1.5rem 0;
  position: relative;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
}

.board-display::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(79,255,176,0.3);
  border-radius: 8px;
  pointer-events: none;
}

.board-label {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: var(--brass);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.pot-info {
  display: flex;
  justify-content: space-around;
  padding: 1rem 0;
  border-top: 1px solid rgba(79,255,176,0.2);
  margin-top: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.pot-info .label { color: var(--cream-dim); }
.pot-info .val { color: var(--brass-bright); font-weight: 600; margin-left: 0.5rem; }

/* Bankroll calculator */
.calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.calc-input-wrap {
  background: #0d1810;
  border: 1px solid #2a4a35;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.calc-label {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--brass);
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.4rem;
}

.calc-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(79,255,176,0.3);
  color: var(--ivory);
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  font-weight: 600;
  width: 100%;
  padding: 0.25rem 0;
  outline: none;
}

.calc-input:focus { border-bottom-color: var(--brass-bright); }

.calc-result {
  background: linear-gradient(180deg, rgba(16,28,19,0.98) 0%, rgba(13,24,16,0.95) 100%);
  border: 1px solid #2a4a35;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1.5rem;
}

.calc-result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(79,255,176,0.1);
}

.calc-result-row:last-child { border-bottom: none; }

.calc-result-label {
  font-family: 'Courier New', monospace;
  font-style: normal;
  color: var(--cream);
  font-size: 0.9rem;
}

.calc-result-val {
  font-family: 'Courier New', monospace;
  color: var(--brass-bright);
  font-size: 1.05rem;
  font-weight: 900;
}

.flag {
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  padding: 3px 8px;
  border-radius: 2px;
  text-transform: uppercase;
  margin-left: 0.5rem;
}
.flag.good { background: rgba(76,130,86,0.3); color: #b8e0bf; border: 1px solid #4c8256; }
.flag.warn { background: rgba(79,255,176,0.2); color: var(--brass-bright); border: 1px solid var(--brass-dim); }
.flag.bad { background: rgba(139,47,60,0.3); color: #e8b8c0; border: 1px solid var(--burgundy); }

/* Footer */
.footer {
  text-align: center;
  padding: 1.35rem 1rem;
  border-top: 1px solid rgba(79,255,176,0.15);
  margin-top: 3rem;
  font-family: 'Courier New', monospace;
  font-style: normal;
  color: var(--cream-dim);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.footer .ornament {
  color: var(--brass);
  margin: 0 0.75rem;
}

/* Sub-mode toggle inside practice */
.submode-toggle {
  display: inline-flex;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(79,255,176,0.25);
  border-radius: 2px;
  padding: 3px;
  margin: 0 auto 1.25rem;
  font-family: 'Courier New', monospace;
}

.submode-toggle-wrap {
  display: flex;
  justify-content: center;
}

.submode-btn {
  background: none;
  border: none;
  color: var(--cream-dim);
  padding: 0.45rem 1.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.submode-btn.active {
  background: #163526;
  color: var(--brass-bright);
  border: 1px solid rgba(79,255,176,0.5);
}

/* Showdown layout */
.showdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
}

.showdown-hand {
  background: #0d1810;
  border: 1px solid #2a4a35;
  border-radius: 10px;
  padding: 1.25rem 1rem;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.showdown-hand:hover:not(.disabled) {
  background: rgba(79,255,176,0.08);
  border-color: var(--brass);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.showdown-hand.disabled { cursor: default; }

.showdown-hand.winner {
  background: rgba(45,138,79,0.2);
  border-color: #2d8a4f;
  box-shadow: 0 0 0 1px rgba(45,138,79,0.4), 0 4px 16px rgba(45,138,79,0.2);
}

.showdown-hand.loser {
  background: rgba(107,30,44,0.15);
  border-color: var(--burgundy);
  opacity: 0.7;
}

.showdown-label {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: var(--brass);
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0.5rem;
}

.showdown-cards {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.showdown-eval {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-style: italic;
  font-size: 0.85rem;
  color: var(--cream-dim);
  min-height: 1.2em;
  line-height: 1.4;
}

.showdown-hand.winner .showdown-eval {
  color: #b8e0bf;
  font-weight: 600;
}

.showdown-vs {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-style: italic;
  font-size: 1rem;
  color: var(--brass);
  margin: 0.25rem 0 1rem;
  letter-spacing: 0.2em;
}

@media (max-width: 600px) {
  .showdown { grid-template-columns: 1fr; }
  .quick-start { font-size: 0.72rem; }
  .section-title { font-size: 1.7rem; }
}

@media (max-width: 700px) {
  .section { padding: 2rem 1rem; }
  .practice-panel { padding: 1.5rem; }
  .edu { padding: 1.5rem; }
  .nav-item { padding: 0.5rem 0.75rem 0.75rem; font-size: 0.95rem; }
  .nav-num { display: none; }
  .pot-info { flex-direction: column; gap: 0.5rem; align-items: center; }
  .range-table { gap: 1px; padding: 2px; }
  .range-cell { font-size: 0.5rem; }
}
`;

// ============= DATA =============

const HAND_RANKINGS = [
  { rank: 1, name: "Royal Flush", desc: "A, K, Q, J, 10 — all the same suit. The unbeatable hand.", cards: [["A","♠"],["K","♠"],["Q","♠"],["J","♠"],["10","♠"]] },
  { rank: 2, name: "Straight Flush", desc: "Five consecutive cards of the same suit.", cards: [["9","♥"],["8","♥"],["7","♥"],["6","♥"],["5","♥"]] },
  { rank: 3, name: "Four of a Kind", desc: "Four cards of the same rank, plus any fifth card.", cards: [["Q","♠"],["Q","♥"],["Q","♦"],["Q","♣"],["7","♠"]] },
  { rank: 4, name: "Full House", desc: "Three of a kind plus a pair. Ranked by the trips.", cards: [["J","♠"],["J","♥"],["J","♦"],["4","♣"],["4","♠"]] },
  { rank: 5, name: "Flush", desc: "Five cards of the same suit, not in sequence.", cards: [["A","♦"],["J","♦"],["8","♦"],["6","♦"],["3","♦"]] },
  { rank: 6, name: "Straight", desc: "Five consecutive cards of mixed suits. Ace plays high or low.", cards: [["10","♠"],["9","♥"],["8","♦"],["7","♣"],["6","♠"]] },
  { rank: 7, name: "Three of a Kind", desc: "Three cards of matching rank. Often called 'trips' or a 'set.'", cards: [["8","♠"],["8","♥"],["8","♦"],["K","♣"],["3","♠"]] },
  { rank: 8, name: "Two Pair", desc: "Two pairs of different ranks. Ranked by the higher pair.", cards: [["A","♠"],["A","♥"],["7","♦"],["7","♣"],["2","♠"]] },
  { rank: 9, name: "One Pair", desc: "Two cards of the same rank. The kicker often decides ties.", cards: [["10","♠"],["10","♥"],["K","♦"],["6","♣"],["3","♠"]] },
  { rank: 10, name: "High Card", desc: "When nothing else lands, the highest card plays.", cards: [["A","♠"],["J","♥"],["8","♦"],["6","♣"],["3","♥"]] },
];

const POSITIONS = [
  { name: "Under the Gun", abbr: "UTG", desc: "First to act preflop. Tightest range — you have 8 players left to act behind you." },
  { name: "Middle Position", abbr: "MP", desc: "A few seats off UTG. Open up slightly: strong broadways and pocket pairs." },
  { name: "Hijack", abbr: "HJ", desc: "Two off the button. Wider opening range; you start to apply real positional pressure." },
  { name: "Cutoff", abbr: "CO", desc: "One off the button. Aggressive open range — many suited connectors and broadways." },
  { name: "Button", abbr: "BTN", desc: "Best seat at the table. Last to act every street post-flop. Widest stealing range." },
  { name: "Small Blind", abbr: "SB", desc: "Forced bet, worst post-flop position. Play tight; 3-bet or fold against opens." },
  { name: "Big Blind", abbr: "BB", desc: "Already invested. Defend wide vs late opens, but you'll be out of position post-flop." },
];

// 13x13 hand chart classification (suited/offsuit/pair)
const RANKS_HI_LO = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];

function classifyHand(r1, r2, suited) {
  // Premium: AA, KK, QQ, JJ, AKs, AKo
  // Strong: TT-77, AQs, AJs, ATs, KQs, KJs, AQo, AJo
  // Playable: 66-22, suited connectors, suited aces, broadways
  // Marginal: speculative hands worth a peek from late position
  // Fold: trash
  const pair = r1 === r2;
  const i1 = RANKS_HI_LO.indexOf(r1);
  const i2 = RANKS_HI_LO.indexOf(r2);
  const hi = Math.min(i1,i2), lo = Math.max(i1,i2);
  if (pair) {
    if (i1 <= 3) return "premium"; // JJ+
    if (i1 <= 6) return "strong"; // TT-77
    if (i1 <= 9) return "playable"; // 66-44
    return "playable"; // 33, 22 still set-mining hands
  }
  // AKs, AKo are premium
  if (hi === 0 && lo === 1) return "premium";
  if (suited) {
    if (hi === 0 && lo <= 4) return "strong"; // AQs-ATs
    if (hi === 0 && lo <= 8) return "playable"; // A9s-A5s
    if (hi === 0) return "marginal"; // A4s-A2s (wheel-y)
    if (hi === 1 && lo <= 3) return "strong"; // KQs, KJs
    if (hi === 1 && lo <= 6) return "playable"; // KTs-K7s
    if (hi === 1) return "marginal";
    if (hi === 2 && lo <= 4) return "playable"; // QJs, QTs
    if (hi === 2 && lo <= 6) return "marginal";
    if (hi === 3 && lo <= 5) return "playable"; // JTs, J9s
    if (hi === 3) return "marginal";
    if (lo - hi === 1 && hi <= 7) return "playable"; // suited connectors T9-65
    if (lo - hi <= 2 && hi <= 6) return "marginal"; // suited gappers
    return "fold";
  } else {
    if (hi === 0 && lo <= 3) return "strong"; // AQo, AJo
    if (hi === 0 && lo <= 5) return "playable"; // ATo, A9o
    if (hi === 0 && lo <= 9) return "marginal"; // A8o-A5o
    if (hi === 0) return "fold";
    if (hi === 1 && lo <= 2) return "playable"; // KQo, KJo
    if (hi === 1 && lo <= 4) return "marginal"; // KTo, K9o
    if (hi === 1) return "fold";
    if (hi === 2 && lo === 3) return "playable"; // QJo
    if (hi === 2 && lo <= 5) return "marginal"; // QTo, Q9o
    if (hi === 2) return "fold";
    if (hi === 3 && lo === 4) return "marginal"; // JTo
    return "fold";
  }
}

// ============= HELPERS =============

function randomInt(max) {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] % max;
}

function nextDistinctIndex(length, prevIndex) {
  if (length <= 1) return 0;
  let n = randomInt(length);
  while (n === prevIndex) n = randomInt(length);
  return n;
}

function getScenario(list, idx) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const safeIdx = Number.isInteger(idx) ? idx : 0;
  return list[Math.abs(safeIdx) % list.length];
}

const RANK_TO_VALUE = {
  A: 14, K: 13, Q: 12, J: 11, "10": 10, T: 10,
  "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2,
};

const VALUE_TO_RANK = {
  14: "A", 13: "K", 12: "Q", 11: "J", 10: "10",
  9: "9", 8: "8", 7: "7", 6: "6", 5: "5", 4: "4", 3: "3", 2: "2",
};

function compareScore(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function evaluate5(cards5) {
  const vals = cards5.map((c) => RANK_TO_VALUE[c[0]]).sort((a, b) => b - a);
  const suits = cards5.map((c) => c[1]);

  const counts = {};
  for (const v of vals) counts[v] = (counts[v] || 0) + 1;
  const entries = Object.entries(counts)
    .map(([v, c]) => [Number(v), c])
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  const isFlush = suits.every((s) => s === suits[0]);
  const uniqueVals = [...new Set(vals)].sort((a, b) => b - a);
  let straightHigh = 0;
  if (uniqueVals.length === 5) {
    if (uniqueVals[0] - uniqueVals[4] === 4) straightHigh = uniqueVals[0];
    else if (
      uniqueVals[0] === 14 &&
      uniqueVals[1] === 5 &&
      uniqueVals[2] === 4 &&
      uniqueVals[3] === 3 &&
      uniqueVals[4] === 2
    ) {
      straightHigh = 5;
    }
  }

  if (isFlush && straightHigh) {
    if (straightHigh === 14) return { label: "Royal Flush", score: [9, 14] };
    return { label: `Straight Flush, ${VALUE_TO_RANK[straightHigh]}-high`, score: [8, straightHigh] };
  }
  if (entries[0][1] === 4) {
    return { label: `Four of a Kind, ${VALUE_TO_RANK[entries[0][0]]}s`, score: [7, entries[0][0], entries[1][0]] };
  }
  if (entries[0][1] === 3 && entries[1] && entries[1][1] >= 2) {
    return {
      label: `Full House, ${VALUE_TO_RANK[entries[0][0]]}s full of ${VALUE_TO_RANK[entries[1][0]]}s`,
      score: [6, entries[0][0], entries[1][0]],
    };
  }
  if (isFlush) return { label: `Flush, ${VALUE_TO_RANK[vals[0]]}-high`, score: [5, ...vals] };
  if (straightHigh) return { label: `Straight, ${VALUE_TO_RANK[straightHigh]}-high`, score: [4, straightHigh] };
  if (entries[0][1] === 3) {
    return { label: `Three of a Kind, ${VALUE_TO_RANK[entries[0][0]]}s`, score: [3, entries[0][0], entries[1][0], entries[2][0]] };
  }
  if (entries[0][1] === 2 && entries[1] && entries[1][1] === 2) {
    return {
      label: `Two Pair, ${VALUE_TO_RANK[entries[0][0]]}s and ${VALUE_TO_RANK[entries[1][0]]}s`,
      score: [2, entries[0][0], entries[1][0], entries[2][0]],
    };
  }
  if (entries[0][1] === 2) {
    return {
      label: `Pair of ${VALUE_TO_RANK[entries[0][0]]}s`,
      score: [1, entries[0][0], entries[1][0], entries[2][0], entries[3][0]],
    };
  }
  return { label: `${VALUE_TO_RANK[vals[0]]} High`, score: [0, ...vals] };
}

function evaluate7(cards7) {
  const combos = [];
  const n = cards7.length;
  for (let a = 0; a < n - 4; a += 1) {
    for (let b = a + 1; b < n - 3; b += 1) {
      for (let c = b + 1; c < n - 2; c += 1) {
        for (let d = c + 1; d < n - 1; d += 1) {
          for (let f = d + 1; f < n; f += 1) {
            combos.push([cards7[a], cards7[b], cards7[c], cards7[d], cards7[f]]);
          }
        }
      }
    }
  }

  let best = null;
  for (const combo of combos) {
    const ev = evaluate5(combo);
    if (!best || compareScore(ev.score, best.score) > 0) best = ev;
  }
  return best;
}

function getShowdownResult(scenario) {
  const board = [...scenario.flop, scenario.turn, scenario.river];
  const handAEval = evaluate7([...scenario.handA, ...board]);
  const handBEval = evaluate7([...scenario.handB, ...board]);
  const cmp = compareScore(handAEval.score, handBEval.score);
  const answer = cmp > 0 ? "A" : cmp < 0 ? "B" : "TIE";

  return { board, handAEval, handBEval, answer };
}

function CardEl({ rank, suit, size = "" }) {
  const isRed = suit === "♥" || suit === "♦";
  return e("div", { className: `card ${size} ${isRed ? "red" : "black"}` },
    e("div", { className: "card-corner top" },
      e("div", { className: "card-rank" }, rank),
      e("div", { className: "card-suit" }, suit),
    ),
    e("div", { className: "card-center-suit" }, suit),
    e("div", { className: "card-corner bottom" },
      e("div", { className: "card-rank" }, rank),
      e("div", { className: "card-suit" }, suit),
    ),
  );
}

function CardRow({ cards, size = "" }) {
  return e("div", { className: "hand-cards" },
    cards.map((c, i) => e(CardEl, { key: i, rank: c[0], suit: c[1], size }))
  );
}

// ============= HAND RANKINGS SECTION =============

// Showdown scenarios with full 5-card board
// Winner & per-hand evaluation are computed by the evaluator — these only carry teaching notes
function HandRankings() {
  return e("div", null,
    e("div", { className: "edu" },
      e("h3", null, "Reading the Hand Hierarchy"),
      e("p", null, "Every Texas Hold'em hand uses the best five cards available from your two hole cards plus the five community cards. Hands are ranked from strongest (Royal Flush) to weakest (High Card). When two players have the same hand, kickers — the next-best cards — break the tie."),
      e("h4", null, "Three Things to Internalize"),
      e("ul", null,
        e("li", null, e("strong", null, "Suit doesn't break ties. "), "If two players both flush, the highest card in the flush wins. Spades aren't worth more than hearts."),
        e("li", null, e("strong", null, "Aces play high or low in straights. "), "A-2-3-4-5 (the 'wheel') and 10-J-Q-K-A (Broadway) are both valid. But A-2-3 isn't part of a wraparound straight — Q-K-A-2-3 doesn't count."),
        e("li", null, e("strong", null, "You play your best five. "), "If the board is A-K-Q-J-10 of clubs, anyone who hasn't been holding two clubs plays the board for a straight. Skill is recognizing which five cards win."),
      ),
    ),
    HAND_RANKINGS.map(h => e("div", { key: h.rank, className: "hand-row" },
      e("div", { className: "hand-rank-num" }, h.rank),
      e("div", null,
        e("div", { className: "hand-name" }, h.name),
        e("div", { className: "hand-desc" }, h.desc),
      ),
      e(CardRow, { cards: h.cards, size: "sm" }),
    )),
  );
}

function HandRankingsPractice() {
  const [submode, setSubmode] = useState("identify");
  const [idx, setIdx] = useState(() => randomInt(HAND_QUIZ.length));
  const [sIdx, setSIdx] = useState(() => randomInt(WINNING_HAND_QUIZ.length));
  const [picked, setPicked] = useState(null);
  const [sPicked, setSPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [sScore, setSScore] = useState({ right: 0, total: 0 });

  const q = getScenario(HAND_QUIZ, idx);
  const sq = getScenario(WINNING_HAND_QUIZ, sIdx);
  const showdown = sq ? getShowdownResult(sq) : null;

  const switchMode = (m) => {
    setSubmode(m);
    setPicked(null);
    setSPicked(null);
  };

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    setScore(s => ({ right: s.right + (opt === q.answer ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setIdx(nextDistinctIndex(HAND_QUIZ.length, idx));
    setPicked(null);
  };

  const sPick = (which) => {
    if (sPicked) return;
    setSPicked(which);
    setSScore(s => ({ right: s.right + (which === showdown.answer ? 1 : 0), total: s.total + 1 }));
  };

  const sNext = () => {
    setSIdx(nextDistinctIndex(WINNING_HAND_QUIZ.length, sIdx));
    setSPicked(null);
  };

  if (!q || !sq || !showdown) {
    return e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, "No hand-ranking scenarios configured."),
    );
  }

  const activeScore = submode === "identify" ? score : sScore;

  return e("div", null,
    e("div", { className: "submode-toggle-wrap" },
      e("div", { className: "submode-toggle" },
        e("button", {
          className: `submode-btn ${submode === "identify" ? "active" : ""}`,
          onClick: () => switchMode("identify"),
        }, "Identify"),
        e("button", {
          className: `submode-btn ${submode === "showdown" ? "active" : ""}`,
          onClick: () => switchMode("showdown"),
        }, "Showdown"),
      ),
    ),

    e("div", { className: "score-bar" },
      e("span", null, e("span", { className: "label" }, "Correct: "), e("span", { className: "val" }, `${activeScore.right} / ${activeScore.total}`)),
      e("span", null, e("span", { className: "label" }, "Accuracy: "), e("span", { className: "val" }, activeScore.total ? `${Math.round(activeScore.right/activeScore.total*100)}%` : "—")),
    ),

    submode === "identify" && e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, "Name the best hand from these five cards"),
      e("div", { className: "cards-display" },
        q.cards.map((c, i) => e(CardEl, { key: `${idx}-${i}`, rank: c[0], suit: c[1], size: "lg" }))
      ),
      e("div", { className: "choices" },
        q.options.map(opt => {
          let cls = "choice-btn";
          if (picked) {
            if (opt === q.answer) cls += " correct";
            else if (opt === picked) cls += " incorrect";
          }
          return e("button", {
            key: opt, className: cls, onClick: () => pick(opt), disabled: !!picked
          }, opt);
        })
      ),
      picked && e("div", { className: `feedback ${picked === q.answer ? "correct" : "incorrect"}` },
        e("strong", null, picked === q.answer ? "Correct" : `The answer is ${q.answer}`),
        q.explain,
      ),
      picked && e("button", { className: "next-btn", onClick: next }, "Next Hand →"),
    ),

    submode === "showdown" && e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, "Which hand wins at showdown?"),

      e("div", { className: "board-display" },
        e("div", { className: "board-label" }, "Community Cards"),
        e("div", { className: "cards-display" },
          showdown.board.map((c, i) => e(CardEl, { key: `b-${sIdx}-${i}`, rank: c[0], suit: c[1], size: "lg" }))
        ),
      ),

      e("div", { className: "showdown-vs" }, "— show your hand —"),

      e("div", { className: "showdown" },
        // Hand A
        e("div", {
          className: `showdown-hand ${sPicked ? "disabled" : ""} ${sPicked && showdown.answer === "A" ? "winner" : ""} ${sPicked && showdown.answer === "B" ? "loser" : ""}`,
          onClick: () => sPick("A"),
        },
          e("div", { className: "showdown-label" }, "Hand A"),
          e("div", { className: "showdown-cards" },
            sq.handA.map((c, i) => e(CardEl, { key: `A-${sIdx}-${i}`, rank: c[0], suit: c[1] }))
          ),
          e("div", { className: "showdown-eval" }, sPicked ? showdown.handAEval.label : ""),
        ),
        // Hand B
        e("div", {
          className: `showdown-hand ${sPicked ? "disabled" : ""} ${sPicked && showdown.answer === "B" ? "winner" : ""} ${sPicked && showdown.answer === "A" ? "loser" : ""}`,
          onClick: () => sPick("B"),
        },
          e("div", { className: "showdown-label" }, "Hand B"),
          e("div", { className: "showdown-cards" },
            sq.handB.map((c, i) => e(CardEl, { key: `B-${sIdx}-${i}`, rank: c[0], suit: c[1] }))
          ),
          e("div", { className: "showdown-eval" }, sPicked ? showdown.handBEval.label : ""),
        ),
      ),

      e("div", { className: "choices", style: { gridTemplateColumns: "repeat(3, 1fr)", maxWidth: "520px", marginTop: "0.5rem" } },
        ["A", "TIE", "B"].map((opt) => {
          let cls = "choice-btn";
          if (sPicked) {
            if (opt === showdown.answer) cls += " correct";
            else if (opt === sPicked) cls += " incorrect";
          }
          return e("button", {
            key: opt,
            className: cls,
            onClick: () => sPick(opt),
            disabled: !!sPicked,
          }, opt === "TIE" ? "Chop / Tie" : `Hand ${opt}`);
        }),
      ),

      sPicked && e("div", { className: `feedback ${sPicked === showdown.answer ? "correct" : "incorrect"}` },
        e("strong", null,
          sPicked === showdown.answer
            ? (showdown.answer === "TIE" ? "Correct — It's a chop" : `Correct — Hand ${showdown.answer} wins`)
            : (showdown.answer === "TIE" ? "Correct result: Chop / Tie" : `Hand ${showdown.answer} wins`)
        ),
        sq.explain,
      ),
      sPicked && e("button", { className: "next-btn", onClick: sNext }, "Next Showdown →"),
    ),
  );
}

// ============= PREFLOP SECTION =============

function getPosName(abbr) {
  return POSITIONS.find(p => p.abbr === abbr)?.name || abbr;
}

function Preflop() {
  // Build 13x13 chart
  const grid = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const r1 = RANKS_HI_LO[i], r2 = RANKS_HI_LO[j];
      let label, cls;
      if (i === j) {
        label = r1 + r2; cls = classifyHand(r1, r2, false);
      } else if (i < j) {
        label = r1 + r2 + "s"; cls = classifyHand(r1, r2, true);
      } else {
        label = r2 + r1 + "o"; cls = classifyHand(r2, r1, false);
      }
      grid.push(e("div", { key: `${i}-${j}`, className: `range-cell ${cls}` }, label));
    }
  }

  return e("div", null,
    e("div", { className: "edu" },
      e("h3", null, "Position is Power"),
      e("p", null, "Where you sit at the table changes the math of every decision. Acting last lets you see what others do before committing chips. Acting first means flying blind. Tight from early position; aggressive from late position. This single concept separates winning players from losers."),
      e("div", { className: "pos-grid" },
        POSITIONS.map(p => e("div", { key: p.abbr, className: "pos-card" },
          e("div", { className: "abbr" }, p.abbr),
          e("div", { className: "name" }, p.name),
          e("div", { className: "desc" }, p.desc),
        ))
      ),
      e("h4", null, "Starting Hand Chart (9-handed)"),
      e("p", null, "Color-coded view of all 169 starting hand combinations. The diagonal is pocket pairs. Above the diagonal is suited; below is offsuit. Tighten this map from early position; loosen from the button."),
      e("div", { className: "range-table" }, grid),
      e("div", { className: "range-legend" },
        e("div", { className: "range-legend-item" }, e("span", { className: "range-swatch", style: { background: "linear-gradient(180deg, #74ffd1 0%, #3adf9f 100%)", border: "1px solid #7fffc9" } }), "Premium"),
        e("div", { className: "range-legend-item" }, e("span", { className: "range-swatch", style: { background: "linear-gradient(180deg, #48d89b 0%, #1ea06c 100%)", border: "1px solid #5df1b3" } }), "Strong"),
        e("div", { className: "range-legend-item" }, e("span", { className: "range-swatch", style: { background: "linear-gradient(180deg, #2f8f66 0%, #22684b 100%)", border: "1px solid #3ca97a" } }), "Playable"),
        e("div", { className: "range-legend-item" }, e("span", { className: "range-swatch", style: { background: "linear-gradient(180deg, #1d4a36 0%, #153729 100%)", border: "1px solid #2d7051" } }), "Marginal"),
        e("div", { className: "range-legend-item" }, e("span", { className: "range-swatch", style: { background: "linear-gradient(180deg, #101917 0%, #0b1210 100%)", border: "1px solid #1b2b25" } }), "Fold"),
      ),
      e("h4", null, "Open-Raise Sizing"),
      e("ul", null,
        e("li", null, e("strong", null, "Live games: "), "3-4x the big blind, plus one BB per limper."),
        e("li", null, e("strong", null, "Online cash: "), "2.5-3x is standard."),
        e("li", null, e("strong", null, "Stack matters: "), "Below 40 big blinds, smaller raises preserve fold equity for shoves later."),
      ),
      e("h4", null, "The 3-Bet Decision"),
      e("p", null, "When someone has already raised, your two real options are 3-bet or fold. Calling (\"flatting\") is rarely correct from out of position. A 3-bet does three jobs: it builds the pot with strong hands, denies equity to drawing hands, and wins the pot uncontested when everyone folds."),

      e("h4", null, "Preflop Decision Ladder"),
      e("ul", null,
        e("li", null, e("strong", null, "Step 1: Position first. "), "Tight ranges UTG/MP, wide ranges CO/BTN."),
        e("li", null, e("strong", null, "Step 2: Spot type. "), "Unopened pot, facing open, facing 3-bet, or blind defense each need different ranges."),
        e("li", null, e("strong", null, "Step 3: Stack depth. "), "100bb favors speculative hands; 30bb shifts toward high-card strength and jam/fold lines."),
        e("li", null, e("strong", null, "Step 4: Opponent tendency. "), "Versus nits tighten value; versus loose-passive players isolate wider."),
      ),

      e("h4", null, "Common Preflop Leaks"),
      e("ul", null,
        e("li", null, e("strong", null, "Over-calling from blinds: "), "Defending too many offsuit hands out of position creates reverse implied odds."),
        e("li", null, e("strong", null, "Flatting premium hands: "), "Failing to 3-bet AA/KK/AK leaves EV on the table and invites multi-way pots."),
        e("li", null, e("strong", null, "Ignoring rake at low stakes: "), "Marginal calls become losing calls quickly in high-rake games."),
        e("li", null, e("strong", null, "No plan vs 3-bets: "), "Open with hands you can continue or comfortably fold; avoid auto-punt opens."),
      ),
    ),
  );
}

function PreflopPractice() {
  const [idx, setIdx] = useState(() => randomInt(PREFLOP_QUIZ.length));
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const q = getScenario(PREFLOP_QUIZ, idx);

  if (!q) {
    return e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, "No preflop scenarios configured."),
    );
  }

  const promptText = q.prompt || `You are in ${getPosName(q.pos)} (${q.pos}). What is the best preflop action in this spot?`;
  const choiceColumns = Math.min(4, q.options.length);

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    setScore(s => ({ right: s.right + (opt === q.answer ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setIdx(nextDistinctIndex(PREFLOP_QUIZ.length, idx));
    setPicked(null);
  };

  return e("div", null,
    e("div", { className: "score-bar" },
      e("span", null, e("span", { className: "label" }, "Correct: "), e("span", { className: "val" }, `${score.right} / ${score.total}`)),
      e("span", null, e("span", { className: "label" }, "Accuracy: "), e("span", { className: "val" }, score.total ? `${Math.round(score.right/score.total*100)}%` : "—")),
    ),
    e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, promptText),
      e("div", { className: "cards-display" },
        q.cards.map((c, i) => e(CardEl, { key: `${idx}-${i}`, rank: c[0], suit: c[1], size: "lg" }))
      ),
      e("div", { className: "choices", style: { gridTemplateColumns: `repeat(${choiceColumns}, 1fr)`, maxWidth: "680px" } },
        q.options.map(opt => {
          let cls = "choice-btn";
          if (picked) {
            if (opt === q.answer) cls += " correct";
            else if (opt === picked) cls += " incorrect";
          }
          return e("button", {
            key: opt, className: cls, onClick: () => pick(opt), disabled: !!picked
          }, opt);
        })
      ),
      picked && e("div", { className: `feedback ${picked === q.answer ? "correct" : "incorrect"}` },
        e("strong", null, picked === q.answer ? "Correct" : `Better play: ${q.answer}`),
        q.explain,
      ),
      picked && e("button", { className: "next-btn", onClick: next }, "Next Hand →"),
    ),
  );
}

// ============= POSTFLOP SECTION =============

function Postflop() {
  return e("div", null,
    e("div", { className: "edu" },
      e("h3", null, "After the Flop, the Real Game Begins"),
      e("p", null, "Preflop is largely solved by charts. Postflop is where edge lives. Three concepts dominate: counting outs, calculating pot odds, and reading board texture. Master these and you'll outplay 90% of the field."),
      
      e("h4", null, "The Rule of 4 and 2"),
      e("p", null, "After the flop, multiply your outs by 4 to estimate your chance of hitting by the river. After the turn, multiply by 2 for hitting on the river only. Quick example: open-ended straight draw = 8 outs × 4 ≈ 32% equity to hit by the river."),
      
      e("h4", null, "Pot Odds"),
      e("p", null, "If the pot is $80 and someone bets $20, you need to call $20 to win $100 — that's 5-to-1 (or about 17%). If your hand has more than 17% equity, calling is correct in a vacuum. Always compare your equity to your pot odds."),
      
      e("h4", null, "Common Out Counts"),
      e("ul", null,
        e("li", null, e("strong", null, "Flush draw: "), "9 outs (~36% by river)."),
        e("li", null, e("strong", null, "Open-ended straight: "), "8 outs (~32%)."),
        e("li", null, e("strong", null, "Gutshot straight: "), "4 outs (~17%)."),
        e("li", null, e("strong", null, "Two overcards: "), "6 outs (~24%) — but be cautious; opponents often have you dominated."),
        e("li", null, e("strong", null, "Flush + straight draw (combo): "), "15 outs (~54%) — a huge hand."),
      ),

      e("h4", null, "Reading Board Texture"),
      e("ul", null,
        e("li", null, e("strong", null, "Dry: "), "K-7-2 rainbow. Few draws possible. Top pair is golden. C-bet small."),
        e("li", null, e("strong", null, "Wet: "), "9♥-8♥-7♣. Straights, flush draws, two pair everywhere. Slow down with one-pair hands."),
        e("li", null, e("strong", null, "Paired: "), "K-K-4. Trips and full houses are possible — proceed carefully unless you have one of them."),
        e("li", null, e("strong", null, "Monotone: "), "All same suit. Anyone with one card of that suit has a flush draw or made flush."),
      ),

      e("h4", null, "The Continuation Bet"),
      e("p", null, "When you raise preflop and get called, betting the flop (a 'c-bet') is standard with most of your range — but not all. C-bet more on dry boards that favor your range. Check more on coordinated boards that favor the caller's range. A reflexive c-bet bleeds money."),

      e("h4", null, "Turn and River Planning"),
      e("ul", null,
        e("li", null, e("strong", null, "Turn discipline: "), "The turn is where ranges narrow. Keep barreling only when your value and bluffs make sense together."),
        e("li", null, e("strong", null, "River honesty: "), "Most population pools under-bluff rivers. Big river bets are value-heavy until proven otherwise."),
        e("li", null, e("strong", null, "Blockers matter: "), "Holding key cards (like the ace of a flush suit) changes bluff-catching and bluffing frequencies."),
        e("li", null, e("strong", null, "Plan your line early: "), "Know your turn cards before betting flop so you avoid random, contradictory actions."),
      ),

      e("h4", null, "Postflop Review Checklist"),
      e("ul", null,
        e("li", null, "Did my flop size match board texture?"),
        e("li", null, "Was my turn bet credible based on preflop ranges?"),
        e("li", null, "Did I call river with enough bluff-catchers and block the right value hands?"),
        e("li", null, "If I bluffed, what better hands did I make fold?"),
      ),
    ),
  );
}

function PostflopPractice() {
  const [idx, setIdx] = useState(() => randomInt(POSTFLOP_QUIZ.length));
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const q = getScenario(POSTFLOP_QUIZ, idx);

  if (!q) {
    return e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, "No postflop scenarios configured."),
    );
  }

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    setScore(s => ({ right: s.right + (opt === q.answer ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setIdx(nextDistinctIndex(POSTFLOP_QUIZ.length, idx));
    setPicked(null);
  };

  return e("div", null,
    e("div", { className: "score-bar" },
      e("span", null, e("span", { className: "label" }, "Correct: "), e("span", { className: "val" }, `${score.right} / ${score.total}`)),
      e("span", null, e("span", { className: "label" }, "Accuracy: "), e("span", { className: "val" }, score.total ? `${Math.round(score.right/score.total*100)}%` : "—")),
    ),
    e("div", { className: "practice-panel" },
      e("div", { className: "practice-prompt" }, q.prompt),
      e("div", { style: { textAlign: "center", marginTop: "1rem" } },
        e("div", { style: { fontSize: "0.7rem", letterSpacing: "0.25em", color: "var(--brass)", fontFamily: "'Courier New', monospace", marginBottom: "0.5rem", textTransform: "uppercase" } }, "Your Hand"),
        e("div", { className: "cards-display" },
          q.hole.map((c, i) => e(CardEl, { key: `h-${idx}-${i}`, rank: c[0], suit: c[1], size: "lg" }))
        ),
      ),
      e("div", { className: "board-display" },
        e("div", { className: "board-label" }, "The Board"),
        e("div", { className: "cards-display" },
          q.board.map((c, i) => e(CardEl, { key: `b-${idx}-${i}`, rank: c[0], suit: c[1], size: "lg" }))
        ),
        e("div", { className: "pot-info" },
          e("div", null, e("span", { className: "label" }, "Pot"), e("span", { className: "val" }, `$${q.pot}`)),
          q.toCall > 0 && e("div", null, e("span", { className: "label" }, "To Call"), e("span", { className: "val" }, `$${q.toCall}`)),
          q.toCall > 0 && e("div", null, e("span", { className: "label" }, "Pot Odds"), e("span", { className: "val" }, `${(q.pot/q.toCall).toFixed(1)}:1`)),
        ),
      ),
      e("div", { className: "choices", style: { gridTemplateColumns: `repeat(${q.options.length}, 1fr)`, maxWidth: "560px" } },
        q.options.map(opt => {
          let cls = "choice-btn";
          if (picked) {
            if (opt === q.answer) cls += " correct";
            else if (opt === picked) cls += " incorrect";
          }
          return e("button", {
            key: opt, className: cls, onClick: () => pick(opt), disabled: !!picked
          }, opt);
        })
      ),
      picked && e("div", { className: `feedback ${picked === q.answer ? "correct" : "incorrect"}` },
        e("strong", null, picked === q.answer ? "Correct" : `Better play: ${q.answer}`),
        q.explain,
      ),
      picked && e("button", { className: "next-btn", onClick: next }, "Next Spot →"),
    ),
  );
}

// ============= BANKROLL SECTION =============

function Bankroll() {
  return e("div", null,
    e("div", { className: "edu" },
      e("h3", null, "The Math That Keeps You in the Game"),
      e("p", null, "Bankroll management is unsexy. It's also the single most important skill in poker. Variance is brutal: even winning players lose 15+ buy-ins in losing stretches. A bankroll exists for one reason — to survive the downswings long enough that your edge can show up."),
      
      e("h4", null, "Standard Bankroll Requirements"),
      e("ul", null,
        e("li", null, e("strong", null, "Cash games (live): "), "20-30 buy-ins minimum. A buy-in at $1/$2 is typically $200-300, so $4,000-$9,000."),
        e("li", null, e("strong", null, "Cash games (online): "), "30-50 buy-ins. Online play has higher variance — more hands, more aggressive opponents."),
        e("li", null, e("strong", null, "MTTs (tournaments): "), "100+ buy-ins. Tournaments are insanely high variance. Top pros run 200+ buy-ins for the games they play."),
        e("li", null, e("strong", null, "Sit & Go's: "), "50-100 buy-ins."),
      ),

      e("h4", null, "Stop-Loss and Tilt Discipline"),
      e("p", null, "Set a session stop-loss before you sit down: typically 2-3 buy-ins. When you hit it, you stand up. Tilt is the silent bankroll killer — losing turns into chasing, chasing turns into desperation, desperation evaporates a year of work in one bad night."),

      e("h4", null, "Moving Up and Down Stakes"),
      e("ul", null,
        e("li", null, e("strong", null, "Move up: "), "When you have the bankroll for the new stake AND you're confidently beating your current one over a meaningful sample (10,000+ hands)."),
        e("li", null, e("strong", null, "Move down: "), "Without ego — when your bankroll drops below the threshold for your current stake. Falling stakes is not failure; it's how you stay in the game."),
      ),

      e("h4", null, "Track Everything"),
      e("p", null, "Hours played, results, stakes, opponent quality. You can't manage what you don't measure. A simple spreadsheet beats a great memory every time."),
    ),
  );
}

function BankrollPractice() {
  const [bankroll, setBankroll] = useState(5000);
  const [stake, setStake] = useState(2); // big blind
  const [format, setFormat] = useState("cash-live");
  const [winrateBB, setWinrateBB] = useState(5); // bb/100

  const buyIn = stake * 100; // standard 100bb buy-in
  const buyIns = bankroll / buyIn;

  let recommendedBuyIns, label;
  if (format === "cash-live") { recommendedBuyIns = 25; label = "Live Cash"; }
  else if (format === "cash-online") { recommendedBuyIns = 40; label = "Online Cash"; }
  else if (format === "mtt") { recommendedBuyIns = 100; label = "MTTs"; }
  else { recommendedBuyIns = 75; label = "Sit & Go"; }

  let status, statusLabel;
  if (buyIns >= recommendedBuyIns) { status = "good"; statusLabel = "Sufficient"; }
  else if (buyIns >= recommendedBuyIns * 0.6) { status = "warn"; statusLabel = "Marginal"; }
  else { status = "bad"; statusLabel = "Underrolled"; }

  // Variance-adjusted expectations (cash games only really)
  const handsPerHour = format.includes("cash") ? (format === "cash-live" ? 30 : 80) : 0;
  const dollarPerHour = (winrateBB / 100) * stake * handsPerHour;
  const monthlyHours = 80;
  const monthlyExpected = dollarPerHour * monthlyHours;

  return e("div", null,
    e("div", { className: "edu" },
      e("h3", null, "Bankroll Calculator"),
      e("p", null, "Plug in your numbers. The calculator tells you whether your bankroll is large enough for the stakes you're playing, and what a reasonable expectation might look like."),
      
      e("div", { className: "calc-grid" },
        e("div", { className: "calc-input-wrap" },
          e("label", { className: "calc-label" }, "Bankroll ($)"),
          e("input", { className: "calc-input", type: "number", value: bankroll,
            onChange: ev => setBankroll(Math.max(0, Number(ev.target.value) || 0)) }),
        ),
        e("div", { className: "calc-input-wrap" },
          e("label", { className: "calc-label" }, "Big Blind ($)"),
          e("input", { className: "calc-input", type: "number", step: "0.25", value: stake,
            onChange: ev => setStake(Math.max(0.25, Number(ev.target.value) || 0.25)) }),
        ),
        e("div", { className: "calc-input-wrap" },
          e("label", { className: "calc-label" }, "Win-rate (bb/100)"),
          e("input", { className: "calc-input", type: "number", step: "0.5", value: winrateBB,
            onChange: ev => setWinrateBB(Number(ev.target.value) || 0) }),
        ),
        e("div", { className: "calc-input-wrap" },
          e("label", { className: "calc-label" }, "Format"),
          e("select", { className: "calc-input", value: format,
            onChange: ev => setFormat(ev.target.value),
            style: { background: "transparent", cursor: "pointer" }
          },
            e("option", { value: "cash-live", style: { background: "var(--felt-deep)" } }, "Live Cash"),
            e("option", { value: "cash-online", style: { background: "var(--felt-deep)" } }, "Online Cash"),
            e("option", { value: "mtt", style: { background: "var(--felt-deep)" } }, "MTT"),
            e("option", { value: "sng", style: { background: "var(--felt-deep)" } }, "Sit & Go"),
          ),
        ),
      ),

      e("div", { className: "calc-result" },
        e("div", { className: "calc-result-row" },
          e("span", { className: "calc-result-label" }, "Standard buy-in"),
          e("span", { className: "calc-result-val" }, `$${buyIn.toLocaleString()}`),
        ),
        e("div", { className: "calc-result-row" },
          e("span", { className: "calc-result-label" }, "Buy-ins you have"),
          e("span", { className: "calc-result-val" },
            buyIns.toFixed(1),
            e("span", { className: `flag ${status}` }, statusLabel),
          ),
        ),
        e("div", { className: "calc-result-row" },
          e("span", { className: "calc-result-label" }, `Recommended for ${label}`),
          e("span", { className: "calc-result-val" }, `${recommendedBuyIns} buy-ins`),
        ),
        e("div", { className: "calc-result-row" },
          e("span", { className: "calc-result-label" }, "Min bankroll for this stake"),
          e("span", { className: "calc-result-val" }, `$${(buyIn * recommendedBuyIns).toLocaleString()}`),
        ),
        format.includes("cash") && e("div", { className: "calc-result-row" },
          e("span", { className: "calc-result-label" }, "Est. earn rate"),
          e("span", { className: "calc-result-val" }, `$${dollarPerHour.toFixed(2)}/hr`),
        ),
        format.includes("cash") && e("div", { className: "calc-result-row" },
          e("span", { className: "calc-result-label" }, "Monthly expectation (80 hrs)"),
          e("span", { className: "calc-result-val" }, `$${monthlyExpected.toFixed(0)}`),
        ),
      ),
    ),

    e("div", { className: "edu" },
      e("h3", null, "How to Read These Numbers"),
      e("ul", null,
        e("li", null, e("strong", null, "Underrolled: "), "You don't have enough buy-ins to absorb normal variance. A 10-buy-in downswing — which happens to winning players — could wipe you out. Drop down."),
        e("li", null, e("strong", null, "Marginal: "), "You can play, but a single bad session puts you in the danger zone. Be selective; don't multi-table aggressively."),
        e("li", null, e("strong", null, "Sufficient: "), "Variance is no longer existential. You can focus on play, not survival."),
        e("li", null, e("strong", null, "Win-rate reality check: "), "5 bb/100 is a strong win-rate at small stakes. 2-3 bb/100 is realistic at higher stakes against tougher opposition. Anyone claiming 10+ bb/100 over a real sample is either very rare or lying."),
      ),
    ),
  );
}

// ============= APP =============

const SECTIONS = [
  { id: "rankings", num: "01", title: "Hand Rankings" },
  { id: "preflop", num: "02", title: "Preflop" },
  { id: "postflop", num: "03", title: "Postflop" },
  { id: "bankroll", num: "04", title: "Bankroll" },
];

function App() {
  const [section, setSection] = useState("rankings");
  const [mode, setMode] = useState("learn");

  const renderContent = () => {
    if (section === "rankings") return mode === "learn" ? e(HandRankings) : e(HandRankingsPractice);
    if (section === "preflop") return mode === "learn" ? e(Preflop) : e(PreflopPractice);
    if (section === "postflop") return mode === "learn" ? e(Postflop) : e(PostflopPractice);
    if (section === "bankroll") return mode === "learn" ? e(Bankroll) : e(BankrollPractice);
  };

  const sectionTitles = {
    rankings: { title: "Hand Rankings", desc: "Know every hand instantly so you can make fast, correct decisions under pressure." },
    preflop: { title: "Preflop Decisions", desc: "Position and opening ranges drive long-term win rate more than any postflop trick." },
    postflop: { title: "Postflop Math", desc: "Use outs, pot odds, and board texture to choose profitable bets, calls, and folds." },
    bankroll: { title: "Bankroll Control", desc: "Variance is unavoidable. Bankroll discipline keeps you in the game long enough for edge to matter." },
  };

  return e("div", { className: "app" },
    e("style", null, styles),
    
    e("header", { className: "header" },
      e("div", { className: "eyebrow" }, "Texas Hold'em Trainer"),
      e("h1", { className: "title" }, "POKER ", e("span", { className: "amp" }, "TRAINER")),
      e("div", { className: "subtitle" }, "Learn core concepts, then drill decisions"),
    ),

    e("nav", { className: "nav" },
      SECTIONS.map(s => e("button", {
        key: s.id,
        className: `nav-item ${section === s.id ? "active" : ""}`,
        onClick: () => { setSection(s.id); setMode("learn"); },
      },
        e("span", { className: "nav-num" }, s.num),
        s.title,
      )),
    ),

    e("section", { className: "section" },
      e("div", { className: "section-header" },
        e("div", { className: "section-eyebrow" }, `Chapter ${SECTIONS.find(s=>s.id===section).num}`),
        e("h2", { className: "section-title" }, sectionTitles[section].title),
        e("p", { className: "section-desc" }, sectionTitles[section].desc),
        e("div", { className: "quick-start" },
          e("strong", null, "Flow: "),
          "Pick a chapter, switch to Learn for concepts, then Practice to test decisions and track accuracy.",
        ),
      ),

      e("div", { className: "mode-toggle-wrap" },
        e("div", { className: "mode-toggle" },
          e("button", {
            className: `mode-btn ${mode === "learn" ? "active" : ""}`,
            onClick: () => setMode("learn"),
          }, "Learn"),
          e("button", {
            className: `mode-btn ${mode === "practice" ? "active" : ""}`,
            onClick: () => setMode("practice"),
          }, "Practice"),
        ),
      ),

      e(AnimatePresence, { mode: "wait" },
        e(motion.div, {
          key: `${section}-${mode}`,
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.25 },
        }, renderContent()),
      ),
    ),

    e("footer", { className: "footer" },
      e("span", null, "Play tight"),
      e("span", { className: "ornament" }, "✦"),
      e("span", null, "Play in position"),
      e("span", { className: "ornament" }, "✦"),
      e("span", null, "Mind the bankroll"),
    ),
  );
}


export default App;
