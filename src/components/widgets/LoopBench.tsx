"use client";

import { useEffect, useRef, useState } from "react";

const POINTS = 120;
const LOW = 15; // % level alarms
const HIGH = 85;

function classify(mA: number) {
  if (mA < 3.6) return { state: "fault", label: "LOOP OPEN · SENSOR FAULT (< 3.6 mA)" } as const;
  if (mA > 20.5) return { state: "fault", label: "OVER-RANGE (> 20.5 mA)" } as const;
  const pct = ((mA - 4) / 16) * 100;
  if (pct >= HIGH) return { state: "alarm", label: `HIGH LEVEL ALARM (≥ ${HIGH}%)` } as const;
  if (pct <= LOW) return { state: "alarm", label: `LOW LEVEL ALARM (≤ ${LOW}%)` } as const;
  return { state: "ok", label: "WITHIN LIMITS" } as const;
}

/**
 * IA015 analog input bench: drag a 4–20 mA loop current, see the tank level,
 * a scope-style trace and alarm states (including NAMUR-style loop faults).
 */
export function LoopBench() {
  const [mA, setMa] = useState(12.4);
  const [trace, setTrace] = useState<number[]>(() => Array(POINTS).fill(12.4));
  const target = useRef(mA);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    target.current = mA;
  }, [mA]);

  // sample the loop at 10 Hz while visible; small noise like a real transmitter
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    let id = 0;
    const start = () => {
      if (id) return;
      id = window.setInterval(() => {
        setTrace((t) => [...t.slice(1), target.current + (Math.random() - 0.5) * 0.06]);
      }, 100);
    };
    const stop = () => {
      window.clearInterval(id);
      id = 0;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);
    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  const pct = Math.max(0, Math.min(100, ((mA - 4) / 16) * 100));
  const status = classify(mA);
  const color = status.state === "ok" ? "var(--signal)" : status.state === "alarm" ? "var(--hazard)" : "var(--fault)";

  const W = 600;
  const H = 180;
  const y = (v: number) => H - (Math.max(0, Math.min(22, v)) / 22) * H;
  const path = trace.map((v, i) => `${i === 0 ? "M" : "L"}${((i / (POINTS - 1)) * W).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const yLevel = (p: number) => y(4 + (p / 100) * 16);

  return (
    <div ref={boxRef} className="border border-line-strong bg-bg-raised/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-dim">
          <span className="text-copper">AI1</span> · 4–20 mA loop bench · IA015 · simulated
        </p>
        <p className="font-mono text-[12px] uppercase tracking-[0.12em]" style={{ color }} aria-live="polite">
          ● {status.label}
        </p>
      </div>

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="relative border border-line bg-[#070908]">
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-[180px] w-full" preserveAspectRatio="none" aria-hidden>
              {/* graticule */}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`} x1={(i / 10) * W} y1="0" x2={(i / 10) * W} y2={H} stroke="rgba(236,232,220,0.07)" />
              ))}
              {[0, 4, 8, 12, 16, 20].map((v) => (
                <line key={`h${v}`} x1="0" y1={y(v)} x2={W} y2={y(v)} stroke="rgba(236,232,220,0.07)" />
              ))}
              <line x1="0" y1={yLevel(HIGH)} x2={W} y2={yLevel(HIGH)} stroke="#ffc53d" strokeDasharray="4 4" opacity="0.7" />
              <line x1="0" y1={yLevel(LOW)} x2={W} y2={yLevel(LOW)} stroke="#ffc53d" strokeDasharray="4 4" opacity="0.7" />
              <rect x="0" y={y(3.6)} width={W} height={H - y(3.6)} fill="rgba(255,90,60,0.08)" />
              <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
            </svg>
            <span className="absolute left-2 top-1 font-mono text-[11px] text-[#9a9a90]">22 mA</span>
            <span className="absolute bottom-1 left-2 font-mono text-[11px] text-[#9a9a90]">0 mA · 100 ms/div</span>
            <span className="absolute right-2 font-mono text-[11px] text-[#ffc53d]" style={{ top: `calc(${(yLevel(HIGH) / H) * 100}% - 14px)` }}>
              HI {HIGH}%
            </span>
            <span className="absolute right-2 font-mono text-[11px] text-[#ffc53d]" style={{ top: `calc(${(yLevel(LOW) / H) * 100}% + 2px)` }}>
              LO {LOW}%
            </span>
          </div>

          <label htmlFor="loop-ma" className="mt-5 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
            Loop current (drag or use arrow keys)
          </label>
          <input
            id="loop-ma"
            type="range"
            min={0}
            max={22}
            step={0.1}
            value={mA}
            onChange={(e) => setMa(Number(e.target.value))}
            aria-valuetext={`${mA.toFixed(1)} milliamps, ${pct.toFixed(0)} percent level, ${status.label.replace(/mA/g, "milliamps").toLowerCase()}`}
            className="loop-slider mt-3 w-full"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-dim">
            <span>0</span>
            <span>4 mA = 0%</span>
            <span>20 mA = 100%</span>
            <span>22</span>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-5">
          {/* tank */}
          <div className="relative h-[220px] w-16 border border-line-strong bg-bg" aria-hidden>
            <div className="absolute inset-x-0 bottom-0 transition-[height] duration-100 ease-linear" style={{ height: `${status.state === "fault" ? 0 : pct}%`, background: color, opacity: 0.35 }} />
            <div className="absolute inset-x-0 border-t border-dashed border-hazard/80" style={{ bottom: `${HIGH}%` }} />
            <div className="absolute inset-x-0 border-t border-dashed border-hazard/80" style={{ bottom: `${LOW}%` }} />
          </div>
          <dl className="space-y-4 font-mono">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">Loop</dt>
              <dd className="text-[30px] leading-none tabular" style={{ color }}>
                {mA.toFixed(2)}
                <span className="ml-1 text-[13px] text-ink-dim">mA</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">Tank level</dt>
              <dd className="text-[30px] leading-none tabular text-ink">
                {status.state === "fault" ? "—" : pct.toFixed(1)}
                <span className="ml-1 text-[13px] text-ink-dim">%</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-dim">Publish</dt>
              <dd className="break-all text-[12px] leading-relaxed text-ink-dim">
                armtronix/ia015/ai/1
                <br />
                <span className="text-signal">{`{"mA":${mA.toFixed(2)},"pct":${status.state === "fault" ? "null" : pct.toFixed(1)}}`}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
