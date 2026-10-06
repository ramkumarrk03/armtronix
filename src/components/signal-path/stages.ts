export type Stage = {
  n: string;
  key: string;
  title: string;
  body: string;
  /** Crop of the schematic shown on phones. */
  viewBox: string;
};

export const STAGE_COPY: Stage[] = [
  {
    n: "01",
    key: "Physical",
    title: "A meter from before the cloud.",
    body: "It measures everything and shares nothing.",
    viewBox: "20 120 210 310",
  },
  {
    n: "02",
    key: "Signal",
    title: "Two wires it already has.",
    body: "The IA010 polls the meter over RS485. Nothing new is wired.",
    viewBox: "190 250 200 120",
  },
  {
    n: "03",
    key: "Protocol",
    title: "Modbus RTU in. Modbus TCP and MQTT out.",
    body: "Registers decoded, republished over Ethernet or Wi-Fi.",
    viewBox: "360 170 210 330",
  },
  {
    n: "04",
    key: "Cloud",
    title: "Every reading becomes a message.",
    body: "Each poll lands on an MQTT topic as a small JSON payload.",
    viewBox: "540 200 460 120",
  },
  {
    n: "05",
    key: "Insight",
    title: "Now the plant can see it.",
    body: "Trends and alerts on a machine that never changed.",
    viewBox: "750 110 250 310",
  },
];
