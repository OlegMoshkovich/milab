"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import styles from "./sound.module.css";

type Preset = {
  id: string;
  name: string;
  desc: string;
  dur: number;
  nLo: number;
  nHi: number;
  q: number;
  osc: OscillatorType | null;
  oLo: number;
  oHi: number;
  nVol: number;
  oVol: number;
  gap: number;
  detune?: boolean;
};

const PRESETS: Preset[] = [
  {
    id: "classic",
    name: "Solari classic",
    desc: "Balanced tick with a soft mechanical body. The current site sound.",
    dur: 0.035, nLo: 1200, nHi: 1900, q: 1.0,
    osc: "triangle", oLo: 300, oHi: 460, nVol: 0.22, oVol: 0.2, gap: 55,
  },
  {
    id: "soft",
    name: "Soft ticks",
    desc: "Quiet and high, no low body. Understated, reading-room calm.",
    dur: 0.02, nLo: 2000, nHi: 3000, q: 1.4,
    osc: null, oLo: 0, oHi: 0, nVol: 0.18, oVol: 0, gap: 72,
  },
  {
    id: "deep",
    name: "Deep clack",
    desc: "Punchy square-wave thock. A heavy departure-hall board.",
    dur: 0.05, nLo: 800, nHi: 1300, q: 0.8,
    osc: "square", oLo: 170, oHi: 260, nVol: 0.24, oVol: 0.28, gap: 60,
  },
  {
    id: "typewriter",
    name: "Typewriter",
    desc: "Sharp, bright, snappy. Mechanical keys more than flaps.",
    dur: 0.02, nLo: 2500, nHi: 3600, q: 1.6,
    osc: "triangle", oLo: 520, oHi: 700, nVol: 0.26, oVol: 0.12, gap: 45,
  },
  {
    id: "vintage",
    name: "Vintage board",
    desc: "Denser and warm, slightly detuned with a longer decay.",
    dur: 0.06, nLo: 900, nHi: 1500, q: 0.7,
    osc: "sawtooth", oLo: 210, oHi: 320, nVol: 0.2, oVol: 0.22, gap: 50,
    detune: true,
  },
];

const WORD = "machine intelligence";
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";
const FLIP = 45;
const STAGGER = 55;
const BASE = 8;

const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// --- Audio + animation live at module scope (impure / mutating calls belong
// outside the component render path). ---

type CtxRef = { current: AudioContext | null };
type NumRef = { current: number };

function ensureCtx(ctxRef: CtxRef): AudioContext {
  if (!ctxRef.current) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctxRef.current = new AudioCtx();
  }
  const ctx = ctxRef.current;
  // iOS routes Web Audio through the ringer switch unless we claim playback.
  const session = (navigator as unknown as { audioSession?: { type: string } })
    .audioSession;
  if (session) session.type = "playback";
  void ctx.resume();
  const unlock = ctx.createBufferSource();
  unlock.buffer = ctx.createBuffer(1, 1, 22050);
  unlock.connect(ctx.destination);
  unlock.start(0);
  return ctx;
}

function playClick(ctx: AudioContext, p: Preset, scale: number, master: number) {
  const t = ctx.currentTime;
  const vol = scale * master;

  // Noise tick.
  const frames = Math.max(1, Math.floor(ctx.sampleRate * p.dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = p.nLo + Math.random() * (p.nHi - p.nLo);
  band.Q.value = p.q;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(p.nVol * vol, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur);
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + p.dur);

  // Pitched body.
  if (p.osc) {
    const makeOsc = (offset: number) => {
      const osc = ctx.createOscillator();
      osc.type = p.osc as OscillatorType;
      const f0 = p.oLo + Math.random() * (p.oHi - p.oLo) + offset;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.6, t + p.dur);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(p.oVol * vol, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + p.dur);
    };
    makeOsc(0);
    if (p.detune) makeOsc(11);
  }
}

