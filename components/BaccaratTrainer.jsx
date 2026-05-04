"use client";

import { useMemo, useState } from "react";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SHOE_DECKS = 6;
const CUT_CARD_REMAINING = 14;
const CARDS_PER_DECK = 52;
const SHOE_SIZE = SHOE_DECKS * CARDS_PER_DECK;
const STREAK_BET_MODE = "Streak Bet (3+)";

const DRAGON_PAYOUTS = {
  4: 1,
  5: 2,
  6: 4,
  7: 6,
  8: 10,
  9: 30,
};
const PATTERN_ROWS = 15;

function cardPoint(rank) {
  if (rank === "A") return 1;
  if (["10", "J", "Q", "K"].includes(rank)) return 0;
  return Number(rank);
}

function shuffleCards(cards) {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildShoe() {
  const cards = [];
  let uid = 0;
  for (let d = 0; d < SHOE_DECKS; d += 1) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        uid += 1;
        cards.push({ rank, suit, point: cardPoint(rank), id: `d${d + 1}-${uid}` });
      }
    }
  }
  return shuffleCards(cards);
}

function createShoeState(shoeNumber = 1) {
  return {
    cards: buildShoe(),
    index: 0,
    shoeNumber,
    reshuffles: 0,
  };
}

function ensureShoeReady(shoeState, minCardsNeeded = 6) {
  const remaining = shoeState.cards.length - shoeState.index;
  if (remaining >= minCardsNeeded && remaining > CUT_CARD_REMAINING) return false;

  const next = createShoeState(shoeState.shoeNumber + 1);
  shoeState.cards = next.cards;
  shoeState.index = 0;
  shoeState.shoeNumber = next.shoeNumber;
  shoeState.reshuffles += 1;
  return true;
}

function drawFromShoe(shoeState) {
  const card = shoeState.cards[shoeState.index];
  shoeState.index += 1;
  return { ...card, id: `${shoeState.shoeNumber}-${shoeState.index}-${card.id}` };
}

function handTotal(cards) {
  const total = cards.reduce((sum, c) => sum + c.point, 0);
  return total % 10;
}

function isNatural(cards) {
  return cards.length === 2 && (handTotal(cards) === 8 || handTotal(cards) === 9);
}

function shouldBankerDraw(bankerTotal, playerThirdPoint) {
  if (playerThirdPoint === null) return bankerTotal <= 5;
  if (bankerTotal <= 2) return true;
  if (bankerTotal === 3) return playerThirdPoint !== 8;
  if (bankerTotal === 4) return playerThirdPoint >= 2 && playerThirdPoint <= 7;
  if (bankerTotal === 5) return playerThirdPoint >= 4 && playerThirdPoint <= 7;
  if (bankerTotal === 6) return playerThirdPoint === 6 || playerThirdPoint === 7;
  return false;
}

function resolveMainBet(mainBet, winner, mainWager) {
  if (!mainBet) return 0;
  if (mainWager <= 0) return 0;

  if (winner === "TIE") {
    if (mainBet === "Tie") return mainWager * 8;
    return 0;
  }

  if (mainBet === "Player") return winner === "Player" ? mainWager : -mainWager;
  if (mainBet === "Banker") return winner === "Banker" ? mainWager * 0.95 : -mainWager;
  if (mainBet === "Tie") return -mainWager;
  return 0;
}

function resolveDragonBet(dragonSide, winner, winnerNatural, margin, dragonWager) {
  if (dragonWager <= 0 || dragonSide === "None") {
    return { net: 0, outcome: "none", payout: 0 };
  }

  if (winner === "TIE") {
    return { net: 0, outcome: "push", payout: 0 };
  }

  if (winner !== dragonSide) {
    return { net: -dragonWager, outcome: "loss", payout: 0 };
  }

  if (winnerNatural) {
    return { net: dragonWager, outcome: "win", payout: 1 };
  }

  if (margin >= 4) {
    const odds = DRAGON_PAYOUTS[margin] ?? 0;
    return { net: dragonWager * odds, outcome: "win", payout: odds };
  }

  return { net: -dragonWager, outcome: "loss", payout: 0 };
}

