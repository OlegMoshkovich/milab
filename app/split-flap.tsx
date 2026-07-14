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
const STING_SRC = "/board-sting.wav"; // played once as each message scrambles
const STING_VOLUME = 0.85;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

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
  const stingRef = useRef<AudioBuffer | null>(null); // decoded WAV
  const stingLoading = useRef(false);
  const playingRef = useRef<AudioBufferSourceNode | null>(null);
  const firstPlayedRef = useRef(false); // has the sting played once since unlock

  // Create/resume the audio context and load the sting. From a user gesture.
  const unlockAudio = () => {
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    primeContext(ctx);

    // Play the sting once as immediate feedback for this first unlock.
    const firstPlay = () => {
      if (firstPlayedRef.current) return;
      if (playSting()) firstPlayedRef.current = true;
    };

    // Fetch + decode the sting once, then give feedback.
    if (!stingRef.current && !stingLoading.current) {
      stingLoading.current = true;
      fetch(STING_SRC)
        .then((r) => r.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf))
        .then((decoded) => {
          stingRef.current = decoded;
          firstPlay();
        })
        .catch(() => {
          stingLoading.current = false; // allow a retry on next unlock
        });
    } else {
      firstPlay();
    }
  };

  const stopSting = () => {
    if (playingRef.current) {
      try {
        playingRef.current.stop();
      } catch {
        // already stopped
      }
      playingRef.current = null;
    }
  };

  // Play the sting once. Returns false if it isn't ready/enabled yet.
  const playSting = () => {
    const ctx = ctxRef.current;
    const buffer = stingRef.current;
    if (!ctx || !buffer || !soundOnRef.current) return false;
    stopSting(); // no overlap — restart cleanly for the new message
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = STING_VOLUME;
    src.connect(gain).connect(ctx.destination);
    src.onended = () => {
      if (playingRef.current === src) playingRef.current = null;
    };
    src.start();
    playingRef.current = src;
    return true;
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      soundOnRef.current = next;
      if (next) unlockAudio();
      else stopSting();
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
    let stingStarted = false; // has this message's sting played yet?
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
        stingStarted = false;
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

      // Play the sting once as the message begins scrambling. If audio isn't
      // unlocked/loaded yet, keep trying on later frames until it fires.
      if (scrambling && !stingStarted) {
        stingStarted = playSting();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
