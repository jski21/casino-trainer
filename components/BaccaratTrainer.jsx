"use client";

import { useState, useEffect, useRef } from "react";

// ─── CARDS ─────────────────────────────────────────────────────
const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const isRed = (s) => s === "♥" || s === "♦";

// Baccarat card pip value (A=1, 2-9=face, 10/J/Q/K=0)
const pip = (v) => {
  if (v === "A") return 1;
  if (["10", "J", "Q", "K"].includes(v)) return 0;
  return parseInt(v, 10);
};

const handTotal = (cards) => cards.reduce((s, c) => s + pip(c.value), 0) % 10;

const buildShoe = (decks = 8) => {
  const cards = [];
  for (let d = 0; d < decks; d++) {
    for (const s of SUITS) for (const v of VALUES) cards.push({ suit: s, value: v });
  }
  // Fisher–Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map((c, i) => ({ ...c, id: `${i}-${Math.random()}` }));
};

// ─── BACCARAT THIRD-CARD RULES ─────────────────────────────────
// Returns final hands with explanation log entries.
function playRound(shoe, startIdx) {
  let i = startIdx;
  const draw = () => shoe[i++];
  const log = [];

  const player = [draw(), draw()];
  const banker = [draw(), draw()];

  let pTotal = handTotal(player);
  let bTotal = handTotal(banker);

  log.push({ step: "deal", text: `Initial deal — Player ${pTotal}, Banker ${bTotal}.` });

  // Naturals
  if (pTotal >= 8 || bTotal >= 8) {
    log.push({
      step: "natural",
      text: `Natural ${Math.max(pTotal, bTotal)}. Both hands stand.`,
    });
    return { player, banker, log, nextIdx: i };
  }

  // Player rule
  let playerThird = null;
  if (pTotal <= 5) {
    playerThird = draw();
    player.push(playerThird);
    pTotal = handTotal(player);
    log.push({
      step: "player-draw",
      text: `Player has ${handTotal(player.slice(0, 2))} (≤5) → draws a third card. New total ${pTotal}.`,
    });
  } else {
    log.push({ step: "player-stand", text: `Player has ${pTotal} (6–7) → stands.` });
  }

  // Banker rule
  if (!playerThird) {
    // Player stood: banker uses player's rule (draw on 0–5, stand on 6–7)
    if (bTotal <= 5) {
      banker.push(draw());
      bTotal = handTotal(banker);
      log.push({
        step: "banker-draw",
        text: `Player stood. Banker has ${handTotal(banker.slice(0, 2))} (≤5) → draws. New total ${bTotal}.`,
      });
    } else {
      log.push({ step: "banker-stand", text: `Player stood. Banker has ${bTotal} (6–7) → stands.` });
    }
  } else {
    const p3 = pip(playerThird.value);
    let drew = false;
    let why = "";
    if (bTotal <= 2) {
      drew = true;
      why = `Banker ≤2 → always draws.`;
    } else if (bTotal === 3) {
      drew = p3 !== 8;
      why = `Banker 3 → draws unless Player's 3rd card is 8 (was ${p3}).`;
    } else if (bTotal === 4) {
      drew = p3 >= 2 && p3 <= 7;
      why = `Banker 4 → draws if Player's 3rd card is 2–7 (was ${p3}).`;
    } else if (bTotal === 5) {
      drew = p3 >= 4 && p3 <= 7;
      why = `Banker 5 → draws if Player's 3rd card is 4–7 (was ${p3}).`;
    } else if (bTotal === 6) {
      drew = p3 === 6 || p3 === 7;
      why = `Banker 6 → draws if Player's 3rd card is 6 or 7 (was ${p3}).`;
    } else {
      drew = false;
      why = `Banker 7 → stands.`;
    }
    if (drew) {
      banker.push(draw());
      bTotal = handTotal(banker);
      log.push({ step: "banker-draw", text: `${why} Banker draws. New total ${bTotal}.` });
    } else {
      log.push({ step: "banker-stand", text: `${why} Banker stands.` });
    }
  }

  return { player, banker, log, nextIdx: i };
}