function simulateRound({ mainBet, dragonSide, mainWager, dragonWager, shoeState }) {
  const player = [drawFromShoe(shoeState), drawFromShoe(shoeState)];
  const banker = [drawFromShoe(shoeState), drawFromShoe(shoeState)];

  const playerNatural = isNatural(player);
  const bankerNatural = isNatural(banker);

  if (!playerNatural && !bankerNatural) {
    const pTotal = handTotal(player);
    let playerThirdPoint = null;

    if (pTotal <= 5) {
      const third = drawFromShoe(shoeState);
      player.push(third);
      playerThirdPoint = third.point;
    }

    const bTotal = handTotal(banker);
    if (shouldBankerDraw(bTotal, playerThirdPoint)) {
      banker.push(drawFromShoe(shoeState));
    }
  }

  const playerTotal = handTotal(player);
  const bankerTotal = handTotal(banker);

  let winner = "TIE";
  if (playerTotal > bankerTotal) winner = "Player";
  if (bankerTotal > playerTotal) winner = "Banker";

  const winnerNatural =
    winner === "Player" ? isNatural(player) : winner === "Banker" ? isNatural(banker) : false;

  const margin = winner === "TIE" ? 0 : Math.abs(playerTotal - bankerTotal);

  const mainNet = resolveMainBet(mainBet, winner, mainWager);
  const dragon = resolveDragonBet(dragonSide, winner, winnerNatural, margin, dragonWager);

  return {
    player,
    banker,
    playerTotal,
    bankerTotal,
    winner,
    winnerNatural,
    margin,
    mainNet,
    dragon,
    net: mainNet + dragon.net,
    shoeNumber: shoeState.shoeNumber,
    cardsRemaining: shoeState.cards.length - shoeState.index,
  };
}

function sanitizeNumericInput(value) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function normalizeWager(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function formatWagerInput(value) {
  const n = normalizeWager(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, "");
}

function getCurrentStreak(history) {
  if (history.length === 0) return { side: "", length: 0 };
  const side = history[history.length - 1];
  let length = 1;
  for (let i = history.length - 2; i >= 0; i -= 1) {
    if (history[i] !== side) break;
    length += 1;
  }
  return { side, length };
}

function getStreakMainBet(history, minStreakLength = 3) {
  const streak = getCurrentStreak(history);
  if (streak.length < minStreakLength) return null;
  if (streak.side !== "Player" && streak.side !== "Banker") return null;
  return streak.side;
}

function buildStreakColumns(history, rows = PATTERN_ROWS) {
  const cols = [];
  for (const winner of history) {
    const lastCol = cols[cols.length - 1];
    if (!lastCol) {
      cols.push([winner]);
      continue;
    }
    const lastWinner = lastCol[lastCol.length - 1];
    if (winner === lastWinner && lastCol.length < rows) {
      lastCol.push(winner);
      continue;
    }
    cols.push([winner]);
  }
  return cols;
}

function Card({ card }) {
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div
      style={{
        width: 68,
        height: 96,
        borderRadius: 10,
        background: "linear-gradient(180deg,#ffffff,#edf4ef)",
        border: "1px solid #becdc4",
        color: red ? "#d84864" : "#121712",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "6px 8px",
        boxShadow: "0 5px 14px rgba(0,0,0,.34), inset 0 0 0 2px rgba(255,255,255,.55)",
        fontWeight: 900,
        position: "relative",
      }}
    >
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 18 }}>{card.rank}</div>
        <div style={{ fontSize: 14 }}>{card.suit}</div>
      </div>
      <div style={{ alignSelf: "center", fontSize: 24, opacity: 0.92 }}>{card.suit}</div>
      <div style={{ lineHeight: 1, transform: "rotate(180deg)", alignSelf: "flex-end" }}>
        <div style={{ fontSize: 18 }}>{card.rank}</div>
        <div style={{ fontSize: 14 }}>{card.suit}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 4,
          bottom: 4,
          fontSize: 10,
          color: "#3c5b4a",
          background: "#eaf3ed",
          border: "1px solid #c8d6ce",
          borderRadius: 4,
          padding: "1px 4px",
        }}
      >
        {card.point}
      </div>
    </div>
  );
}

