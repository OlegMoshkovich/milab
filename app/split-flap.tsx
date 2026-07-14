"use client";

import { useEffect, useRef, useState } from "react";

// Glyphs each letter rolls through before locking onto its target.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each letter rolls to a new random glyph
const SETTLE_STAGGER = 55; // extra delay before each successive letter locks
const BASE_FLIPS = 8; // minimum rolls every letter makes before it can settle
const HOLD_MS = 1800; // pause on a finished message before the next one
const LAST_HOLD_MS = 3000; // longer pause on the last message before repeating
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

export default function SplitFlap({ messages }: { messages: string[] }) {
  // Seed deterministically so the server-rendered HTML matches the first
  // client render, then start cycling on mount inside the effect.
  const [display, setDisplay] = useState(messages[0] ?? "");
  // Off by default; turning it on is itself the unlocking user gesture.
  const [soundOn, setSoundOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(false); // read inside rAF without re-running effect

  // Create/resume the audio context. Must be called from a user gesture.
  const unlockAudio = () => {
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    primeContext(ctxRef.current);
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      soundOnRef.current = next;
      if (next) unlockAudio();
      return next;
    });
  };

  useEffect(() => {
    // Each letter locks a little later than the one before it, so a message
    // settles left-to-right like an airport departure board.
    const timings = (msg: string) => {
      const chars = [...msg];
      const settleAt = chars.map(
        (_, i) => BASE_FLIPS * FLIP_INTERVAL + i * SETTLE_STAGGER,
      );
      return { chars, settleAt, finishAt: settleAt[settleAt.length - 1] ?? 0 };
    };

    let msgIndex = 0;
    let cyclesDone = 0; // full passes through the message list
    let { chars, settleAt, finishAt } = timings(messages[0] ?? "");

    let cycleStart: number | null = null;
    let lastFlip = 0;
    let lastClick = 0;
    let settleClicked = false;
    let raf = 0;

    const tick = (now: number) => {
      if (cycleStart === null) cycleStart = now;
      let elapsed = now - cycleStart;
      // One run: scramble + settle, hold on the text, then advance to the
      // next message. The last message holds longer before the cycle
      // repeats; after the second full cycle, stop on the last message.
      const hold = msgIndex >= messages.length - 1 ? LAST_HOLD_MS : HOLD_MS;
      if (elapsed >= finishAt + hold) {
        if (msgIndex >= messages.length - 1) {
          cyclesDone += 1;
          if (cyclesDone >= 2) {
            setDisplay(messages[msgIndex]);
            return; // no more frames — rest on the last message
          }
        }
        msgIndex = (msgIndex + 1) % messages.length;
        ({ chars, settleAt, finishAt } = timings(messages[msgIndex]));
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
  }, [messages]);

  return (
    <>
      <p className="title" aria-label={messages.join(", ")}>
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
