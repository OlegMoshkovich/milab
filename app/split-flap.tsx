"use client";

import { useEffect, useState } from "react";

// Characters each flap cycles through before locking onto its target glyph.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each flap rolls to a new random glyph
const SETTLE_STAGGER = 120; // extra delay before each successive column locks
const BASE_FLIPS = 8; // minimum rolls every column makes before it can settle

const randomGlyph = () =>
  GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export default function SplitFlap({ text }: { text: string }) {
  const target = text.toUpperCase();
  // Seed deterministically so the server-rendered HTML matches the first
  // client render (blanks), then scramble on mount inside the effect.
  const [display, setDisplay] = useState<string[]>(() =>
    [...target].map(() => " "),
  );

  useEffect(() => {
    const chars = [...target];
    // Each column locks a little later than the one before it, so the board
    // settles left-to-right like a real airport departure sign.
    const settleAt = chars.map(
      (_, i) => BASE_FLIPS * FLIP_INTERVAL + i * SETTLE_STAGGER,
    );
    const finishAt = settleAt[settleAt.length - 1] ?? 0;

    let start: number | null = null;
    let lastFlip = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;

      if (now - lastFlip >= FLIP_INTERVAL) {
        lastFlip = now;
        setDisplay(
          chars.map((ch, i) => {
            if (ch === " ") return " ";
            if (elapsed >= settleAt[i]) return ch;
            return randomGlyph();
          }),
        );
      }

      if (elapsed < finishAt) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(chars); // snap everything to the final text
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span className="split-flap" role="img" aria-label={text}>
      {display.map((ch, i) => (
        <span key={i} className="split-flap__cell" aria-hidden="true">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