export default function BaccaratTrainer() {
  const [mode, setMode] = useState("Guide");
  const [mainBet, setMainBet] = useState("Banker");
  const [dragonSide, setDragonSide] = useState("None");
  const [mainWagerInput, setMainWagerInput] = useState("10");
  const [dragonWagerInput, setDragonWagerInput] = useState("5");
  const [batchSize, setBatchSize] = useState(10);

  const [stats, setStats] = useState({
    rounds: 0,
    player: 0,
    banker: 0,
    tie: 0,
    naturals: 0,
    dragonWins: 0,
    dragonPushes: 0,
    dragonLosses: 0,
    bankroll: 1000,
  });
  const [lastRound, setLastRound] = useState(null);
  const [history, setHistory] = useState([]);
  const [shoe, setShoe] = useState(() => createShoeState());

  const accuracyHint = useMemo(() => {
    if (stats.rounds === 0) return "No rounds yet";
    const bankerRate = ((stats.banker / stats.rounds) * 100).toFixed(1);
    const playerRate = ((stats.player / stats.rounds) * 100).toFixed(1);
    const tieRate = ((stats.tie / stats.rounds) * 100).toFixed(1);
    return `Banker ${bankerRate}% · Player ${playerRate}% · Tie ${tieRate}%`;
  }, [stats]);

  const streak = useMemo(() => getCurrentStreak(history), [history]);
  const streakBetSideNow = useMemo(
    () => (mainBet === STREAK_BET_MODE ? getStreakMainBet(history) : null),
    [history, mainBet],
  );
  const streakColumns = useMemo(() => buildStreakColumns(history, PATTERN_ROWS), [history]);
  const visibleColumns = useMemo(() => streakColumns.slice(-36), [streakColumns]);
  const cardsLeft = shoe.cards.length - shoe.index;
  const decksLeft = (cardsLeft / CARDS_PER_DECK).toFixed(2);

  const runSimulation = () => {
    let updated = { ...stats };
    let latest = null;
    let boardResetForNewShoe = false;
    const workingShoe = {
      cards: [...shoe.cards],
      index: shoe.index,
      shoeNumber: shoe.shoeNumber,
      reshuffles: shoe.reshuffles,
    };
    const mainWager = normalizeWager(mainWagerInput);
    const dragonWager = normalizeWager(dragonWagerInput);
    let rollingHistory = [...history];
    let newHistory = [];

    for (let i = 0; i < batchSize; i += 1) {
      const reshuffled = ensureShoeReady(workingShoe);
      if (reshuffled) {
        boardResetForNewShoe = true;
        rollingHistory = [];
        newHistory = [];
      }
      const streakMainBet = mainBet === STREAK_BET_MODE ? getStreakMainBet(rollingHistory) : null;
      const mainBetUsed = mainBet === STREAK_BET_MODE ? streakMainBet : mainBet;
      const round = simulateRound({
        mainBet: mainBetUsed,
        dragonSide,
        mainWager,
        dragonWager,
        shoeState: workingShoe,
      });
      latest = round;
      latest.mainBetUsed = mainBetUsed;
      newHistory.push(round.winner);
      rollingHistory.push(round.winner);
      updated.rounds += 1;
      if (round.winner === "Player") updated.player += 1;
      if (round.winner === "Banker") updated.banker += 1;
      if (round.winner === "TIE") updated.tie += 1;
      if (round.winnerNatural) updated.naturals += 1;

      if (dragonSide !== "None") {
        if (round.dragon.outcome === "win") updated.dragonWins += 1;
        if (round.dragon.outcome === "push") updated.dragonPushes += 1;
        if (round.dragon.outcome === "loss") updated.dragonLosses += 1;
      }

      updated.bankroll += round.net;
    }

    setStats(updated);
    setLastRound(latest);
    setShoe(workingShoe);
    setHistory((prev) =>
      (boardResetForNewShoe ? newHistory : [...prev, ...newHistory]).slice(-240),
    );
  };

  const resetSimulation = () => {
    setStats({
      rounds: 0,
      player: 0,
      banker: 0,
      tie: 0,
      naturals: 0,
      dragonWins: 0,
      dragonPushes: 0,
      dragonLosses: 0,
      bankroll: 1000,
    });
    setLastRound(null);
    setHistory([]);
    setShoe(createShoeState());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070c0a",
        color: "#dde8e0",
        fontFamily: "'Courier New', monospace",
        padding: "8px 10px 40px",
        backgroundImage:
          "radial-gradient(ellipse at 8% 8%, #112318 0%, transparent 40%), radial-gradient(ellipse at 92% 0%, #0d1d14 0%, transparent 42%)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#4fffb0", marginBottom: 5 }}>
          BACCARAT GUIDE + SIMULATE
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(24px,3.6vw,50px)", letterSpacing: "0.05em" }}>
          BACCARAT <span style={{ color: "#4fffb0" }}>TRAINER</span>
        </h1>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6, background: "#0d1810", padding: 3, borderRadius: 8 }}>
          {["Guide", "Simulate"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                border: "none",
                borderRadius: 6,
                padding: "10px 16px",
                cursor: "pointer",
                background: mode === m ? "#4fffb0" : "transparent",
                color: mode === m ? "#070c0a" : "#778a80",
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {mode === "Guide" && (
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 10 }}>
          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "#4fffb0", fontSize: 11, letterSpacing: "0.25em", marginBottom: 8 }}>HOW THE GAME WORKS</div>
            <p style={{ margin: 0, lineHeight: 1.65, color: "#b9cbc2" }}>
              You only choose bets. The dealer draws cards by fixed rules. Each side (Player and Banker) tries to finish closest to 9.
              Tens and face cards count as 0, aces count as 1, and totals drop the tens digit (for example, 7 + 8 = 5).
            </p>
          </section>

          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "#4fffb0", fontSize: 11, letterSpacing: "0.25em", marginBottom: 8 }}>BET TYPES (COMMON)</div>
            <div style={{ display: "grid", gap: 6 }}>
              <div>Banker: pays 1:1 minus 5% commission (net 0.95:1), typical house edge about 1.06%</div>
              <div>Player: pays 1:1, typical house edge about 1.24%</div>
              <div>Tie: commonly pays 8:1, high house edge (about 14.36% at 8:1)</div>
            </div>
          </section>

          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "#4fffb0", fontSize: 11, letterSpacing: "0.25em", marginBottom: 8 }}>THIRD-CARD RULE QUICK GUIDE</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65, color: "#b9cbc2" }}>
              <li>Player draws on 0-5, stands on 6-7; naturals (8/9) stand immediately.</li>
              <li>If Player stands, Banker draws on 0-5 and stands on 6-7.</li>
              <li>If Player draws third card: Banker 0-2 draws always.</li>
              <li>Banker 3 draws unless Player third card is 8.</li>
              <li>Banker 4 draws if Player third card is 2-7.</li>
              <li>Banker 5 draws if Player third card is 4-7.</li>
              <li>Banker 6 draws if Player third card is 6-7.</li>
              <li>Banker 7 always stands.</li>
            </ul>
          </section>

          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "#4fffb0", fontSize: 11, letterSpacing: "0.25em", marginBottom: 8 }}>DRAGON BONUS (COMMON VERSION)</div>
            <p style={{ marginTop: 0, color: "#b9cbc2", lineHeight: 1.65 }}>
              Dragon Bonus is a side bet usually placed on the same side as your main bet. It wins if your chosen side wins
              with a natural (8/9) or by a large margin (4+ points). Ties usually push this side bet.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 6 }}>
              {[
                ["Natural win", "1:1"],
                ["Win by 4", "1:1"],
                ["Win by 5", "2:1"],
                ["Win by 6", "4:1"],
                ["Win by 7", "6:1"],
                ["Win by 8", "10:1"],
                ["Win by 9", "30:1"],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#132016", border: "1px solid #244433", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ color: "#9bb3a6", fontSize: 12 }}>{k}</div>
                  <div style={{ color: "#4fffb0", fontWeight: 900 }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ marginBottom: 0, marginTop: 10, color: "#8ca397", fontSize: 12 }}>
              Note: side-bet paytables and edge vary by casino/version. Always read the table felt before betting.
            </p>
          </section>
        </div>
      )}

      {mode === "Simulate" && (
        <div style={{ maxWidth: 1020, margin: "0 auto", display: "grid", gap: 10 }}>
          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>
              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 4 }}>MAIN BET</div>
                <select value={mainBet} onChange={(e) => setMainBet(e.target.value)} style={selectStyle}>
                  <option>Banker</option>
                  <option>Player</option>
                  <option>Tie</option>
                  <option>{STREAK_BET_MODE}</option>
                </select>
              </label>

              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 4 }}>DRAGON BONUS</div>
                <select value={dragonSide} onChange={(e) => setDragonSide(e.target.value)} style={selectStyle}>
                  <option>None</option>
                  <option>Player</option>
                  <option>Banker</option>
                </select>
              </label>

              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 4 }}>MAIN WAGER</div>
                <input
                  inputMode="decimal"
                  value={mainWagerInput}
                  onChange={(e) => setMainWagerInput(sanitizeNumericInput(e.target.value))}
                  onBlur={() => setMainWagerInput(formatWagerInput(mainWagerInput))}
                  style={inputStyle}
                />
              </label>

              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 4 }}>DRAGON WAGER</div>
                <input
                  inputMode="decimal"
                  value={dragonWagerInput}
                  onChange={(e) => setDragonWagerInput(sanitizeNumericInput(e.target.value))}
                  onBlur={() => setDragonWagerInput(formatWagerInput(dragonWagerInput))}
                  style={inputStyle}
                />
              </label>

              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 4 }}>ROUNDS / CLICK</div>
                <select value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} style={selectStyle}>
                  <option value={1}>1</option>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>

            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={runSimulation} style={primaryButton}>Run Simulation</button>
              <button onClick={resetSimulation} style={secondaryButton}>Reset + New Shoe</button>
            </div>
          </section>

          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
              <Stat label="Rounds" value={stats.rounds} />
              <Stat label="Banker Wins" value={stats.banker} />
              <Stat label="Player Wins" value={stats.player} />
              <Stat label="Ties" value={stats.tie} />
              <Stat label="Naturals" value={stats.naturals} />
              <Stat label="Shoe #" value={shoe.shoeNumber} />
              <Stat label="Cards Left" value={cardsLeft} />
              <Stat label="Decks Left" value={decksLeft} />
              <Stat label="Reshuffles" value={shoe.reshuffles} />
              <Stat label="Bankroll (units)" value={stats.bankroll.toFixed(2)} emphasis />
            </div>
            <div style={{ marginTop: 10, color: "#9bb3a6", fontSize: 13 }}>{accuracyHint}</div>
            {dragonSide !== "None" && (
              <div style={{ marginTop: 6, color: "#9bb3a6", fontSize: 13 }}>
                Dragon Bonus: {stats.dragonWins} wins · {stats.dragonPushes} pushes · {stats.dragonLosses} losses
              </div>
            )}
            <div style={{ marginTop: 6, color: "#9bb3a6", fontSize: 13 }}>
              Current streak: {streak.length > 0 ? `${streak.side} x ${streak.length}` : "—"}
            </div>
            {mainBet === STREAK_BET_MODE && (
              <div style={{ marginTop: 6, color: "#9bb3a6", fontSize: 13 }}>
                Streak bet: {streakBetSideNow ? `ACTIVE on ${streakBetSideNow}` : "Waiting for 3+ Player/Banker streak"}
              </div>
            )}
            <div style={{ marginTop: 6, color: "#9bb3a6", fontSize: 13 }}>
              6-deck shoe ({SHOE_SIZE} cards) · Auto-reshuffle at cut card ({CUT_CARD_REMAINING} cards left)
            </div>
          </section>

          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 8 }}>
              PATTERN VISUALIZER (VERTICAL STREAKS)
            </div>
            {history.length === 0 ? (
              <div style={{ color: "#9bb3a6", fontSize: 13 }}>Run a few rounds to generate a pattern.</div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  background: "#122017",
                  border: "1px solid #234332",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${PATTERN_ROWS}, 14px)`,
                    gridAutoFlow: "column",
                    gridAutoColumns: "14px",
                    gap: 4,
                    width: "max-content",
                  background: "#122017",
                }}
              >
                  {visibleColumns.map((col, cIdx) =>
                    Array.from({ length: PATTERN_ROWS }).map((_, rIdx) => {
                      const winner = col[rIdx] || null;
                      return (
                        <div
                          key={`${cIdx}-${rIdx}`}
                          title={winner ? `Col ${cIdx + 1} · ${winner}` : ""}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "1px solid #183125",
                            background:
                              winner === "Player"
                                ? "#4aa8ff"
                                : winner === "Banker"
                                  ? "#ff667e"
                                  : winner === "TIE"
                                    ? "#4fffb0"
                                    : "transparent",
                            opacity: winner ? 1 : 0.22,
                            boxShadow: winner ? "inset 0 0 0 1px rgba(255,255,255,.2)" : "none",
                          }}
                        />
                      );
                    }),
                  )}
                </div>
              </div>
            )}
            <div style={{ marginTop: 8, color: "#8ca397", fontSize: 12 }}>
              Blue = Player · Red = Banker · Green = Tie · New column when streak switches
            </div>
          </section>

          <section style={{ background: "#0d1810", border: "1px solid #1d3628", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4fffb0", marginBottom: 6 }}>LAST ROUND</div>
            {!lastRound ? (
              <div style={{ color: "#9bb3a6" }}>Run a simulation round to see cards and outcomes.</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={handPanel}>
                    <div style={handTitle}>PLAYER ({lastRound.playerTotal})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {lastRound.player.map((c) => <Card key={c.id} card={c} />)}
                    </div>
                  </div>
                  <div style={handPanel}>
                    <div style={handTitle}>BANKER ({lastRound.bankerTotal})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {lastRound.banker.map((c) => <Card key={c.id} card={c} />)}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 10, color: "#dde8e0", lineHeight: 1.6 }}>
                  Winner: <strong style={{ color: "#4fffb0" }}>{lastRound.winner}</strong>
                  {lastRound.winner !== "TIE" && (
                    <>
                      {" "}· Margin: <strong style={{ color: "#ffd700" }}>{lastRound.margin}</strong>
                      {" "}· Natural: <strong style={{ color: lastRound.winnerNatural ? "#4fffb0" : "#9bb3a6" }}>{lastRound.winnerNatural ? "Yes" : "No"}</strong>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 6, color: "#9bb3a6" }}>
                  Main bet used: <strong style={{ color: "#dde8e0" }}>{lastRound.mainBetUsed ?? "No Main Bet"}</strong>
                  {" "}·
                  Main bet result: {formatUnits(lastRound.mainNet)}
                  {dragonSide !== "None" && (
                    <>
                      {" "}· Dragon result: {formatUnits(lastRound.dragon.net)}
                      {lastRound.dragon.payout > 0 ? ` (${lastRound.dragon.payout}:1)` : ""}
                    </>
                  )}
                  {" "}· Net round: <strong style={{ color: lastRound.net >= 0 ? "#4fffb0" : "#ff5577" }}>{formatUnits(lastRound.net)}</strong>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, emphasis = false }) {
  return (
    <div style={{ background: "#122017", border: "1px solid #244433", borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ color: "#9bb3a6", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: emphasis ? "#ffd700" : "#4fffb0", fontWeight: 900, fontSize: 20 }}>{value}</div>
    </div>
  );
}

function formatUnits(n) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}`;
}

const selectStyle = {
  width: "100%",
  background: "#122017",
  color: "#dde8e0",
  border: "1px solid #244433",
  borderRadius: 8,
  padding: "9px 10px",
  fontFamily: "'Courier New', monospace",
};

const inputStyle = {
  width: "100%",
  background: "#122017",
  color: "#dde8e0",
  border: "1px solid #244433",
  borderRadius: 8,
  padding: "9px 10px",
  fontFamily: "'Courier New', monospace",
};

const primaryButton = {
  border: "none",
  background: "#4fffb0",
  color: "#070c0a",
  fontWeight: 900,
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  letterSpacing: "0.06em",
};

const secondaryButton = {
  border: "1px solid #2c5a42",
  background: "#122017",
  color: "#c3d7cb",
  fontWeight: 900,
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  letterSpacing: "0.06em",
};

const handPanel = {
  background: "#122017",
  border: "1px solid #234332",
  borderRadius: 8,
  padding: 10,
};

const handTitle = {
  color: "#9bb3a6",
  fontSize: 12,
  letterSpacing: "0.1em",
  marginBottom: 8,
};
