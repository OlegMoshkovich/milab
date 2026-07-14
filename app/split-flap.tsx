"use client";

import { useEffect, useRef, useState } from "react";

// Glyphs each letter rolls through before locking onto its target.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Timing (ms).
const FLIP_INTERVAL = 45; // how fast each letter rolls to a new random glyph
const SETTLE_STAGGER = 55; // extra delay before each successive letter locks
const BASE_FLIPS = 8; // minimum rolls every letter makes before it can settle
const HOLD_MS = 1800; // pause on the finished text before cycling again
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
  // On by default; browsers still won't emit sound until the first user
  // gesture, so we auto-unlock on that gesture (see the effect below).
  const [soundOn, setSoundOn] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(true); // read inside rAF without re-running effect
  const stingRef = useRef<AudioBuffer | null>(null); // decoded WAV
  const stingLoading = useRef(false);
  const playingRef = useRef<AudioBufferSourceNode | null>(null);
  const unlockedRef = useRef(false); // has a gesture unlocked audio yet
  const firstPlayedRef = useRef(false); // has the sting played once since unlock
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  // Create/resume the audio context and load the sting. From a user gesture.
  const unlockAudio = () => {
    unlockedRef.current = true;
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
    // Sound is on by default but blocked until a gesture, so the first click
    // on the toggle should START it (unlock + keep on), not mute it.
    if (!unlockedRef.current) {
      soundOnRef.current = true;
      setSoundOn(true);
      unlockAudio();
      return;
    }
    setSoundOn((prev) => {
      const next = !prev;
      soundOnRef.current = next;
      if (next) unlockAudio();
      else stopSting();
      return next;
    });
  };

  // Sound is on by default: unlock playback on the first user interaction
  // anywhere on the page. The toggle button handles its own first click
  // (see toggleSound), so ignore events originating from it here.
  useEffect(() => {
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const kick = (e: Event) => {
      const target = e.target as Node | null;
      if (toggleBtnRef.current && target && toggleBtnRef.current.contains(target)) {
        return; // let the toggle's onClick unlock it
      }
      if (!unlockedRef.current && soundOnRef.current) unlockAudio();
      events.forEach((ev) => document.removeEventListener(ev, kick));
    };
    events.forEach((ev) =>
      document.addEventListener(ev, kick, { passive: true }),
    );
    return () => events.forEach((ev) => document.removeEventListener(ev, kick));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    let { chars, settleAt, finishAt } = timings(messages[0] ?? "");

    let cycleStart: number | null = null;
    let lastFlip = 0;
    let stingStarted = false; // has this message's sting played yet?
    let raf = 0;

    const tick = (now: number) => {
      if (cycleStart === null) cycleStart = now;
      let elapsed = now - cycleStart;
      // One run: scramble + settle, hold on the text, then advance to the
      // next message, cycling through them continuously.
      if (elapsed >= finishAt + HOLD_MS) {
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
        ref={toggleBtnRef}
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