// ─── BETS / PAYOUTS ────────────────────────────────────────────
const BET_TYPES = {
  player: { label: "PLAYER", payout: 1, color: "#4aa3ff", note: "Pays 1:1" },
  banker: { label: "BANKER", payout: 0.95, color: "#ff8a4a", note: "Pays 0.95:1 (5% commission)" },
  tie: { label: "TIE", payout: 8, color: "var(--warn)", note: "Pays 8:1" },
  pPair: { label: "PLAYER PAIR", payout: 11, color: "#7fc7ff", note: "Pays 11:1" },
  bPair: { label: "BANKER PAIR", payout: 11, color: "#ffb380", note: "Pays 11:1" },
};

function settle(bets, player, banker) {
  const pT = handTotal(player);
  const bT = handTotal(banker);
  const result = pT > bT ? "player" : bT > pT ? "banker" : "tie";
  const pPair = player[0].value === player[1].value;
  const bPair = banker[0].value === banker[1].value;

  const payouts = {};
  let net = 0;
  for (const [k, amt] of Object.entries(bets)) {
    if (!amt) continue;
    let p = -amt;
    if (k === "player" && result === "player") p = amt * 1;
    else if (k === "banker" && result === "banker") p = amt * 0.95;
    else if (k === "tie" && result === "tie") p = amt * 8;
    else if (k === "player" && result === "tie") p = 0; // push
    else if (k === "banker" && result === "tie") p = 0; // push
    else if (k === "pPair") p = pPair ? amt * 11 : -amt;
    else if (k === "bPair") p = bPair ? amt * 11 : -amt;
    payouts[k] = p;
    net += p;
  }
  return { result, pPair, bPair, payouts, net };
}

// ─── CHIP UI ───────────────────────────────────────────────────
const CHIPS = [
  { v: 1, color: "#e8eee8", ring: "#9aa49d", text: "#0d1810" },
  { v: 5, color: "#d6304a", ring: "#7a1f2e", text: "#fff" },
  { v: 25, color: "#1f9e60", ring: "#0d5a36", text: "#fff" },
  { v: 100, color: "#1c1c1c", ring: "#444", text: "#fff" },
  { v: 500, color: "#7a3fb5", ring: "#4a2474", text: "#fff" },
];

const Chip = ({ v, color, ring, text, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: 56,
      height: 56,
      borderRadius: "50%",
      border: `4px dashed ${ring}`,
      background: color,
      color: text,
      fontFamily: "'Courier New', monospace",
      fontWeight: 900,
      fontSize: 14,
      cursor: "pointer",
      transform: selected ? "translateY(-6px) scale(1.08)" : "translateY(0)",
      boxShadow: selected
        ? `0 8px 16px color-mix(in srgb, ${ring} 50%, transparent), 0 0 0 3px var(--accent)`
        : `0 4px 8px var(--shadow)`,
      transition: "all 0.15s",
    }}
  >
    ${v}
  </button>
);

