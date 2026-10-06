"use client";

import { useRef, useState } from "react";

const CH = 12;
type Logic = "mirror" | "invert";
type Pub = { id: number; text: string };

/**
 * Live I/O bench for the IA009: flip any of the 12 opto-isolated inputs,
 * watch the outputs follow the selected logic, and see the MQTT publishes.
 */
export function IOBench() {
  const [inputs, setInputs] = useState<boolean[]>(() => [true, false, false, true, false, false, false, true, false, false, true, false]);
  const [logic, setLogic] = useState<Logic>("mirror");
  const [log, setLog] = useState<Pub[]>([]);
  const seq = useRef(0);

  const outputs = inputs.map((v) => (logic === "mirror" ? v : !v));

  function push(lines: string[]) {
    setLog((prev) => [...lines.map((text) => ({ id: seq.current++, text })), ...prev].slice(0, 7));
  }

  function flip(i: number) {
    const nextIn = !inputs[i];
    const nextOut = logic === "mirror" ? nextIn : !nextIn;
    setInputs((prev) => prev.map((v, k) => (k === i ? nextIn : v)));
    push([
      `armtronix/ia009/out/${i + 1}  {"state":${nextOut ? 1 : 0}}`,
      `armtronix/ia009/in/${i + 1}   {"state":${nextIn ? 1 : 0},"v":${nextIn ? "24.0" : "0.0"}}`,
    ]);
  }

  function setMode(m: Logic) {
    setLogic(m);
    push([`armtronix/ia009/config  {"logic":"${m}"}`]);
  }

  return (
    <div className="border border-line-strong bg-bg-raised/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-dim">
          <span className="text-copper">J2</span> · live I/O bench · IA009 · simulated
        </p>
        <div role="radiogroup" aria-label="Output logic" className="flex border border-line-strong font-mono text-[12px] uppercase tracking-[0.12em]">
          {(["mirror", "invert"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={logic === m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 transition-colors duration-100 ${logic === m ? "bg-copper text-bg" : "text-ink-dim hover:text-ink"}`}
            >
              DO = {m === "mirror" ? "DI" : "¬DI"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {/* inputs: toggle levers */}
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">Digital inputs · 24 V DC · tap to switch</p>
          <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-12">
            {inputs.map((v, i) => (
              <button
                key={i}
                type="button"
                role="switch"
                aria-checked={v}
                aria-label={`Input ${i + 1}`}
                onClick={() => flip(i)}
                className="group flex flex-col items-center gap-1.5"
              >
                <span className="relative block h-12 w-7 rounded-[3px] border border-line-strong bg-bg">
                  <span
                    className={`absolute left-1/2 h-5 w-3 -translate-x-1/2 rounded-[2px] transition-[top,background-color] duration-[110ms] ease-snap ${
                      v ? "top-1 bg-copper" : "top-[calc(100%-24px)] bg-ink-dim/50"
                    }`}
                  />
                </span>
                <span className={`font-mono text-[11px] ${v ? "text-ink" : "text-ink-dim"}`}>{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>

          {/* opto-isolation barrier */}
          <div aria-hidden className="my-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
            <span className="h-px flex-1 border-t border-dashed border-line-strong" />
            opto-isolation barrier · 12 × ESP → 12 ×
            <span className="h-px flex-1 border-t border-dashed border-line-strong" />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">Digital outputs · opto-isolated</p>
          <ul className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-12" aria-label="Output states">
            {outputs.map((v, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={`block h-4 w-4 rounded-full border transition-[background-color,box-shadow] duration-75 ${
                    v ? "border-[#ff5a3c] bg-[#ff3b26] shadow-[0_0_12px_rgba(255,60,40,0.8)]" : "border-line-strong bg-bg"
                  }`}
                />
                <span className="sr-only">
                  Output {i + 1} {v ? "on" : "off"}
                </span>
                <span aria-hidden className={`font-mono text-[11px] ${v ? "text-ink" : "text-ink-dim"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-[220px] flex-col border border-line bg-[#070908] p-3 font-mono text-[12px] leading-[1.7] text-[#d9d5c9]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a90]">mqtt publishes</p>
          <ul className="mt-2 flex-1 space-y-0.5" aria-live="polite">
            {log.length === 0 && <li className="text-[#6f6f68]">Flip an input to publish…</li>}
            {log.map((l) => (
              <li key={l.id} className="break-all">
                <span className="text-[#c8794a]">▸ </span>
                <span className="text-[#ffb000]">{l.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-[#9a9a90]">
            {outputs.filter(Boolean).length} / {CH} outputs on · {inputs.filter(Boolean).length} / {CH} inputs high
          </p>
        </div>
      </div>
    </div>
  );
}
