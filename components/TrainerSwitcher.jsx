"use client";

import { useEffect, useState } from "react";
import BlackjackTrainer from "@/components/BlackjackTrainer";
import PokerTrainer from "@/components/PokerTrainer";
import BaccaratTrainer from "@/components/BaccaratTrainer";

const TRAINERS = [
  { id: "blackjack", label: "BLACKJACK TRAINER" },
  { id: "poker", label: "POKER TRAINER" },
  { id: "baccarat", label: "BACCARAT SIMULATOR" },
];
const ACTIVE_TRAINER_STORAGE_KEY = "casino_trainer_active";

export default function TrainerSwitcher() {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return "blackjack";
    const saved = window.localStorage.getItem(ACTIVE_TRAINER_STORAGE_KEY);
    return TRAINERS.some((t) => t.id === saved) ? saved : "blackjack";
  });

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_TRAINER_STORAGE_KEY, active);
  }, [active]);

  return (
    <div style={{ minHeight: "100vh", background: "#070c0a" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
          background: "rgba(7, 12, 10, 0.92)",
          borderBottom: "1px solid #1a2e1e",
          padding: "10px 12px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            color: "#9bb3a6",
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Choose Trainer
        </div>
        <div
          style={{
            display: "flex",
            gap: 5,
            background: "#0d1810",
            borderRadius: 8,
            padding: 3,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {TRAINERS.map((trainer) => {
            const selected = active === trainer.id;
            return (
              <button
                key={trainer.id}
                onClick={() => setActive(trainer.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: selected ? "#4fffb0" : "transparent",
                  color: selected ? "#070c0a" : "#778a80",
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 900,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                  transition: "all 0.2s",
                }}
              >
                {trainer.label}
              </button>
            );
          })}
        </div>
      </div>

      {active === "blackjack" && <BlackjackTrainer />}
      {active === "poker" && <PokerTrainer />}
      {active === "baccarat" && <BaccaratTrainer />}
    </div>
  );
}