// ─── CARD UI ───────────────────────────────────────────────────
const Card = ({ c, hidden, delay = 0 }) => {
  if (hidden || !c) {
    return (
      <div
        style={{
          width: 58,
          height: 84,
          borderRadius: 6,
          background: "linear-gradient(135deg,var(--border),var(--bg-elev))",
          border: "1px solid var(--border)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 58,
        height: 84,
        borderRadius: 6,
        background: "#fff",
        border: "1px solid #ccc",
        color: isRed(c.suit) ? "#d62828" : "#0a0a0a",
        fontFamily: "'Courier New', monospace",
        fontWeight: 900,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "5px 7px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        animation: `dealIn 0.35s ${delay}s both`,
      }}
    >
      <div style={{ fontSize: 16, lineHeight: 1 }}>{c.value}</div>
      <div style={{ fontSize: 22, alignSelf: "center", lineHeight: 1 }}>{c.suit}</div>
      <div style={{ fontSize: 16, lineHeight: 1, alignSelf: "flex-end", transform: "rotate(180deg)" }}>
        {c.value}
      </div>
    </div>
  );
};

// ─── BET ZONE ──────────────────────────────────────────────────
const BetZone = ({
  type,
  bet,
  onClick,
  onClear,
  highlight,
  winning,
  losing,
  size = "lg",
  children,
}) => {
  const t = BET_TYPES[type];
  const big = size === "lg";
  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (bet > 0) onClear();
      }}
      style={{
        position: "relative",
        flex: big ? 1 : "0 0 auto",
        minHeight: big ? 130 : 80,
        padding: big ? "16px 14px" : "10px 12px",
        borderRadius: 12,
        border: `2px solid ${winning ? "var(--accent)" : losing ? "var(--danger)" : highlight ? t.color : "var(--border)"}`,
        background: winning
          ? `linear-gradient(135deg, color-mix(in srgb, ${t.color} 20%, transparent), var(--bg-elev))`
          : losing
          ? "linear-gradient(135deg,#3a1018,var(--bg-elev))"
          : highlight
          ? `color-mix(in srgb, ${t.color} 10%, transparent)`
          : "var(--bg-elev)",
        cursor: "pointer",
        color: t.color,
        fontFamily: "'Courier New', monospace",
        fontWeight: 900,
        textAlign: "center",
        transition: "all 0.2s",
        outline: "none",
        boxShadow: winning ? `0 0 24px color-mix(in srgb, ${t.color} 40%, transparent)` : "none",
      }}
    >
      <div style={{ fontSize: big ? 18 : 12, letterSpacing: "0.12em", color: t.color }}>
        {t.label}
      </div>
      <div
        style={{
          fontSize: big ? 11 : 10,
          color: "var(--text-3)",
          marginTop: 4,
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        {t.note}
      </div>
      {children}
      {bet > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "var(--bg)",
            border: `2px solid ${t.color}`,
            color: t.color,
            borderRadius: 999,
            padding: "4px 10px",
            fontSize: big ? 14 : 12,
            fontWeight: 900,
            animation: "pop 0.25s ease",
          }}
        >
          ${bet}
        </div>
      )}
    </button>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────
