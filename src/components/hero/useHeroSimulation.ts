"use client";

import { CHANNELS } from "@/data/heroBoard";

/**
 * Simulated IA009 logic for the hero: an input changes in the field, the
 * packet travels in along its copper trace, the board mirrors it on the
 * matching opto-isolated output, and the output publishes over MQTT.
 * Purely local timers; no network.
 */

export type Packet = {
  traceId: string;
  /** +1 = board → world (publish), -1 = world → board (field input). */
  dir: 1 | -1;
  d: number;
  speed: number;
  channel: number;
};

export type Tag = {
  text: string;
  x: number;
  y: number;
  born: number;
};

export type SimState = {
  inputs: boolean[];
  outputs: boolean[];
  packets: Packet[];
  tags: Tag[];
  nextInputAt: number;
  volts: number[];
};

export function createSimState(): SimState {
  // Deterministic starting pattern so SSR and first client paint agree.
  const pattern = [true, false, true, true, false, false, true, false, true, false, false, true];
  return {
    inputs: [...pattern],
    outputs: [...pattern],
    packets: [],
    tags: [],
    nextInputAt: 0,
    volts: Array.from({ length: CHANNELS }, (_, i) => 23.8 + ((i * 7) % 5) * 0.08),
  };
}

export const PACKET_SPEED = 0.2; // px per ms: constant, linear, like a real bus
export const TAG_LIFETIME = 1600;
