"use client";

import { useEffect, useRef, useState } from "react";

// Glyphs each letter rolls through before locking onto its target.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each letter rolls to a new random glyph
const SETTLE_STAGGER = 55; // extra delay before each successive letter locks
const BASE_FLIPS = 8; // minimum rolls every letter makes before it can settle
const HOLD_MS = 1800; // pause on the finished text before cycling again
const CLICK_GAP = 72; // min gap between clatter clicks while scrambling

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// "Soft ticks" — a short, quiet, high noise burst through a band-pass filter,
// no low body. Randomized pitch makes a run sound like many gentle flaps.
function playClick(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const dur = 0.02;

  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2000 + Math.random() * 1000;
  band.Q.value = 1.4;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + dur);
}

export default function SplitFlap({ text }: { text: string }) {
  // Seed deterministically so the server-rendered HTML matches the first
  // client render, then start cycling on mount inside the effect.
  const [display, setDisplay] = useState(text);
  const [soundOn, setSoundOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(false); // read inside rAF without re-running effect

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      soundOnRef.current = next;
      if (next) {
        if (!ctxRef.current) {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          ctxRef.current = new AudioCtx();
        }
        const ctx = ctxRef.current;
        // iOS routes Web Audio through the ringer (silent) switch by default;
        // asking for the "playback" session lets it sound even when muted.
        const audioSession = (
          navigator as unknown as { audioSession?: { type: string } }
        ).audioSession;
        if (audioSession) audioSession.type = "playback";
        // Unlock — resume plus a silent tick, both inside the tap gesture.
        void ctx.resume();
        const unlock = ctx.createBufferSource();
        unlock.buffer = ctx.createBuffer(1, 1, 22050);
        unlock.connect(ctx.destination);
        unlock.start(0);
      }
      return next;
    });
  };

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
    let lastClick = 0;
    let settleClicked = false;
    let raf = 0;

    const tick = (now: number) => {
      if (cycleStart === null) cycleStart = now;
      let elapsed = now - cycleStart;
      if (elapsed >= cycleLen) {
        // Start a fresh scramble.
        cycleStart = now;
        elapsed = 0;
        lastFlip = 0;
        settleClicked = false;
      }

      const scrambling = elapsed < finishAt;

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

      const ctx = ctxRef.current;
      if (soundOnRef.current && ctx) {
        if (scrambling) {
          if (now - lastClick >= CLICK_GAP) {
            lastClick = now;
            playClick(ctx, 0.18); // soft clatter while flipping
          }
        } else if (!settleClicked) {
          settleClicked = true;
          playClick(ctx, 0.3); // slightly firmer tick as the line locks in
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <>
      <p className="title" aria-label={text}>
        {display}
      </p>
      <button
        type="button"
        className="sound-toggle"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
      >
        {soundOn ? "◉ sound on" : "◯ sound off"}
      </button>
    </>
  );
}
