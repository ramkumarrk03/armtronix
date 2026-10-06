/**
 * Geometry of the real IA009 bench photo (/images/products/ia009.webp,
 * 1100 x 1008 px), measured from the image. All coordinates are in photo
 * pixels; the hero maps them to screen space at runtime.
 *
 * Silkscreen on the board: OUT12 / IN12 sit at the bottom-left end of each
 * terminal strip, OUT1 / IN1 at the top-right (next to the ESP module).
 */
export const HERO_PHOTO = {
  src: "/images/products/ia009.webp",
  width: 1100,
  height: 1008,
  alt: "Armtronix IA009 Wi-Fi 12 DI / 12 DO board on a workbench: two rows of green screw terminals, twelve red output LEDs, three opto-isolator ICs and an ESP Wi-Fi module.",
} as const;

export type Point = { x: number; y: number };

export type TerminalStrip = {
  kind: "out" | "in";
  /** Screw centre of channel 12 (bottom-left end). */
  from: Point;
  /** Screw centre of channel 1 (top-right end). */
  to: Point;
  /** Outward normal (unit-ish, 45°) the traces leave along. */
  normal: Point;
};

const D = Math.SQRT1_2;

export const TERMINAL_STRIPS: TerminalStrip[] = [
  { kind: "out", from: { x: 128, y: 610 }, to: { x: 642, y: 212 }, normal: { x: -D, y: -D } },
  { kind: "in", from: { x: 362, y: 848 }, to: { x: 1048, y: 196 }, normal: { x: D, y: D } },
];

/** Output LED centres, index 0 = OUT1 (top-right) ... 11 = OUT12. */
export const OUTPUT_LEDS: Point[] = [
  { x: 705, y: 218 },
  { x: 663, y: 260 },
  { x: 620, y: 296 },
  { x: 577, y: 334 },
  { x: 533, y: 374 },
  { x: 487, y: 412 },
  { x: 435, y: 455 },
  { x: 386, y: 499 },
  { x: 333, y: 544 },
  { x: 275, y: 594 },
  { x: 215, y: 644 },
  { x: 150, y: 697 },
];

/** Power + Wi-Fi status LEDs next to the regulator. */
export const STATUS_LEDS: Point[] = [
  { x: 854, y: 183 },
  { x: 881, y: 204 },
];

export const CHANNELS = 12;
