"use client";

import { useEffect, useState } from "react";

// Glyphs each letter rolls through before locking onto its target.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each letter rolls to a new random glyph
const SETTLE_STAGGER = 55; // extra delay before each successive letter locks
const BASE_FLIPS = 8; // minimum rolls every letter makes before it can settle
const HOLD_MS = 1800; // pause on the finished text before cycling again

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export default function SplitFlap({ text }: { text: string }) {
  // Seed deterministically so the server-rendered HTML matches the first
  // client render, then start cycling on mount inside the effect.
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const chars = [...text];
    // Each letter locks a little later than the one before it, so the line
    // settles left-to-right like an airport departure board.
    const settleAt = chars.map(
      (_, i) => BASE_FLIPS * FLIP_INTERVAL + i * SETTLE_STAGGER,
    );
    const finishAt = settleAt[settleAt.length - 1] ?? 0;
    // One full loop: scramble + settle, then hold on the text, then repeat.
    const cycleLen = finishAt + HOLD_MS;

    let cycleStart: number | null = null;
    let lastFlip = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (cycleStart === null) cycleStart = now;
      let elapsed = now - cycleStart;
      if (elapsed >= cycleLen) {
        // Start a fresh scramble.
        cycleStart = now;
        elapsed = 0;
        lastFlip = 0;
      }

      if (now - lastFlip >= FLIP_INTERVAL) {
        lastFlip = now;
        setDisplay(
          chars
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (elapsed >= settleAt[i]) return ch;
              return randomGlyph();
            })
            .join(""),
        );
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <p className="title" aria-label={text}>
      {display}
    </p>
  );
}