export default function BaccaratTrainer() {
  const [bankroll, setBankroll] = useState(1000);
  const [chip, setChip] = useState(25);
  const [bets, setBets] = useState({});
  const [betHistory, setBetHistory] = useState([]); // for undo
  const [phase, setPhase] = useState("betting"); // betting | dealing | resolved
  const [shoe, setShoe] = useState(() => buildShoe(8));
  const [shoeIdx, setShoeIdx] = useState(0);
  const [hands, setHands] = useState({ player: [], banker: [] });
  const [revealed, setRevealed] = useState({ p: 0, b: 0 });
  const [log, setLog] = useState([]);
  const [logVisible, setLogVisible] = useState(0);
  const [outcome, setOutcome] = useState(null); // { result, payouts, net, pPair, bPair }
  const [history, setHistory] = useState([]); // [{result:'P'|'B'|'T', pT, bT}]
  const [stats, setStats] = useState({ rounds: 0, won: 0, lost: 0, push: 0, peak: 1000 });
  const [showRules, setShowRules] = useState(false);

  const dealTimers = useRef([]);

  useEffect(() => () => dealTimers.current.forEach(clearTimeout), []);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const placeBet = (type) => {
    if (phase !== "betting") return;
    if (bankroll < chip) return;
    setBankroll((b) => b - chip);
    setBets((p) => ({ ...p, [type]: (p[type] || 0) + chip }));
    setBetHistory((h) => [...h, { type, amt: chip }]);
  };

  const clearBet = (type) => {
    if (phase !== "betting") return;
    const refund = bets[type] || 0;
    if (!refund) return;
    setBankroll((b) => b + refund);
    setBets((p) => {
      const n = { ...p };
      delete n[type];
      return n;
    });
    setBetHistory((h) => h.filter((x) => x.type !== type));
  };

  const clearAll = () => {
    if (phase !== "betting") return;
    setBankroll((b) => b + totalBet);
    setBets({});
    setBetHistory([]);
  };

  const undoLast = () => {
    if (phase !== "betting" || betHistory.length === 0) return;
    const last = betHistory[betHistory.length - 1];
    setBankroll((b) => b + last.amt);
    setBets((p) => {
      const n = { ...p };
      const v = (n[last.type] || 0) - last.amt;
      if (v <= 0) delete n[last.type];
      else n[last.type] = v;
      return n;
    });
    setBetHistory((h) => h.slice(0, -1));
  };

  const deal = () => {
    if (phase !== "betting" || totalBet === 0) return;
    // Reshuffle if running low
    let activeShoe = shoe;
    let activeIdx = shoeIdx;
    if (activeShoe.length - activeIdx < 16) {
      activeShoe = buildShoe(8);
      activeIdx = 0;
      setShoe(activeShoe);
    }
    const round = playRound(activeShoe, activeIdx);
    setShoeIdx(round.nextIdx);
    setHands({ player: round.player, banker: round.banker });
    setLog(round.log);
    setRevealed({ p: 0, b: 0 });
    setLogVisible(0);
    setPhase("dealing");

    // Real-world deal order: P1, B1, P2, B2, [P3 if drawn], [B3 if drawn]
    const order = [];
    const max = Math.max(round.player.length, round.banker.length);
    for (let i = 0; i < max; i++) {
      if (round.player[i]) order.push("p");
      if (round.banker[i]) order.push("b");
    }
    dealTimers.current.forEach(clearTimeout);
    dealTimers.current = [];
    order.forEach((side, idx) => {
      const t = setTimeout(() => {
        setRevealed((r) =>
          side === "p" ? { ...r, p: r.p + 1 } : { ...r, b: r.b + 1 }
        );
        // Reveal log entries roughly tied to deal milestones
        if (idx === 3) setLogVisible(1); // initial deal text after 4 cards
        if (idx === order.length - 1) setLogVisible(round.log.length);
      }, 450 * (idx + 1));
      dealTimers.current.push(t);
    });

    // Resolve
    const resolveT = setTimeout(() => {
      const r = settle(bets, round.player, round.banker);
      setOutcome(r);
      let returns = 0;
      for (const [k, amt] of Object.entries(bets)) {
        const p = r.payouts[k] ?? -amt;
        if (p > 0) returns += amt + p; // stake back + winnings
        else if (p === 0) returns += amt; // push: stake back
      }
      setBankroll((b) => b + returns);
      setHistory((h) => [
        ...h,
        {
          result: r.result === "player" ? "P" : r.result === "banker" ? "B" : "T",
          pPair: r.pPair,
          bPair: r.bPair,
          pT: handTotal(round.player),
          bT: handTotal(round.banker),
        },
      ].slice(-60));
      setStats((s) => ({
        rounds: s.rounds + 1,
        won: s.won + (r.net > 0 ? 1 : 0),
        lost: s.lost + (r.net < 0 ? 1 : 0),
        push: s.push + (r.net === 0 ? 1 : 0),
        peak: Math.max(s.peak, bankroll + returns),
      }));
      setPhase("resolved");
    }, 450 * (order.length + 1));
    dealTimers.current.push(resolveT);
  };

  const nextRound = () => {
    setBets({});
    setBetHistory([]);
    setHands({ player: [], banker: [] });
    setLog([]);
    setLogVisible(0);
    setRevealed({ p: 0, b: 0 });
    setOutcome(null);
    setPhase("betting");
  };

  const resetBankroll = () => {
    setBankroll(1000);
    setStats({ rounds: 0, won: 0, lost: 0, push: 0, peak: 1000 });
    setHistory([]);
    nextRound();
  };

  const pT = handTotal(hands.player.slice(0, revealed.p));
  const bT = handTotal(hands.banker.slice(0, revealed.b));

  const winningBets =
    outcome
      ? Object.fromEntries(
          Object.entries(outcome.payouts).map(([k, v]) => [k, v > 0])
        )
      : {};
  const losingBets =
    outcome
      ? Object.fromEntries(
          Object.entries(outcome.payouts).map(([k, v]) => [k, v < 0])
        )
      : {};

  // Result banner text
  const banner = outcome
    ? outcome.net > 0
      ? `WIN  +$${outcome.net.toFixed(2)}`
      : outcome.net < 0
      ? `LOSS  -$${Math.abs(outcome.net).toFixed(2)}`
      : `PUSH`
    : null;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "16px 14px 60px",
        color: "var(--text)",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.16em" }}>BANKROLL</div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: bankroll >= 1000 ? "var(--accent)" : bankroll >= 500 ? "var(--warn)" : "var(--danger)",
            }}
          >
            ${bankroll.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.16em" }}>
            ROUND {stats.rounds + (phase === "betting" ? 1 : 0)}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
            <span style={{ color: "var(--accent)" }}>{stats.won}W</span> ·{" "}
            <span style={{ color: "var(--danger)" }}>{stats.lost}L</span> ·{" "}
            <span style={{ color: "var(--text-3)" }}>{stats.push}P</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowRules((r) => !r)}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: showRules ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "transparent",
              color: showRules ? "var(--accent)" : "var(--text-2)",
              fontFamily: "'Courier New', monospace",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            {showRules ? "HIDE RULES" : "HOW TO PLAY"}
          </button>
          <button
            onClick={resetBankroll}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-3)",
              fontFamily: "'Courier New', monospace",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Rules panel */}
      {showRules && (
        <div
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-2)",
          }}
        >
          <div style={{ color: "var(--accent)", fontWeight: 900, marginBottom: 8, fontSize: 14 }}>
            HOW BACCARAT WORKS
          </div>
          <div style={{ marginBottom: 6 }}>
            • Two hands are dealt: <b style={{ color: "#4aa3ff" }}>PLAYER</b> and{" "}
            <b style={{ color: "#ff8a4a" }}>BANKER</b>. You bet on which will be closer to 9.
          </div>
          <div style={{ marginBottom: 6 }}>
            • Card values: A=1, 2–9 = face value, 10/J/Q/K = 0. Hand total = sum mod 10
            (so 7+8=15 → 5).
          </div>
          <div style={{ marginBottom: 6 }}>
            • Each hand starts with 2 cards. A total of 8 or 9 is a &ldquo;natural&rdquo; — both stand.
          </div>
          <div style={{ marginBottom: 6 }}>
            • Otherwise, fixed third-card rules apply (Player draws on 0–5, Banker rule depends
            on Player&rsquo;s third card). Players never make decisions — Baccarat is a pure bet on
            the outcome.
          </div>
          <div style={{ marginTop: 10, color: "var(--warn)" }}>
            House edges: <b>Banker 1.06%</b> · <b>Player 1.24%</b> · <b>Tie ~14%</b> ·
            Pair side bets ~10%.
          </div>
        </div>
      )}

      {/* TABLE */}
      <div
        style={{
          background: "linear-gradient(135deg,#0a3a26 0%,#072e1c 100%)",
          border: "2px solid #1a5c3e",
          borderRadius: 18,
          padding: 18,
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        {/* Hands display */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          {/* PLAYER hand */}
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 10,
              padding: 14,
              border: `2px solid ${outcome?.result === "player" ? "var(--accent)" : "#1a5c3e"}`,
              minHeight: 130,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#4aa3ff", fontWeight: 900, letterSpacing: "0.12em" }}>
                PLAYER
              </span>
              <span
                style={{
                  background: "var(--bg)",
                  border: "1px solid #1a5c3e",
                  borderRadius: 6,
                  padding: "3px 10px",
                  color: "var(--text)",
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                {hands.player.length ? pT : "—"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, minHeight: 84 }}>
              {hands.player.map((c, i) => (
                <Card key={c.id} c={i < revealed.p ? c : null} hidden={i >= revealed.p} />
              ))}
            </div>
          </div>

          {/* VS */}
          <div
            style={{
              color: "#1a5c3e",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.1em",
              padding: "0 4px",
            }}
          >
            VS
          </div>

          {/* BANKER hand */}
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 10,
              padding: 14,
              border: `2px solid ${outcome?.result === "banker" ? "var(--accent)" : "#1a5c3e"}`,
              minHeight: 130,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#ff8a4a", fontWeight: 900, letterSpacing: "0.12em" }}>
                BANKER
              </span>
              <span
                style={{
                  background: "var(--bg)",
                  border: "1px solid #1a5c3e",
                  borderRadius: 6,
                  padding: "3px 10px",
                  color: "var(--text)",
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                {hands.banker.length ? bT : "—"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, minHeight: 84 }}>
              {hands.banker.map((c, i) => (
                <Card key={c.id} c={i < revealed.b ? c : null} hidden={i >= revealed.b} />
              ))}
            </div>
          </div>
        </div>

        {/* Result banner */}
        {banner && phase === "resolved" && (
          <div
            style={{
              textAlign: "center",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.18em",
              padding: "10px 0",
              marginBottom: 12,
              color: outcome.net > 0 ? "var(--accent)" : outcome.net < 0 ? "var(--danger)" : "var(--warn)",
              animation: "pop 0.35s ease",
            }}
          >
            {outcome.result.toUpperCase()} WINS · {banner}
            {(outcome.pPair || outcome.bPair) && (
              <span style={{ fontSize: 12, color: "var(--warn)", marginLeft: 12 }}>
                {outcome.pPair && "PLAYER PAIR! "}
                {outcome.bPair && "BANKER PAIR!"}
              </span>
            )}
          </div>
        )}

        {/* Side bet zones (pairs) */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <BetZone
            type="pPair"
            bet={bets.pPair || 0}
            onClick={() => placeBet("pPair")}
            onClear={() => clearBet("pPair")}
            winning={winningBets.pPair}
            losing={losingBets.pPair}
            size="sm"
          />
          <BetZone
            type="bPair"
            bet={bets.bPair || 0}
            onClick={() => placeBet("bPair")}
            onClear={() => clearBet("bPair")}
            winning={winningBets.bPair}
            losing={losingBets.bPair}
            size="sm"
          />
        </div>

        {/* Main bet zones */}
        <div style={{ display: "flex", gap: 10 }}>
          <BetZone
            type="player"
            bet={bets.player || 0}
            onClick={() => placeBet("player")}
            onClear={() => clearBet("player")}
            winning={winningBets.player}
            losing={losingBets.player}
          />
          <BetZone
            type="tie"
            bet={bets.tie || 0}
            onClick={() => placeBet("tie")}
            onClear={() => clearBet("tie")}
            winning={winningBets.tie}
            losing={losingBets.tie}
          />
          <BetZone
            type="banker"
            bet={bets.banker || 0}
            onClick={() => placeBet("banker")}
            onClear={() => clearBet("banker")}
            winning={winningBets.banker}
            losing={losingBets.banker}
          />
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-2)", textAlign: "center" }}>
          Click a zone to place your selected chip · Right-click a zone to clear it
        </div>
      </div>

      {/* CHIP RACK + ACTIONS */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {CHIPS.map((c) => (
            <Chip
              key={c.v}
              v={c.v}
              color={c.color}
              ring={c.ring}
              text={c.text}
              selected={chip === c.v}
              onClick={() => setChip(c.v)}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {phase === "betting" && (
            <>
              <button
                onClick={undoLast}
                disabled={betHistory.length === 0}
                style={btnStyle("var(--text-2)", betHistory.length === 0)}
              >
                UNDO
              </button>
              <button
                onClick={clearAll}
                disabled={totalBet === 0}
                style={btnStyle("var(--danger)", totalBet === 0)}
              >
                CLEAR
              </button>
              <button
                onClick={deal}
                disabled={totalBet === 0}
                style={{
                  ...btnStyle("var(--accent)", totalBet === 0),
                  background: totalBet > 0 ? "var(--accent)" : "transparent",
                  color: totalBet > 0 ? "var(--bg)" : "var(--border)",
                  fontSize: 14,
                  padding: "12px 24px",
                }}
              >
                DEAL ${totalBet}
              </button>
            </>
          )}
          {phase === "dealing" && (
            <div
              style={{
                padding: "12px 24px",
                color: "var(--text-2)",
                fontWeight: 900,
                letterSpacing: "0.12em",
              }}
            >
              DEALING…
            </div>
          )}
          {phase === "resolved" && (
            <button
              onClick={nextRound}
              style={{
                ...btnStyle("var(--accent)"),
                background: "var(--accent)",
                color: "var(--bg)",
                fontSize: 14,
                padding: "12px 24px",
              }}
            >
              NEXT ROUND
            </button>
          )}
        </div>
      </div>

      {/* COMMENTARY / EDUCATIONAL LOG */}
      <div
        style={{
          marginTop: 18,
          background: "var(--bg-elev)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 14,
          minHeight: 90,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.16em",
            marginBottom: 8,
          }}
        >
          COMMENTARY
        </div>
        {log.length === 0 ? (
          <div style={{ color: "var(--border)", fontSize: 13 }}>
            Place a bet and click DEAL to see how the round plays out.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {log.slice(0, logVisible).map((entry, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  color: "var(--text-2)",
                  borderLeft: "3px solid #1a5c3e",
                  paddingLeft: 10,
                  animation: "slideIn 0.3s ease",
                }}
              >
                {entry.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROAD / SHOE HISTORY */}
      <div
        style={{
          marginTop: 16,
          background: "var(--bg-elev)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.16em",
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>RESULT HISTORY</span>
          <span>SHOE: {Math.max(0, shoe.length - shoeIdx)} cards left</span>
        </div>
        {history.length === 0 ? (
          <div style={{ color: "var(--border)", fontSize: 13 }}>No rounds yet.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {history.map((h, i) => {
              const color =
                h.result === "P" ? "#4aa3ff" : h.result === "B" ? "#ff8a4a" : "var(--warn)";
              return (
                <div
                  key={i}
                  title={`Round ${i + 1}: ${h.result === "P" ? "Player" : h.result === "B" ? "Banker" : "Tie"} (P${h.pT} / B${h.bT})${h.pPair ? " · PP" : ""}${h.bPair ? " · BP" : ""}`}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "transparent",
                    border: `2px solid ${color}`,
                    color,
                    fontSize: 12,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {h.result}
                  {(h.pPair || h.bPair) && (
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        background: "var(--warn)",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes dealIn {
          from { opacity: 0; transform: translateY(-30px) rotate(-15deg) scale(0.7); }
          to   { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
        }
        @keyframes pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

const btnStyle = (color, disabled) => ({
  padding: "10px 18px",
  borderRadius: 6,
  border: `1px solid ${disabled ? "var(--border)" : color}`,
  background: "transparent",
  color: disabled ? "var(--border)" : color,
  fontFamily: "'Courier New', monospace",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: "0.12em",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.15s",
});
