/**
 * Mock telemetry generators. Everything here is simulated and is always
 * labelled as such in the UI.
 */

export type MeterReading = {
  volts: number;
  amps: number;
  kwh: number;
};

/** Smooth pseudo-noise: deterministic for a given t, no Math.random jitter. */
function wave(t: number, seed: number) {
  return (
    Math.sin(t * 0.0011 + seed) * 0.6 +
    Math.sin(t * 0.0037 + seed * 2.1) * 0.3 +
    Math.sin(t * 0.0093 + seed * 3.7) * 0.1
  );
}

const KWH_BASE = 48213.6;

/** A three-phase-ish energy meter read over Modbus (holding regs 40001–40006). */
export function meterReading(t: number): MeterReading {
  return {
    volts: 231.4 + wave(t, 1) * 2.2,
    amps: 12.1 + wave(t, 4) * 1.1,
    kwh: KWH_BASE + t / 3_600_000 * 2.8,
  };
}

/** The Modbus RTU request the IA010 sends: slave 01, fn 03, regs 0000–0005. */
export const MODBUS_REQUEST = ["01", "03", "00", "00", "00", "06", "C5", "C8"];

export function registersFor(r: MeterReading) {
  const v = Math.round(r.volts * 10);
  const a = Math.round(r.amps * 10);
  const k = Math.round(r.kwh * 10);
  return [
    { reg: "40001", raw: v, label: "Voltage", value: `${r.volts.toFixed(1)} V` },
    { reg: "40002", raw: a, label: "Current", value: `${r.amps.toFixed(1)} A` },
    { reg: "40003", raw: Math.floor(k / 65536), label: "Energy (hi)", value: "" },
    { reg: "40004", raw: k % 65536, label: "Energy (lo)", value: `${r.kwh.toFixed(1)} kWh` },
  ];
}

export function mqttPayload(r: MeterReading, ts: number) {
  return JSON.stringify({
    v: Number(r.volts.toFixed(1)),
    i: Number(r.amps.toFixed(1)),
    kwh: Number(r.kwh.toFixed(1)),
    ts: Math.floor(ts / 1000),
  });
}
