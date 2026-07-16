"use client";

import { useEffect, useRef, useState } from "react";

// Glyphs each letter rolls through before locking onto its target.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each letter rolls to a new random glyph
const SETTLE_STAGGER = 55; // extra delay before each successive letter locks
const BASE_FLIPS = 8; // minimum rolls every letter makes before it can settle
const CLICK_GAP = 72; // min gap between clatter clicks while scrambling

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// The flaps should clatter only when the visitor first lands directly on the
// home page, and stay still on client-side navigation back to it. This flag
// resets on a hard load; the entry path is stamped on window by the pre-paint
// script in the layout.
let flapPlayed = false;

// "Soft ticks": a short, quiet, high noise burst through a band-pass filter,
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

// Claim the "playback" audio session (so iOS ignores the silent switch),
// resume, and play a silent tick to fully unlock. Module scope keeps the
// mutation out of the component render path.
function primeContext(ctx: AudioContext) {
  const session = (navigator as unknown as { audioSession?: { type: string } })
    .audioSession;
  if (session) session.type = "playback";
  void ctx.resume();
  const unlock = ctx.createBufferSource();
  unlock.buffer = ctx.createBuffer(1, 1, 22050);
  unlock.connect(ctx.destination);
  unlock.start(0);
}

export default function SplitFlap({
  landing,
  idle,
}: {
  landing: string;
  idle: string;
}) {
  // Decide once, at mount: the flap animation only plays when the visitor loads
  // the home page directly (its entry page). On any later visit, reached by
  // navigating back to home, the wordmark shows the idle text with no clatter.
  const [mode] = useState<"landing" | "idle">(() => {
    if (typeof window === "undefined") return "landing"; // SSR == direct home load
    const entry = (window as unknown as { __miEntry?: string }).__miEntry;
    return !flapPlayed && entry === "/" ? "landing" : "idle";
  });
  const activeText = mode === "landing" ? landing : idle;

  // Seed to the settled text so SSR and the idle case render it directly; a
  // landing mount then scrambles from it inside the effect.
  const [display, setDisplay] = useState(activeText);
  const [runId, setRunId] = useState(0); // bump to replay the animation
  const ctxRef = useRef<AudioContext | null>(null);

  // Click anywhere (except a link) to unlock audio and replay the animation.
  // Browsers block audio until a user gesture, so this doubles as the unlock.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && target.closest("a, button")) return; // let links behave
      if (!ctxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctxRef.current = new AudioCtx();
      }
      primeContext(ctxRef.current);
      setRunId((n) => n + 1);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    // Once a landing mount has happened this load, later mounts stay idle.
    if (mode === "landing") flapPlayed = true;
    // The initial idle render has nothing to animate; keep the static text.
    // A click (runId > 0) still replays the current text.
    if (runId === 0 && mode === "idle") return;

    // Each letter locks a little later than the one before it, so the line
    // settles left-to-right like an airport departure board.
    const chars = [...activeText];
    const settleAt = chars.map(
      (_, i) => BASE_FLIPS * FLIP_INTERVAL + i * SETTLE_STAGGER,
    );
    const finishAt = settleAt[settleAt.length - 1] ?? 0;

    let cycleStart: number | null = null;
    let lastFlip = 0;
    let lastClick = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (cycleStart === null) cycleStart = now;
      const elapsed = now - cycleStart;

      if (elapsed >= finishAt) {
        setDisplay(activeText); // rest on the settled line
        const ctx = ctxRef.current;
        if (ctx) playClick(ctx, 0.3); // firmer tick as the line locks in
        return;
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

      const ctx = ctxRef.current;
      if (ctx && now - lastClick >= CLICK_GAP) {
        lastClick = now;
        playClick(ctx, 0.18); // soft clatter while flipping
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, activeText, runId]);

  return (
    <p className="title" aria-label={activeText}>
      {display}
    </p>
  );
}
