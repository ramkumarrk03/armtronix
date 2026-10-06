export type Option = { id: string; label: string; hint: string };
export type Question = { id: "machine" | "signal" | "link"; n: string; title: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "machine",
    n: "01",
    title: "What do you want to connect?",
    options: [
      { id: "meter", label: "Energy meter, drive or controller", hint: "Already has a comms port" },
      { id: "panel", label: "Panel with field switches and lamps", hint: "Limit switches, contactors, stack lights" },
      { id: "sensor", label: "Analog sensors", hint: "Tank level, pressure, temperature transmitters" },
      { id: "building", label: "Lighting and building loads", hint: "Lamps, fans, pumps on mains" },
    ],
  },
  {
    id: "signal",
    n: "02",
    title: "What does it speak today?",
    options: [
      { id: "rs485", label: "RS485 / Modbus RTU", hint: "Two-wire A/B bus" },
      { id: "ma", label: "4–20 mA current loop", hint: "Analog transmitter" },
      { id: "dio", label: "24 V digital I/O", hint: "On/off signals and coils" },
      { id: "ac", label: "Mains AC load", hint: "100–240 V AC" },
    ],
  },
  {
    id: "link",
    n: "03",
    title: "How should the data leave?",
    options: [
      { id: "eth", label: "Ethernet", hint: "Modbus TCP to a PLC or SCADA" },
      { id: "wifi", label: "Wi-Fi", hint: "MQTT to a broker" },
      { id: "lora", label: "Long range", hint: "LoRa / LoRaWAN across a site" },
      { id: "pi", label: "Raspberry Pi gateway", hint: "Your own Linux stack" },
    ],
  },
];

export type Answers = Partial<Record<Question["id"], string>>;

/** Rule-based recommendation using only documented capabilities. */
export function recommend(a: Answers): { code: string; reasons: string[] } {
  const { signal, link, machine } = a;
  if (link === "pi") {
    return { code: signal === "ma" ? "IA003" : "IA002", reasons: ["Isolated 24 V I/O for a Raspberry Pi", signal === "ma" ? "Adds analog inputs and a UPS for the Pi" : "4 in / 4 out, fused"] };
  }
  if (signal === "ac" || machine === "building") {
    return { code: "BA014", reasons: ["Switches mains loads over Wi-Fi", "Power monitoring on every channel"] };
  }
  if (signal === "rs485") {
    if (link === "lora") return { code: "IA013", reasons: ["RS485 / Modbus master or slave", "LoRa / LoRaWAN for long-range links", "Built for energy meters"] };
    return { code: "IA010", reasons: ["Reads your RS485 / Modbus RTU device as is", link === "eth" ? "Republishes as Modbus TCP over Ethernet" : "Publishes to MQTT over Wi-Fi", "PLC- and broker-compatible"] };
  }
  if (signal === "ma") {
    return { code: "IA015", reasons: ["4–20 mA current-loop inputs", "Ethernet, RS485 and CAN on the same module", "Arduino-programmable"] };
  }
  if (signal === "dio") {
    if (link === "eth") return { code: "IA015", reasons: ["Isolated 12–24 V digital I/O", "Ethernet with Modbus TCP"] };
    return { code: "IA009", reasons: ["12 opto-isolated inputs and 12 outputs", "MQTT over Wi-Fi: no cable run back to the PLC"] };
  }
  return { code: "IA015", reasons: ["Covers digital, analog, RS485 and CAN"] };
}
