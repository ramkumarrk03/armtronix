"use client";

import { useEffect, useState } from "react";
import { meterReading, type MeterReading } from "@/data/telemetry";

/**
 * Simulated meter polled like the IA010 would (about once a second).
 * Starts from a fixed reading so server and client markup match, and only
 * runs while `active` is true.
 */
export function useMeter(active: boolean, intervalMs = 900) {
  const [state, setState] = useState<{ reading: MeterReading; history: number[]; ts: number }>(
    () => ({ reading: meterReading(0), history: Array.from({ length: 32 }, (_, i) => meterReading(i * 900).amps), ts: 0 }),
  );

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const t = 32 * 900 + (performance.now() - start);
      const reading = meterReading(t);
      setState((s) => ({
        reading,
        history: [...s.history.slice(1), reading.amps],
        ts: Date.now(),
      }));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);

  return state;
}
