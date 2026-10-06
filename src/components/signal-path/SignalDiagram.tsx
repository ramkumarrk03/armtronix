import type { MeterReading } from "@/data/telemetry";
import { MODBUS_REQUEST, registersFor } from "@/data/telemetry";

/**
 * The Retro → IIoT signal chain as one schematic:
 * legacy meter → RS485 pair → IA010 → MQTT broker → telemetry panel.
 * `progress` (0–1) is driven by scroll; each fifth lights one station.
 */

export const STAGES = 5;

type Props = {
  progress: number;
  reading: MeterReading;
  history: number[];
  /** Crop the schematic (used by the stacked mobile layout). */
  viewBox?: string;
  className?: string;
  title?: string;
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));

function twist(x0: number, x1: number, y: number, phase: number) {
  let d = `M${x0} ${y}`;
  for (let x = x0; x <= x1; x += 4) {
    d += ` L${x} ${(y + Math.sin((x - x0) / 7 + phase) * 5).toFixed(1)}`;
  }
  return d;
}

export function SignalDiagram({ progress, reading, history, viewBox = "0 0 1000 520", className, title }: Props) {
  const s = progress * STAGES;
  const stage = Math.min(STAGES - 1, Math.floor(s));
  const local = clamp(s - stage);
  const lit = (n: number) => stage >= n;
  const on = (n: number) => (lit(n) ? 1 : 0.28);

  // signal dot along the RS485 pair during stage 1
  const cableX = 204 + (370 - 204) * (stage === 1 ? local : stage > 1 ? 1 : 0);
  // MQTT packets during stage 3
  const pktA = 556 + (650 - 556) * clamp(local * 2);
  const pktB = 708 + (758 - 708) * clamp(local * 2 - 1);

  const regs = registersFor(reading);
  const max = Math.max(...history, 13.5);
  const min = Math.min(...history, 10.5);
  const spark = history
    .map((a, i) => `${i === 0 ? "M" : "L"}${(790 + (i / (history.length - 1)) * 170).toFixed(1)} ${(372 - ((a - min) / (max - min)) * 56).toFixed(1)}`)
    .join(" ");
  const threshold = 12.5;
  const thY = 372 - ((threshold - min) / (max - min)) * 56;
  const alarm = reading.amps > threshold;

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title ?? "Signal chain from a legacy meter through an Armtronix IA010 to a cloud telemetry panel"}>
      <defs>
        <filter id="sp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── 01 PHYSICAL: legacy energy meter (line art) ── */}
      <g opacity={on(0)} style={{ transition: "opacity 160ms linear" }} className="text-ink-dim">
        <rect x="30" y="140" width="174" height="250" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="117" cy="230" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {Array.from({ length: 11 }, (_, i) => {
          const a = Math.PI * (0.8 + (i / 10) * 1.4);
          return (
            <line
              key={i}
              x1={117 + Math.cos(a) * 40}
              y1={230 + Math.sin(a) * 40}
              x2={117 + Math.cos(a) * (i % 5 === 0 ? 31 : 35)}
              y2={230 + Math.sin(a) * (i % 5 === 0 ? 31 : 35)}
              stroke="currentColor"
            />
          );
        })}
        <line
          x1="117"
          y1="230"
          x2={117 + Math.cos(Math.PI * (1.25 + (reading.amps - 11) * 0.08)) * 36}
          y2={230 + Math.sin(Math.PI * (1.25 + (reading.amps - 11) * 0.08)) * 36}
          stroke="var(--copper)"
          strokeWidth="2"
        />
        <circle cx="117" cy="230" r="3.5" fill="var(--copper)" />
        <text x="117" y="350" textAnchor="middle" className="fill-current font-mono" fontSize="9" letterSpacing="1.2">
          MODBUS RTU · ID 01
        </text>
        {/* A/B terminals */}
        <rect x="196" y="288" width="14" height="28" fill="var(--bg)" stroke="currentColor" />
        <circle cx="203" cy="295" r="3" fill="none" stroke="var(--copper)" />
        <circle cx="203" cy="309" r="3" fill="none" stroke="var(--copper)" />
        <text x="117" y="418" textAnchor="middle" className="fill-current font-mono" fontSize="10" letterSpacing="2">
          LEGACY ENERGY METER
        </text>
      </g>

      {/* ── 02 SIGNAL: RS485 twisted pair ── */}
      <g opacity={on(1)} style={{ transition: "opacity 160ms linear" }}>
        <path d={twist(210, 372, 295, 0)} fill="none" stroke="var(--copper)" strokeWidth="1.6" />
        <path d={twist(210, 372, 309, Math.PI)} fill="none" stroke="var(--copper)" strokeWidth="1.6" strokeOpacity="0.6" />
        <text x="291" y="270" textAnchor="middle" className="fill-ink-dim font-mono" fontSize="9.5" letterSpacing="1.4">
          RS485 · A / B · 9600 8N1
        </text>
        <g className="font-mono" fontSize="10.5">
          {MODBUS_REQUEST.map((b, i) => {
            const shown = lit(2) || (stage === 1 && local > i / MODBUS_REQUEST.length);
            return (
              <text
                key={i}
                x={226 + i * 19}
                y="342"
                className={i >= 6 ? "fill-ink-dim" : "fill-signal"}
                opacity={shown ? 1 : 0.12}
              >
                {b}
              </text>
            );
          })}
        </g>
      </g>
      {stage === 1 && (
        <rect x={cableX - 5} y="297" width="10" height="10" fill="var(--signal)" filter="url(#sp-glow)" />
      )}

      {/* ── 03 PROTOCOL: the real IA010 ── */}
      <g opacity={lit(1) ? 1 : 0.45} style={{ transition: "opacity 160ms linear" }}>
        <image href="/images/products/ia010.webp" x="372" y="196" width="180" height="182" />
        <rect
          x="368"
          y="192"
          width="188"
          height="190"
          fill="none"
          stroke={lit(2) ? "var(--signal)" : "var(--line-strong)"}
          strokeDasharray="4 4"
          style={{ transition: "stroke 120ms linear" }}
        />
        <text x="462" y="180" textAnchor="middle" className="fill-copper font-mono" fontSize="11" letterSpacing="2">
          IA010 · RS485 → IIoT
        </text>
      </g>
      <g opacity={lit(2) ? 1 : 0} style={{ transition: "opacity 160ms linear" }} className="font-mono" fontSize="9.5">
        <rect x="372" y="398" width="180" height="94" fill="var(--bg)" stroke="var(--line-strong)" />
        <text x="382" y="414" className="fill-ink-dim" letterSpacing="1.2" fontSize="8.5">
          REG    RAW    DECODED
        </text>
        {regs.map((r, i) => (
          <text key={r.reg} x="382" y={430 + i * 16} className="fill-ink">
            <tspan className="fill-copper">{r.reg}</tspan>
            <tspan x="430">{String(r.raw).padStart(5, " ")}</tspan>
            <tspan x="476" className="fill-signal">{r.value || "·"}</tspan>
          </text>
        ))}
      </g>

      {/* ── 04 CLOUD: MQTT over Ethernet / Wi-Fi ── */}
      <g opacity={on(3)} style={{ transition: "opacity 160ms linear" }}>
        <path d="M556 260 H654" stroke="var(--copper)" strokeWidth="1.6" fill="none" />
        <path d="M706 260 H758" stroke="var(--copper)" strokeWidth="1.6" fill="none" />
        <circle cx="556" cy="260" r="3.5" fill="none" stroke="var(--copper)" />
        <text x="605" y="246" textAnchor="middle" className="fill-ink-dim font-mono" fontSize="9" letterSpacing="1.2">
          ETH / WI-FI
        </text>
        <polygon points="680,234 703,247 703,273 680,286 657,273 657,247" fill="var(--bg)" stroke={lit(3) ? "var(--signal)" : "var(--line-strong)"} strokeWidth="1.4" />
        <text x="680" y="257" textAnchor="middle" className="fill-ink font-mono" fontSize="8.5" letterSpacing="1">
          MQTT
        </text>
        <text x="680" y="268" textAnchor="middle" className="fill-ink-dim font-mono" fontSize="7.5">
          broker
        </text>
      </g>
      {stage === 3 && local < 0.5 && (
        <rect x={pktA - 6} y="255" width="12" height="10" fill="var(--signal)" filter="url(#sp-glow)" />
      )}
      {stage === 3 && local >= 0.5 && (
        <rect x={pktB - 6} y="255" width="12" height="10" fill="var(--signal)" filter="url(#sp-glow)" />
      )}

      {/* ── 05 INSIGHT: telemetry panel ── */}
      <g opacity={on(3)} style={{ transition: "opacity 160ms linear" }}>
        <rect x="762" y="120" width="226" height="290" fill="var(--bg-raised)" stroke={lit(4) ? "var(--copper)" : "var(--line-strong)"} />
        <text x="776" y="142" className="fill-ink-dim font-mono" fontSize="9" letterSpacing="1.4">
          armtronix/ia010/meter/01
        </text>
        <circle cx="972" cy="139" r="3.5" fill={lit(3) ? "var(--signal)" : "var(--ink-dim)"} />
        {[
          { k: "VOLTAGE", v: reading.volts.toFixed(1), u: "V", y: 178 },
          { k: "CURRENT", v: reading.amps.toFixed(1), u: "A", y: 226 },
          { k: "ENERGY", v: reading.kwh.toFixed(1), u: "kWh", y: 274 },
        ].map((row) => (
          <g key={row.k} className="font-mono">
            <text x="776" y={row.y - 14} className="fill-ink-dim" fontSize="8.5" letterSpacing="1.6">
              {row.k}
            </text>
            <text x="776" y={row.y + 8} className="fill-signal" fontSize="22" style={{ fontVariantNumeric: "tabular-nums" }}>
              {row.v}
              <tspan className="fill-ink-dim" fontSize="11" dx="6">
                {row.u}
              </tspan>
            </text>
          </g>
        ))}
        <line x1="776" y1="300" x2="974" y2="300" stroke="var(--line)" />
        <line x1="790" y1={thY} x2="960" y2={thY} stroke="var(--hazard)" strokeDasharray="3 3" opacity={lit(4) ? 0.9 : 0} />
        <path d={spark} fill="none" stroke="var(--signal)" strokeWidth="1.5" opacity={lit(4) ? 1 : 0.35} />
        <text x="776" y="396" className="font-mono" fontSize="8.5" letterSpacing="1.2" fill={alarm && lit(4) ? "var(--hazard)" : "var(--ink-dim)"}>
          {lit(4) ? (alarm ? "▲ CURRENT > 12.5 A · FLAGGED" : "● WITHIN LIMITS") : "SIMULATED FEED"}
        </text>
      </g>
    </svg>
  );
}
