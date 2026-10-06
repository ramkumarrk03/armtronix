"use client";

import { useEffect, useRef, useState } from "react";
import { meterReading, mqttPayload } from "@/data/telemetry";

type Topic = { id: string; filter: string; make: (t: number, n: number) => { topic: string; payload: string } };

const TOPICS: Topic[] = [
  {
    id: "ia009",
    filter: "armtronix/ia009/in/#",
    make: (_t, n) => {
      const ch = (n * 5) % 12 + 1;
      return { topic: `armtronix/ia009/in/${ch}`, payload: JSON.stringify({ state: (n + ch) % 3 === 0 ? 0 : 1, v: 24.0 }) };
    },
  },
  {
    id: "ia010",
    filter: "armtronix/ia010/meter/#",
    make: (t) => ({ topic: "armtronix/ia010/meter/01", payload: mqttPayload(meterReading(t), Date.UTC(2026, 9, 6, 4, 30) + t) }),
  },
  {
    id: "ia015",
    filter: "armtronix/ia015/ai/#",
    make: (t, n) => {
      const ch = (n % 4) + 1;
      const ma = 4 + 16 * (0.55 + Math.sin(t / 2400 + ch) * 0.3);
      return {
        topic: `armtronix/ia015/ai/${ch}`,
        payload: JSON.stringify({ mA: Number(ma.toFixed(2)), pct: Number((((ma - 4) / 16) * 100).toFixed(1)) }),
      };
    },
  },
];

type Line = { id: number; time: string; topic: string; payload: string };

function clock(t: number) {
  const d = new Date(Date.UTC(2026, 9, 6, 4, 30) + t);
  return d.toISOString().slice(11, 19);
}

/** TP4 · a mock subscriber streaming simulated payloads. */
export function MqttConsole() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [follow, setFollow] = useState(true);
  const [lines, setLines] = useState<Line[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now() - start + counter.current * 700;
      const n = counter.current++;
      const msg = topic.make(t, n);
      setLines((prev) => [...prev.slice(-40), { id: n, time: clock(t), ...msg }]);
    }, 700);
    return () => window.clearInterval(id);
  }, [topic, visible]);

  useEffect(() => {
    const el = boxRef.current;
    if (follow && el) el.scrollTop = el.scrollHeight;
  }, [lines, follow]);

  function choose(t: Topic) {
    setTopic(t);
    setLines([]);
  }

  return (
    <div className="border border-line-strong bg-[#070908] text-[#d9d5c9]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9a9a90]">
        <span className="mr-auto">TP4 · mqtt console · simulated</span>
        <button
          type="button"
          role="switch"
          aria-checked={follow}
          onClick={() => setFollow((f) => !f)}
          className={`border px-2 py-1 ${follow ? "border-[#ffb000] text-[#ffb000]" : "border-white/20"}`}
        >
          Follow {follow ? "on" : "off"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2" role="radiogroup" aria-label="Subscription topic">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === topic.id}
            onClick={() => choose(t)}
            className={`px-2 py-1 font-mono text-[11px] transition-colors duration-100 ${
              t.id === topic.id ? "bg-[#c8794a] text-[#0b0d0c]" : "border border-white/15 text-[#c9c5b9] hover:border-[#c8794a]"
            }`}
          >
            {t.filter}
          </button>
        ))}
      </div>
      <div
        ref={boxRef}
        className="h-[260px] overflow-y-auto px-3 py-3 font-mono text-[11.5px] leading-[1.7]"
        aria-live="off"
        tabIndex={0}
        aria-label="Simulated MQTT message stream"
        onWheel={() => setFollow(false)}
      >
        <p className="text-[#9a9a90]">
          <span className="text-[#c8794a]">$</span> mosquitto_sub -h broker.local -t &apos;{topic.filter}&apos; -v
        </p>
        {lines.map((l) => (
          <p key={l.id} className="whitespace-pre-wrap break-all">
            <span className="text-[#6f6f68]">{l.time} </span>
            <span className="text-[#e39a63]">{l.topic}</span> <span className="text-[#ffb000]">{l.payload}</span>
          </p>
        ))}
        <p aria-hidden className="text-[#ffb000]">
          ▌
        </p>
      </div>
    </div>
  );
}
