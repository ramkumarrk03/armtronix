"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Ambient PCB layer for section backgrounds: procedurally routed copper
 * traces, IC footprints and vias at very low contrast, with occasional
 * amber pulses travelling along them. Static layer is rendered once to an
 * offscreen canvas; each frame only draws the pulses. Paused off-screen,
 * static under reduced motion.
 */

type Pt = { x: number; y: number };
type Path = { pts: Pt[]; lens: number[]; total: number };
type Pulse = { path: number; d: number };

const CELL = 24;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRS: Pt[] = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
];

function build(w: number, h: number, seed: number, density: number) {
  const rnd = mulberry32(seed);
  const cols = Math.ceil(w / CELL) + 1;
  const rows = Math.ceil(h / CELL) + 1;
  const used = new Uint8Array(cols * rows);
  const take = (c: number, r: number) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
    const i = r * cols + c;
    if (used[i]) return false;
    used[i] = 1;
    return true;
  };

  // IC footprints first so traces route around them
  const chips: { x: number; y: number; w: number; h: number; pins: number }[] = [];
  const chipCount = Math.round((w * h) / 260000 * density);
  for (let k = 0; k < chipCount; k++) {
    const cw = 3 + Math.floor(rnd() * 3);
    const ch = 2 + Math.floor(rnd() * 2);
    const c0 = Math.floor(rnd() * (cols - cw - 2)) + 1;
    const r0 = Math.floor(rnd() * (rows - ch - 2)) + 1;
    let free = true;
    for (let c = c0 - 1; c <= c0 + cw && free; c++) for (let r = r0 - 1; r <= r0 + ch; r++) if (used[r * cols + c]) free = false;
    if (!free) continue;
    for (let c = c0; c < c0 + cw; c++) for (let r = r0; r < r0 + ch; r++) used[r * cols + c] = 1;
    chips.push({ x: c0 * CELL, y: r0 * CELL, w: (cw - 1) * CELL, h: (ch - 1) * CELL, pins: cw * 2 });
  }

  const paths: Path[] = [];
  const traceCount = Math.round((w * h) / 22000 * density);
  for (let k = 0; k < traceCount; k++) {
    let c = Math.floor(rnd() * cols);
    let r = Math.floor(rnd() * rows);
    if (!take(c, r)) continue;
    let dir = Math.floor(rnd() * 4) * 2; // start orthogonal
    const pts: Pt[] = [{ x: c * CELL, y: r * CELL }];
    const segments = 2 + Math.floor(rnd() * 4);
    for (let s = 0; s < segments; s++) {
      const len = 2 + Math.floor(rnd() * (dir % 2 ? 3 : 9));
      let moved = 0;
      for (let i = 0; i < len; i++) {
        const nc = c + DIRS[dir].x;
        const nr = r + DIRS[dir].y;
        if (!take(nc, nr)) break;
        c = nc;
        r = nr;
        moved++;
      }
      if (moved === 0) break;
      pts.push({ x: c * CELL, y: r * CELL });
      // turn 45° left or right: PCB-style bends
      dir = (dir + (rnd() < 0.5 ? 1 : 7)) % 8;
    }
    if (pts.length < 2) continue;
    const lens = [0];
    for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    if (lens[lens.length - 1] < CELL * 4) continue;
    paths.push({ pts, lens, total: lens[lens.length - 1] });
  }
  return { paths, chips };
}

function at(p: Path, d: number): Pt {
  for (let i = 1; i < p.pts.length; i++) {
    if (d <= p.lens[i]) {
      const k = (d - p.lens[i - 1]) / (p.lens[i] - p.lens[i - 1] || 1);
      return { x: p.pts[i - 1].x + (p.pts[i].x - p.pts[i - 1].x) * k, y: p.pts[i - 1].y + (p.pts[i].y - p.pts[i - 1].y) * k };
    }
  }
  return p.pts[p.pts.length - 1];
}

type Props = {
  seed?: number;
  /** Relative amount of routing; 1 = default. */
  density?: number;
  className?: string;
};

