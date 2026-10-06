import { pointAt, type Trace } from "@/lib/traceRouter";
import type { Packet, Tag } from "./useHeroSimulation";
import { TAG_LIFETIME } from "./useHeroSimulation";

export type Palette = {
  copper: string;
  copperHi: string;
  signal: string;
  ink: string;
  inkDim: string;
  bg: string;
  mono: string;
};

export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    copper: v("--copper"),
    copperHi: v("--copper-hi"),
    signal: v("--signal"),
    ink: v("--ink"),
    inkDim: v("--ink-dim"),
    bg: v("--bg"),
    mono: v("--font-jetbrains") || "monospace",
  };
}

type FrameInput = {
  ctx: CanvasRenderingContext2D;
  traces: Trace[];
  /** Revealed length per trace id (boot growth). */
  grown: Map<string, number>;
  packets: Packet[];
  tags: Tag[];
  hovered: string | null;
  probe: { x: number; y: number } | null;
  now: number;
  palette: Palette;
  scale: number;
};

function strokePartial(ctx: CanvasRenderingContext2D, t: Trace, length: number) {
  ctx.beginPath();
  ctx.moveTo(t.points[0].x, t.points[0].y);
  for (let i = 1; i < t.points.length; i++) {
    if (length >= t.lengths[i]) {
      ctx.lineTo(t.points[i].x, t.points[i].y);
    } else {
      const p = pointAt(t, length);
      ctx.lineTo(p.x, p.y);
      break;
    }
  }
  ctx.stroke();
}

function pad(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawFrame(f: FrameInput) {
  const { ctx, traces, grown, palette, hovered, scale } = f;
  const lw = Math.max(1.1, 1.6 * scale);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1. Copper traces + pads.
  for (const t of traces) {
    const len = grown.get(t.id) ?? t.total;
    if (len <= 0) continue;
    const isHot = hovered === t.id;
    ctx.strokeStyle = isHot ? palette.copperHi : palette.copper;
    ctx.globalAlpha = isHot ? 1 : 0.42;
    ctx.lineWidth = isHot ? lw * 1.8 : lw;
    if (isHot) {
      ctx.shadowColor = palette.copperHi;
      ctx.shadowBlur = 10;
    }
    strokePartial(ctx, t, len);
    ctx.shadowBlur = 0;

    // terminal pad at the board end
    ctx.lineWidth = lw;
    pad(ctx, t.points[0].x, t.points[0].y, 3.2 * Math.max(scale, 0.8));

    // via + silkscreen channel number at the far end, once fully routed
    if (len >= t.total) {
      const end = t.points[t.points.length - 1];
      pad(ctx, end.x, end.y, 3.6 * Math.max(scale, 0.8));
    }
  }
  ctx.globalAlpha = 1;

  // 2. Packets: short rectangles with a fading tail, constant speed.
  for (const p of f.packets) {
    const t = traces.find((tr) => tr.id === p.traceId);
    if (!t) continue;
    const head = p.dir === 1 ? p.d : t.total - p.d;
    const tailDir = p.dir === 1 ? -1 : 1;
    for (let k = 0; k < 6; k++) {
      const q = pointAt(t, head + tailDir * k * 5);
      ctx.globalAlpha = 1 - k / 6;
      ctx.fillStyle = palette.signal;
      if (k === 0) {
        ctx.shadowColor = palette.signal;
        ctx.shadowBlur = 12;
      }
      const s = k === 0 ? 4.5 : 3;
      ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
      ctx.shadowBlur = 0;
    }
  }
  ctx.globalAlpha = 1;

  // 3. MQTT tags where publishes land.
  ctx.font = `500 10.5px ${f.palette.mono}`;
  ctx.textAlign = "left";
  for (const tag of f.tags) {
    const age = f.now - tag.born;
    const a = age < 120 ? age / 120 : 1 - Math.max(0, age - 900) / (TAG_LIFETIME - 900);
    if (a <= 0) continue;
    const w = ctx.measureText(tag.text).width + 12;
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = palette.bg;
    ctx.fillRect(tag.x + 8, tag.y - 9, w, 17);
    ctx.strokeStyle = palette.signal;
    ctx.lineWidth = 1;
    ctx.strokeRect(tag.x + 8.5, tag.y - 8.5, w - 1, 16);
    ctx.fillStyle = palette.signal;
    ctx.fillText(tag.text, tag.x + 14, tag.y + 3.5);
  }
  ctx.globalAlpha = 1;

  // 4. Probe tip snapped to the hovered trace.
  if (f.probe && hovered) {
    const { x, y } = f.probe;
    ctx.strokeStyle = palette.signal;
    ctx.lineWidth = 1.25;
    pad(ctx, x, y, 7);
    ctx.beginPath();
    ctx.moveTo(x - 13, y);
    ctx.lineTo(x - 9, y);
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 13, y);
    ctx.moveTo(x, y - 13);
    ctx.lineTo(x, y - 9);
    ctx.moveTo(x, y + 9);
    ctx.lineTo(x, y + 13);
    ctx.stroke();
  }
}
