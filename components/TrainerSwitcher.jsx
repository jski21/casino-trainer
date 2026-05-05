"use client";

import { useEffect, useState, useCallback } from "react";
import BlackjackTrainer from "@/components/BlackjackTrainer";
import PokerTrainer from "@/components/PokerTrainer";
import BaccaratTrainer from "@/components/BaccaratTrainer";

const TRAINERS = [
  { id: "blackjack", label: "BLACKJACK" },
  { id: "poker", label: "POKER" },
  { id: "baccarat", label: "BACCARAT" },
];
const ACTIVE_KEY = "casino_trainer_active";
const THEME_KEY = "casino_trainer_theme";

const getInitial = (key, fallback, allowed) => {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key);
  if (allowed && !allowed.includes(v)) return fallback;
  return v ?? fallback;
};

export default function TrainerSwitcher() {
  const [active, setActive] = useState(() =>
    getInitial(ACTIVE_KEY, "blackjack", TRAINERS.map((t) => t.id)),
  );
  const [theme, setTheme] = useState(() => getInitial(THEME_KEY, "dark", ["light", "dark"]));

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_KEY, active);
  }, [active]);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--shell-bg)",
        color: "var(--text)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(10px)",
          background:
            theme === "dark"
              ? "rgba(7, 12, 10, 0.85)"
              : "rgba(241, 245, 242, 0.85)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "'Courier New', monospace",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "var(--accent)",
                color: "var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: "0.05em",
              }}
            >
              ♠
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: "0.18em",
                color: "var(--text)",
              }}
            >
              CASINO TRAINER
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div
              role="tablist"
              style={{
                display: "flex",
                gap: 2,
                background: "var(--bg-elev)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 3,
              }}
            >
              {TRAINERS.map((t) => {
                const sel = active === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={sel}
                    onClick={() => setActive(t.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      background: sel ? "var(--accent)" : "transparent",
                      color: sel ? "var(--bg)" : "var(--text-3)",
                      fontFamily: "'Courier New', monospace",
                      fontWeight: 900,
                      fontSize: 12,
                      letterSpacing: "0.12em",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-elev)",
                color: "var(--text-2)",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {active === "blackjack" && <BlackjackTrainer />}
        {active === "poker" && <PokerTrainer />}
        {active === "baccarat" && <BaccaratTrainer />}
      </main>
    </div>
  );
}
