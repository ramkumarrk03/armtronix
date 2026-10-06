"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CHANNELS,
  HERO_PHOTO,
  OUTPUT_LEDS,
  STATUS_LEDS,
  TERMINAL_STRIPS,
} from "@/data/heroBoard";
import {
  distanceToTrace,
  dropCrossings,
  pointAt,
  routeTrace,
  type Trace,
} from "@/lib/traceRouter";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { drawFrame, readPalette, type Palette } from "./drawTraces";
import { createSimState, PACKET_SPEED, TAG_LIFETIME } from "./useHeroSimulation";

const BOOT_KEY = "armtronix-booted";
const GROW_SPEED = 0.9; // px per ms while routing on power-on
type BootPhase = "off" | "booting" | "on";

type Readout = {
  title: string;
  lines: string[];
  x: number;
  y: number;
} | null;

export function HeroStage({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sim = useRef(createSimState());
  const traces = useRef<Trace[]>([]);
  const grown = useRef(new Map<string, number>());
  const hovered = useRef<string | null>(null);
  const probe = useRef<{ x: number; y: number } | null>(null);
  const palette = useRef<Palette | null>(null);
  const scaleRef = useRef(1);

  const [phase, setPhase] = useState<BootPhase>("off");
  const [outputs, setOutputs] = useState<boolean[]>(() => createSimState().outputs);
  const [readout, setReadout] = useState<Readout>(null);

  // --- Power-on sequence (once per session; instant for reduced motion) ---
  useEffect(() => {
    let booted = false;
    try {
      booted = sessionStorage.getItem(BOOT_KEY) === "1";
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
    const instant = reduced || booted;
    const t1 = window.setTimeout(() => setPhase(instant ? "on" : "booting"), instant ? 0 : 120);
    const t2 = instant ? 0 : window.setTimeout(() => setPhase("on"), 1500);
    return () => {
      window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
    };
  }, [reduced]);

  // --- Route traces from the photo's real terminal strips ---
  useEffect(() => {
    const section = sectionRef.current;
    const photo = photoRef.current;
    const canvas = canvasRef.current;
    if (!section || !photo || !canvas) return;

    function layout() {
      if (!section || !photo || !canvas) return;
      const sr = section.getBoundingClientRect();
      const pr = photo.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(sr.width * dpr);
      canvas.height = Math.round(sr.height * dpr);
      canvas.style.width = `${sr.width}px`;
      canvas.style.height = `${sr.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = pr.width / HERO_PHOTO.width;
      scaleRef.current = s;
      const ox = pr.left - sr.left;
      const oy = pr.top - sr.top;
      const map = (x: number, y: number) => ({ x: ox + x * s, y: oy + y * s });
      const narrow = sr.width < 768;
      const header = 56;

      const routed: Trace[] = [];
      for (const strip of TERMINAL_STRIPS) {
        for (let ch = 1; ch <= CHANNELS; ch++) {
          // six traces per strip on desktop, four on phones: enough to read as routing, not noise
          if (narrow ? ch % 3 !== 1 : ch % 2 === 0) continue;
          const k = (CHANNELS - ch) / (CHANNELS - 1);
          const raw = map(
            strip.from.x + (strip.to.x - strip.from.x) * k,
            strip.from.y + (strip.to.y - strip.from.y) * k,
          );
          const origin = {
            x: raw.x + strip.normal.x * 12 * s,
            y: raw.y + strip.normal.y * 12 * s,
          };
          const group = Math.floor((ch - 1) / 4);
          const stub = (54 + group * 14) * Math.max(s, 0.55);
          const isOut = strip.kind === "out";
          routed.push(
            routeTrace({
              kind: strip.kind,
              channel: ch,
              origin,
              normal: strip.normal,
              stub,
              turn: isOut ? { x: 0, y: -1 } : { x: 0, y: 1 },
              bounds: {
                minX: 0,
                minY: header + 26,
                maxX: sr.width,
                maxY: sr.height - 24,
              },
            }),
          );
        }
      }
      // drop traces whose via would sit flush against the viewport edge
      const inView = routed.filter((t) => {
        const end = t.points[t.points.length - 1];
        return end.x > 14 && end.x < sr.width - 14;
      });
      traces.current = dropCrossings(inView);
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(section);
    ro.observe(photo);
    return () => ro.disconnect();
  }, []);

  // --- Palette follows the theme switch ---
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      palette.current = readPalette(root);
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // --- Animation loop: grow traces, move packets, run the I/O mirror ---
  useEffect(() => {
    if (phase === "off") return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const bootStart = last;
    const state = sim.current;
    state.nextInputAt = last + (reduced ? Infinity : 1400);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(section);

    function spawnInput(now: number) {
      const inputs = traces.current.filter((t) => t.kind === "in");
      if (!inputs.length) return;
      const t = inputs[Math.floor(Math.random() * inputs.length)];
      state.packets.push({ traceId: t.id, dir: -1, d: 0, speed: PACKET_SPEED, channel: t.channel });
      state.nextInputAt = now + 1500 + Math.random() * 1400;
    }

    function arrive(p: (typeof state.packets)[number], now: number) {
      const idx = p.channel - 1;
      if (p.dir === -1) {
        // field input reached the board: flip input, mirror to output, publish
        state.inputs[idx] = !state.inputs[idx];
        state.outputs[idx] = state.inputs[idx];
        state.volts[idx] = 23.6 + Math.random() * 0.6;
        setOutputs([...state.outputs]);
        const out = traces.current.find((t) => t.kind === "out" && t.channel === p.channel);
        if (out) {
          state.packets.push({ traceId: out.id, dir: 1, d: 0, speed: PACKET_SPEED, channel: p.channel });
        }
      } else {
        const t = traces.current.find((tr) => tr.id === p.traceId);
        if (t) {
          const end = t.points[t.points.length - 1];
          state.tags.push({
            text: `ia009/out/${p.channel} → ${state.outputs[idx] ? 1 : 0}`,
            x: end.x,
            y: end.y,
            born: now,
          });
        }
      }
    }

    function tick(now: number) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(48, now - last);
      last = now;
      const c = canvas!;
      const pal = palette.current ?? readPalette(document.documentElement);

      // boot growth: traces route outward at constant speed, staggered by channel
      for (const t of traces.current) {
        if (reduced || phase === "on") {
          grown.current.set(t.id, t.total);
          continue;
        }
        const delay = (t.channel - 1) * 45 + (t.kind === "in" ? 160 : 0);
        grown.current.set(t.id, Math.max(0, (now - bootStart - delay) * GROW_SPEED));
      }

      if (now >= state.nextInputAt) spawnInput(now);

      for (const p of state.packets) p.d += p.speed * dt;
      const done = state.packets.filter((p) => {
        const t = traces.current.find((tr) => tr.id === p.traceId);
        return !t || p.d >= t.total;
      });
      if (done.length) {
        state.packets = state.packets.filter((p) => !done.includes(p));
        for (const p of done) arrive(p, now);
      }
      state.tags = state.tags.filter((tag) => now - tag.born < TAG_LIFETIME);

      ctx!.clearRect(0, 0, c.width, c.height);
      drawFrame({
        ctx: ctx!,
        traces: traces.current,
        grown: grown.current,
        packets: state.packets,
        tags: state.tags,
        hovered: hovered.current,
        probe: probe.current,
        now,
        palette: pal,
        scale: scaleRef.current,
      });

      raf = requestAnimationFrame(tick);
    }

    // rAF is already paused by the browser in background tabs; the
    // IntersectionObserver pauses it when the hero scrolls off-screen.
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [phase, reduced]);

  // --- Probe: snap to the nearest trace and read it like a scope probe ---
  function probeAt(clientX: number, clientY: number, target?: EventTarget | null) {
    const section = sectionRef.current;
    if (!section) return;
    // the foreground copy owns the pointer; probing only happens in the background
    if (target instanceof Element && target.closest("[data-hero-content]")) {
      hovered.current = null;
      probe.current = null;
      setReadout(null);
      return;
    }
    const r = section.getBoundingClientRect();
    const p = { x: clientX - r.left, y: clientY - r.top };
    let best: Trace | null = null;
    let bestD = 18;
    for (const t of traces.current) {
      const d = distanceToTrace(t, p);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    if (!best) {
      hovered.current = null;
      probe.current = null;
      setReadout(null);
      return;
    }
    // snap the probe tip onto the copper
    let snapD = 0;
    let snapBest = Infinity;
    for (let d = 0; d <= best.total; d += 3) {
      const q = pointAt(best, d);
      const dd = Math.hypot(q.x - p.x, q.y - p.y);
      if (dd < snapBest) {
        snapBest = dd;
        snapD = d;
      }
    }
    const tip = pointAt(best, snapD);
    hovered.current = best.id;
    probe.current = tip;
    const ch = best.channel;
    const s = sim.current;
    const nn = String(ch).padStart(2, "0");
    const boxX = Math.max(8, Math.min(tip.x + 18, r.width - 250));
    const boxY = tip.y + 18;
    setReadout(
      best.kind === "out"
        ? {
            title: `OUT${nn} · opto-isolated DO`,
            lines: [
              `state ${s.outputs[ch - 1] ? "1 · ON" : "0 · OFF"}  ·  24 V DC`,
              `pub armtronix/ia009/out/${ch}`,
            ],
            x: boxX,
            y: boxY,
          }
        : {
            title: `IN${nn} · opto-isolated DI`,
            lines: [
              `level ${s.inputs[ch - 1] ? `HIGH · ${s.volts[ch - 1].toFixed(1)} V` : "LOW · 0.0 V"}`,
              `sub armtronix/ia009/in/${ch}`,
            ],
            x: boxX,
            y: boxY,
          },
    );
  }

  const ledPct = (p: { x: number; y: number }) => ({
    left: `${(p.x / HERO_PHOTO.width) * 100}%`,
    top: `${(p.y / HERO_PHOTO.height) * 100}%`,
  });

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      data-phase={phase}
      onPointerMove={(e) => e.pointerType === "mouse" && probeAt(e.clientX, e.clientY, e.target)}
      onPointerDown={(e) => e.pointerType !== "mouse" && probeAt(e.clientX, e.clientY, e.target)}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        hovered.current = null;
        probe.current = null;
        setReadout(null);
      }}
      className="hero-stage relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-14"
    >
      {/* Real hardware: the IA009 on the bench */}
      <div
        ref={photoRef}
        className="hero-photo pointer-events-none absolute left-1/2 top-1/2 z-0 w-[160vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.55] sm:w-[120vw] sm:opacity-[0.34] lg:w-[min(1240px,96vw)]"
        style={{ aspectRatio: `${HERO_PHOTO.width} / ${HERO_PHOTO.height}` }}
      >
        <Image
          src={HERO_PHOTO.src}
          alt={HERO_PHOTO.alt}
          width={HERO_PHOTO.width}
          height={HERO_PHOTO.height}
          preload
          sizes="(min-width: 1024px) 96vw, 160vw"
          className="hero-photo-img h-full w-full select-none"
        />
        {STATUS_LEDS.map((p, i) => (
          <span
            key={`s${i}`}
            aria-hidden
            className="hero-led hero-led--status"
            data-on={phase !== "off" || undefined}
            style={{ ...ledPct(p), transitionDelay: `${180 + i * 140}ms` }}
          />
        ))}
        {OUTPUT_LEDS.map((p, i) => (
          <span
            key={`o${i}`}
            aria-hidden
            className="hero-led"
            data-on={(phase === "on" && outputs[i]) || undefined}
            style={ledPct(p)}
          />
        ))}
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-70"
      />

      {/* soft scrim so the foreground copy always reads cleanly over the bench */}
      <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0 z-[15]" />

      {readout && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-30 min-w-[220px] border border-signal/60 bg-bg/92 px-3 py-2 font-mono text-[11px] leading-[1.55] text-ink shadow-[0_0_24px_var(--signal-glow)]"
          style={{
            left: readout.x,
            top: readout.y,
          }}
        >
          <div className="mb-0.5 uppercase tracking-[0.12em] text-signal">{readout.title}</div>
          {readout.lines.map((l) => (
            <div key={l} className="text-ink-dim">
              {l}
            </div>
          ))}
          <div className="mt-1 text-[9.5px] uppercase tracking-[0.16em] text-ink-dim/80">
            probe · simulated
          </div>
        </div>
      )}

      <div className="relative z-20 flex flex-1 flex-col">{children}</div>
    </section>
  );
}