function runPreview(
  ctx: AudioContext,
  p: Preset,
  masterRef: NumRef,
  rafRef: NumRef,
  reduce: boolean,
  setBoard: Dispatch<SetStateAction<string>>,
) {
  cancelAnimationFrame(rafRef.current);
  const chars = [...WORD];
  const settleAt = chars.map((_, i) => BASE * FLIP + i * STAGGER);
  const finishAt = settleAt[settleAt.length - 1];

  if (reduce) {
    setBoard(WORD);
    let k = 0;
    const iv = window.setInterval(() => {
      if (k++ >= 8) {
        window.clearInterval(iv);
        playClick(ctx, p, 1.6, masterRef.current);
        return;
      }
      playClick(ctx, p, 1, masterRef.current);
    }, p.gap);
    return;
  }

  let start: number | null = null;
  let lastFlip = 0;
  let lastClick = 0;
  let settled = false;

  const step = (now: number) => {
    if (start === null) start = now;
    const elapsed = now - start;
    if (now - lastFlip >= FLIP) {
      lastFlip = now;
      setBoard(
        chars
          .map((c, i) => (c === " " ? " " : elapsed >= settleAt[i] ? c : rnd()))
          .join(""),
      );
    }
    if (elapsed < finishAt) {
      if (now - lastClick >= p.gap) {
        lastClick = now;
        playClick(ctx, p, 1, masterRef.current);
      }
      rafRef.current = requestAnimationFrame(step);
    } else if (!settled) {
      settled = true;
      setBoard(WORD);
      playClick(ctx, p, 1.6, masterRef.current);
    }
  };
  rafRef.current = requestAnimationFrame(step);
}

export default function SoundPage() {
  const [board, setBoard] = useState(WORD);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState("tap a sound below");

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef(0.8);
  const rafRef = useRef(0);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // rafRef holds the latest scheduled frame id; cancelling whatever is
    // pending at unmount is the intent, so reading .current here is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const select = (p: Preset) => {
    const ctx = ensureCtx(ctxRef);
    setSelected(p.id);
    setHint(p.name);
    runPreview(ctx, p, masterRef, rafRef, reduceRef.current, setBoard);
  };

  const picked = PRESETS.find((p) => p.id === selected);

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>miresearchlab · sound</p>
        <h1 className={styles.title}>Choose a flap sound</h1>
        <p className={styles.lede}>
          Tap a style to hear the board flip with it. Each one is generated
          live, using the same engine that runs on the site. When one feels right,
          tell me its name and I&rsquo;ll wire it in.
        </p>

        <div className={styles.board} aria-hidden="true">
          <div className={styles.boardText}>{board}</div>
          <div className={styles.boardHint}>{hint}</div>
        </div>

        <label className={styles.volume}>
          vol
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={80}
            aria-label="Preview volume"
            onChange={(e) => {
              masterRef.current = Number(e.target.value) / 100;
            }}
          />
        </label>

        <div className={styles.list} role="radiogroup" aria-label="Flap sound styles">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.preset}
              role="radio"
              aria-checked={selected === p.id}
              aria-label={`${p.name}: ${p.desc}`}
              onClick={() => select(p)}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.meta}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.desc}>{p.desc}</span>
              </span>
              <span className={styles.play} aria-hidden="true">
                <span className={styles.tri} />
                play
              </span>
            </button>
          ))}
        </div>

        <div className={styles.pick}>
          {picked ? (
            <>
              Your pick: <b>{picked.name}</b>. Tell me{" "}
              <code>use {picked.name}</code>{" "}
              and I&rsquo;ll set it on the site.
            </>
          ) : (
            "No sound picked yet. Tap one above to preview it."
          )}
        </div>

        <p className={styles.foot}>
          Audio starts on your first tap (browsers require it).
          <br />
          On iPhone: if it&rsquo;s silent, flick the ring/silent switch off.
        </p>
      </div>
    </main>
  );
}
