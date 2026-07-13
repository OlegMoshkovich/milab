"use client";

import { useEffect, useState } from "react";

// Glyphs each letter rolls through before locking onto its target.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each letter rolls to a new random glyph
const SETTLE_STAGGER = 55; // extra delay before each successive letter locks
const BASE_FLIPS = 8; // minimum rolls every letter makes before it can settle

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

    let start: number | null = null;
    let lastFlip = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;

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

      if (elapsed < finishAt) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text); // snap everything to the final text
      }
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
