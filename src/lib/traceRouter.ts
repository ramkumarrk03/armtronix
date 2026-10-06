import type { Point } from "@/data/heroBoard";

/**
 * A tiny PCB-style router: every trace leaves its terminal on a 45° stub,
 * then turns onto an orthogonal run until it reaches a boundary. Traces in a
 * bus are staggered so they never cross, which is how a human would lay
 * out a fan-out on a real board.
 */

export type Trace = {
  id: string;
  kind: "out" | "in";
  channel: number; // 1..12
  points: Point[];
  /** Cumulative length at each point (same length as points). */
  lengths: number[];
  total: number;
};

export type RouteRequest = {
  kind: "out" | "in";
  channel: number;
  origin: Point;
  normal: Point;
  stub: number;
  turn: Point; // unit orthogonal direction after the stub
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** Optional hard stop for the orthogonal run (via pad position). */
  stopAt?: number;
};

const SNAP = 2;
const snap = (v: number) => Math.round(v / SNAP) * SNAP;

function distanceToBoundary(p: Point, dir: Point, b: RouteRequest["bounds"]) {
  const ts: number[] = [];
  if (dir.x > 0) ts.push((b.maxX - p.x) / dir.x);
  if (dir.x < 0) ts.push((b.minX - p.x) / dir.x);
  if (dir.y > 0) ts.push((b.maxY - p.y) / dir.y);
  if (dir.y < 0) ts.push((b.minY - p.y) / dir.y);
  return Math.max(0, Math.min(...ts));
}

export function routeTrace(req: RouteRequest): Trace {
  const a = { x: snap(req.origin.x), y: snap(req.origin.y) };
  const b = {
    x: snap(a.x + req.normal.x * req.stub),
    y: snap(a.y + req.normal.y * req.stub),
  };
  const run = req.stopAt ?? distanceToBoundary(b, req.turn, req.bounds);
  const c = { x: snap(b.x + req.turn.x * run), y: snap(b.y + req.turn.y * run) };
  return withLengths({
    id: `${req.kind}-${req.channel}`,
    kind: req.kind,
    channel: req.channel,
    points: [a, b, c],
    lengths: [],
    total: 0,
  });
}

export function withLengths(t: Trace): Trace {
  const lengths = [0];
  for (let i = 1; i < t.points.length; i++) {
    const p = t.points[i - 1];
    const q = t.points[i];
    lengths.push(lengths[i - 1] + Math.hypot(q.x - p.x, q.y - p.y));
  }
  return { ...t, lengths, total: lengths[lengths.length - 1] };
}

/** Point at distance d along the trace. */
export function pointAt(t: Trace, d: number): Point {
  const dist = Math.max(0, Math.min(t.total, d));
  for (let i = 1; i < t.points.length; i++) {
    if (dist <= t.lengths[i]) {
      const seg = t.lengths[i] - t.lengths[i - 1] || 1;
      const k = (dist - t.lengths[i - 1]) / seg;
      const p = t.points[i - 1];
      const q = t.points[i];
      return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k };
    }
  }
  return t.points[t.points.length - 1];
}

function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-9) return false;
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return u > 0.001 && u < 0.999 && v > 0.001 && v < 0.999;
}

export function tracesCross(a: Trace, b: Trace) {
  for (let i = 1; i < a.points.length; i++) {
    for (let j = 1; j < b.points.length; j++) {
      if (segmentsIntersect(a.points[i - 1], a.points[i], b.points[j - 1], b.points[j])) {
        return true;
      }
    }
  }
  return false;
}

/** Keep only traces that do not cross any already-accepted trace. */
export function dropCrossings(traces: Trace[]): Trace[] {
  const accepted: Trace[] = [];
  for (const t of traces) {
    if (!accepted.some((a) => tracesCross(a, t))) accepted.push(t);
  }
  return accepted;
}

/** Shortest distance from p to the trace polyline. */
export function distanceToTrace(t: Trace, p: Point) {
  let best = Infinity;
  for (let i = 1; i < t.points.length; i++) {
    const a = t.points[i - 1];
    const b = t.points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    best = Math.min(best, Math.hypot(p.x - (a.x + dx * k), p.y - (a.y + dy * k)));
  }
  return best;
}
