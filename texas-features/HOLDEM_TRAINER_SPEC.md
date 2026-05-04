# Texas Hold'em Trainer — Implementation Spec

## Context

I'm forking an existing blackjack trainer JS app to build a Texas Hold'em trainer. I have a working single-file React artifact prototype (`holdem-trainer.html`) that defines the full UX, data, pedagogy, and visual design. **Treat that prototype as the source of truth for content and design**, but adapt the architecture to fit the existing JS app's conventions (proper module structure, routing, state management, build pipeline, etc.).

Reference the prototype file at every step. Don't reinvent — port.

---

## Goal

A Texas Hold'em trainer with four sections, each having a **Learn** (education) and **Practice** (interactive quiz) mode:

1. **Hand Rankings** — identify hands & determine winner at showdown
2. **Preflop** — position-based fold/call/raise decisions
3. **Postflop** — reading boards, pot odds, draws, c-betting
4. **Bankroll** — variance math + interactive calculator

---

## Architecture Requirements

### Match the existing blackjack trainer's conventions
- Use the same routing pattern (React Router, hash routing, whatever the existing app uses)
- Use the same state management (Context, Redux, Zustand — match what's there)
- Use the same component file structure (one component per file vs. grouped — follow precedent)
- Use the same styling approach (CSS modules, styled-components, Tailwind — match what's there)
- Reuse shared primitives where they exist (buttons, cards, score bars, layout shells)
- Match the existing test setup if there is one

### What to add
- A `poker/` or `holdem/` feature directory (parallel to whatever the blackjack folder is)
- A shared `evaluator.js` (or `.ts`) module with the 7-card hand evaluator (see below — must port from prototype)
- A `data/` subfolder for the quiz pools (one file per section)
- Section components that follow the existing app's patterns

### Persistence
- Score state should persist across navigation within a section but reset on page reload (like the prototype)
- Bonus: persist accuracy stats per section to localStorage so the user sees lifetime stats

---

## The Evaluator (CRITICAL — port exactly)

The prototype contains a working 7-card hand evaluator that has been validated against 26 showdown scenarios. **Port this verbatim** — do not rewrite it. It handles:
- All 10 hand categories (high card → royal flush)
- Tiebreakers via score arrays (lexicographic comparison)
- The wheel straight (A-2-3-4-5)
- Flushes when a board has 4+ of a suit
- Hands that play the board (e.g., chopped Broadway pots)

Key functions to port:
- `evaluate5(cards5)` → returns `{ rank, label, score }`
- `evaluate7(cards7)` → returns best 5 of 7 by trying all C(7,5)=21 combinations
- `evaluateHand(hole, board)` → wrapper for hole + community cards
- `compareScore(a, b)` → lexicographic score comparison

Cards are represented as `["A", "♠"]` tuples. Suits use Unicode symbols `♠♥♦♣`. The "10" rank is stored as the string `"10"` (not `"T"`) but `RANK_VAL` maps both `"T"` and `"10"` to value 10.

**Add unit tests for the evaluator.** The prototype only had ad-hoc validation; in a real app every category should have at least one test, plus tests for: wheel straight, A-high straight, paired-board full house, board-pair-fills-up cases, ties, and four-flush boards.

---

## Section 1: Hand Rankings

### Learn mode
- Header explainer about how Hold'em uses best-5-of-7
- "Three things to internalize": suits don't break ties, aces play high or low, you play your best five
- A list of all 10 hand rankings with example 5-card hands (use the data from prototype's `HAND_RANKINGS`)
- Each entry shows rank number, name, prose description, and visual cards

### Practice mode — has TWO sub-modes (toggle inside Practice)
**Sub-mode A: Identify**
- Show 5 cards, ask user to name the hand category
- Multiple choice (4 options usually, sometimes 3)
- Use the `HAND_QUIZ` array from prototype (20 questions)
- After answer: green highlight on correct, red on wrong, show explanation

**Sub-mode B: Showdown**
- Deal a 5-card community board (flop, turn, river)
- Show two hole-card hands (Hand A and Hand B)
- User clicks the winning hand
- Use the `WINNING_HAND_QUIZ` array from prototype (26 scenarios) — but **the winner is computed by the evaluator at runtime, not stored in the data**
- After click: winner glows green, loser dims, each hand shows its actual hand label (computed by evaluator), then the teaching `explain` paragraph appears
- **MUST handle ties** — scenario #25 in the prototype is a chopped Broadway pot. UI should show both hands as winners and a "Tie — pot is split" message
- **Stretch goal (was in progress when I forked):** street-by-street reveal. Initially show only the flop, then a "Deal Turn" button reveals the turn, then "Deal River" reveals the river, then evaluation/winner is shown. Adds drama and teaching value (user sees how draws develop). The data already has `flop` (3 cards), `turn` (1 card), `river` (1 card) split out for this.

---

## Section 2: Preflop

### Learn mode
- Explainer about position being the highest-leverage concept in poker
- Position cards for all 7 spots: UTG, MP, HJ, CO, BTN, SB, BB (port `POSITIONS` array — name, abbreviation, role description)
- A 13×13 starting-hand chart showing all 169 hand combinations
  - Diagonal = pocket pairs
  - Above diagonal = suited (e.g., "AKs")
  - Below diagonal = offsuit (e.g., "AKo")
  - Color-coded by tier: Premium / Strong / Playable / Marginal / Fold
  - **Use exact colors from prototype:**
    - Premium: `#2d8a4f` (forest green)
    - Strong: `#c9a961` (brass)
    - Playable: `#d4b94a` (yellow)
    - Marginal: `#5a4a2a` (dim olive — must be visually distinct from both Playable AND Fold)
    - Fold: `rgba(20,20,20,0.6)` (near-black)
  - Port the `classifyHand(r1, r2, suited)` function exactly — it has been carefully tuned

- Sections on open-raise sizing (live vs. online vs. short stack) and the 3-bet decision

### Practice mode
- Show user's position + their 2 hole cards
- 3 options: Fold / Call / Raise
- Port the `PREFLOP_QUIZ` array (32 scenarios covering all positions and many hand types)
- Standard correct/wrong feedback with explanation

---

## Section 3: Postflop

### Learn mode
- Explainer on counting outs, the Rule of 4 and 2, pot odds
- Common out counts table (flush draw = 9, OESD = 8, gutshot = 4, etc.)
- Board texture explanation (dry / wet / paired / monotone)
- C-bet theory

### Practice mode
- Show user's hole cards + 3-card flop on a "table felt" board display
- Show pot size, amount-to-call, and computed pot odds (e.g., "2.5:1")
- 3 options (varies by scenario — Fold/Call/Raise, Check/Bet/Check-fold, etc.)
- Port the `POSTFLOP_QUIZ` array (20 scenarios)
- Pot odds display: `${(pot/toCall).toFixed(1)}:1` — only show when toCall > 0

**Stretch:** add turn/river decision points to Postflop too. Currently only flop scenarios exist in the prototype.

---

## Section 4: Bankroll

### Learn mode
- Explainer on variance and why bankroll management matters
- Standard buy-in requirements by format:
  - Live cash: 20-30 buy-ins
  - Online cash: 30-50 buy-ins
  - MTTs: 100+ buy-ins
  - Sit & Go: 50-100 buy-ins
- Stop-loss & tilt discipline section
- Moving up/down stakes guidance
- Importance of tracking

### Practice mode (interactive calculator, not a quiz)
- Inputs: bankroll ($), big blind ($), win-rate (bb/100), format (dropdown: live cash, online cash, MTT, SnG)
- Computed outputs:
  - Standard buy-in (= big blind × 100)
  - Buy-ins user has (= bankroll / buy-in)
  - Recommended buy-ins for selected format
  - Min bankroll for current stake
  - For cash games: estimated $/hour and monthly expectation (assume 80 hours/month)
- Status flag: "Sufficient" (green) / "Marginal" (yellow) / "Underrolled" (red)
  - Sufficient = at or above recommended
  - Marginal = 60-99% of recommended
  - Underrolled = below 60% of recommended
- Below the calculator, an "How to read these numbers" section explaining the tiers and a reality check on win-rates (5 bb/100 is strong at small stakes; anyone claiming 10+ bb/100 long-term is rare or lying)

---

## Visual Design

The prototype has a refined "vintage card room" aesthetic:
- Deep felt green background (`#0a3d2e` → `#1a6b54` radial gradient)
- Brass accent color (`#c9a961`, bright `#e8c87a`)
- Cream/ivory text (`#f5ecd7`, `#fdf9ed`)
- Burgundy for card backs / negative states (`#6b1e2c`)
- **Fonts:** Cormorant Garamond (serif, italic for emphasis) + Inter (body) + JetBrains Mono (labels, scores, "eyebrow" text)
- Card components have proper poker-card styling: red hearts/diamonds, black spades/clubs, three sizes (sm/default/lg)
- Felt-styled "board display" for community cards with brass piping and inner shadow
- Subtle noise/grain overlay across the whole app

**Match this aesthetic** unless the existing blackjack trainer has a strong design language that should be preserved across the apps. If the blackjack app already uses different colors/fonts, prioritize consistency between the two apps over matching the prototype exactly.

---

## Component Inventory (port from prototype)

These are the discrete UI components needed:

| Component | Notes |
|---|---|
| `<Card rank suit size>` | Single playing card with red/black coloring |
| `<CardRow cards size>` | Row of cards |
| `<BoardDisplay flop turn river>` | Felt-styled community board |
| `<HandRankRow rank name desc cards>` | Row in the hand-ranking list |
| `<RangeChart>` | The 13×13 preflop chart |
| `<PositionCard name abbr desc>` | One position in the preflop learn page |
| `<ChoiceButtons options correct picked onPick>` | Multiple-choice with green/red feedback |
| `<Feedback type explain>` | Post-answer explanation panel |
| `<ScoreBar right total>` | Running score display |
| `<ModeToggle>` | Learn / Practice toggle (top-level) |
| `<SubmodeToggle>` | Identify / Showdown toggle (inside Hand Rankings practice) |
| `<NextButton>` | "Next Hand →" button |
| `<CalcInput label value onChange>` | Bankroll calculator input |
| `<CalcResult>` | Bankroll calculator output card |
| `<StatusFlag good/warn/bad>` | Sufficient/Marginal/Underrolled indicator |

---

## Data files to create

Each as its own module. Port verbatim from the prototype:

- `data/handRankings.js` — the `HAND_RANKINGS` array (10 entries)
- `data/positions.js` — the `POSITIONS` array (7 entries)
- `data/handIdentifyQuiz.js` — `HAND_QUIZ` (20 entries)
- `data/showdownQuiz.js` — `WINNING_HAND_QUIZ` (26 entries with flop/turn/river)
- `data/preflopQuiz.js` — `PREFLOP_QUIZ` (32 entries)
- `data/postflopQuiz.js` — `POSTFLOP_QUIZ` (20 entries)
- `evaluator.js` — `evaluate5`, `evaluate7`, `evaluateHand`, `compareScore`, `RANK_VAL`, `VAL_TO_RANK`
- `preflopChart.js` — `classifyHand(r1, r2, suited)` and the `RANKS_HI_LO` constant

---

## Quality Bar

- **Evaluator must be unit-tested.** Add tests for every hand category, the wheel, ties, and four-flush boards before moving on.
- **No hand-coded "answer" fields in showdown data.** The evaluator computes the winner; data only carries the scenario + teaching prose.
- **Quiz randomization should not repeat the current question.** The prototype handles this with a small while-loop; replicate or improve.
- **Mobile responsive.** The prototype works at ~380px viewport. Match that.
- **Score tracking per sub-mode.** When the user toggles between Identify and Showdown, each tracks its own running tally.

---

## Things the prototype got wrong (don't repeat)

1. Initial pass had `WINNING_HAND_QUIZ` with hard-coded `answer` fields and per-hand `explainA`/`explainB` strings. **This was an error** — it caused several scenarios to have wrong descriptions when the hand-written prose disagreed with what the actual best 5-card hand was. The fix was to compute everything via the evaluator. **Build it that way from day one.**
2. First chart palette used red for the top tier, which read as "danger" instead of "premium." Final palette uses green = premium, yellow = playable, dim olive = marginal, near-black = fold. Don't revert.
3. Marginal and Fold tiers were initially hard to distinguish visually. The fix was to give Marginal a saturated dim color and Fold a near-black low-opacity color. Keep that contrast.

---

## Final Step

After implementation, walk through every section in both Learn and Practice modes and verify:
- All quiz pools cycle through their full content
- All evaluator-computed hand labels match the teaching `explain` text
- Ties render correctly in showdown
- The 13×13 chart matches the classification function
- Bankroll calculator math is correct (especially edge cases — zero bankroll, zero blinds)

Reference file: `holdem-trainer.html` — the validated working prototype.