export function TraceField({ seed = 7, density = 1, className = "" }: Props) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let paths: Path[] = [];
    let staticLayer: HTMLCanvasElement | null = null;
    let pulses: Pulse[] = [];
    let raf = 0;
    let visible = false;
    let last = 0;
    let nextSpawn = 0;
    let colors = { copper: "#c8794a", signal: "#ffb000" };
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = { copper: cs.getPropertyValue("--copper").trim(), signal: cs.getPropertyValue("--signal").trim() };
    };

    function renderStatic(chips: ReturnType<typeof build>["chips"]) {
      staticLayer = document.createElement("canvas");
      staticLayer.width = Math.round(W * dpr);
      staticLayer.height = Math.round(H * dpr);
      const s = staticLayer.getContext("2d")!;
      s.scale(dpr, dpr);
      s.strokeStyle = colors.copper;
      s.lineCap = "round";
      s.lineJoin = "round";
      s.globalAlpha = 0.16;
      s.lineWidth = 1;
      for (const p of paths) {
        s.beginPath();
        s.moveTo(p.pts[0].x, p.pts[0].y);
        for (const q of p.pts.slice(1)) s.lineTo(q.x, q.y);
        s.stroke();
        for (const end of [p.pts[0], p.pts[p.pts.length - 1]]) {
          s.beginPath();
          s.arc(end.x, end.y, 2.4, 0, Math.PI * 2);
          s.stroke();
        }
      }
      s.globalAlpha = 0.12;
      for (const c of chips) {
        s.strokeRect(c.x, c.y, c.w, c.h);
        const step = c.w / (c.pins / 2 + 1);
        for (let i = 1; i <= c.pins / 2; i++) {
          s.beginPath();
          s.moveTo(c.x + i * step, c.y);
          s.lineTo(c.x + i * step, c.y - 5);
          s.moveTo(c.x + i * step, c.y + c.h);
          s.lineTo(c.x + i * step, c.y + c.h + 5);
          s.stroke();
        }
        s.beginPath();
        s.arc(c.x + 6, c.y + 6, 1.6, 0, Math.PI * 2);
        s.stroke();
      }
    }

    function layout() {
      const r = host!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      // Host can measure 0×0 (first layout, hidden, HMR remount). A 0-sized
      // canvas can't be drawn, so wait for the ResizeObserver to report a real size.
      if (W < 1 || H < 1) {
        staticLayer = null;
        paths = [];
        pulses = [];
        return;
      }
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      readColors();
      const built = build(W, H, seed, density);
      paths = built.paths;
      pulses = [];
      renderStatic(built.chips);
      draw(performance.now());
    }

    function draw(now: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      if (staticLayer && staticLayer.width > 0 && staticLayer.height > 0) ctx!.drawImage(staticLayer, 0, 0);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const p of pulses) {
        const path = paths[p.path];
        for (let k = 0; k < 8; k++) {
          const q = at(path, Math.max(0, p.d - k * 4));
          ctx!.globalAlpha = 0.55 * (1 - k / 8);
          ctx!.fillStyle = colors.signal;
          ctx!.fillRect(q.x - 1.5, q.y - 1.5, 3, 3);
        }
      }
      ctx!.globalAlpha = 1;
      void now;
    }

    function tick(now: number) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(48, now - (last || now));
      last = now;
      if (!paths.length) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (now > nextSpawn && pulses.length < 7) {
        pulses.push({ path: Math.floor(Math.random() * paths.length), d: 0 });
        nextSpawn = now + 350 + Math.random() * 700;
      }
      for (const p of pulses) p.d += 0.11 * dt;
      pulses = pulses.filter((p) => p.d < paths[p.path].total + 32);
      draw(now);
      raf = requestAnimationFrame(tick);
    }

    layout();
    const ro = new ResizeObserver(() => layout());
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduced;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(host);
    const mo = new MutationObserver(() => layout());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, [seed, density, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`trace-field pointer-events-none absolute inset-0 -z-10 ${className}`}
    />
  );
}
