/**
 * Armtronix catalogue. Facts come from CLAUDE.md §3 and Armtronix's own
 * published datasheets (github.com/armtronix/ARMtronix_Product_Documents).
 * No prices, client names or certifications: none are known.
 */

export type ProductLine = "IA" | "BA";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** true = background removed (sits directly on the page). */
  cutout: boolean;
};

export type Product = {
  code: string;
  name: string;
  line: ProductLine;
  tagline: string;
  summary: string;
  image: ProductImage;
  /** Short interface chips shown on the rail. */
  interfaces: string[];
  specs: { label: string; value: string }[];
  /** Who it is for, in one line, for the buyer path. */
  retrofit: string;
  datasheet: string;
};

const DOCS = "https://github.com/armtronix/ARMtronix_Product_Documents/blob/master";

export const products: Product[] = [
  {
    code: "IA015",
    name: "ESP32 Retro to IIoT",
    line: "IA",
    tagline: "The namesake: one DIN module, every legacy signal.",
    summary:
      "An ESP32 controller that takes the signals old panels already speak (24 V digital I/O, 4–20 mA loops, RS485, CAN) and puts them on Ethernet, Wi-Fi and MQTT. Arduino-programmable.",
    image: {
      src: "/images/products/ia015.webp",
      width: 1037,
      height: 1030,
      alt: "Armtronix IA015 board beside its white DIN-rail enclosure labelled 'IA015: IIoT to PLC'.",
      cutout: true,
    },
    interfaces: ["3 DI", "3 DO", "4–20 mA", "RS485", "CAN", "Ethernet"],
    specs: [
      { label: "MCU", value: "ESP32 (Wi-Fi 802.11 b/g/n, Bluetooth 4.2)" },
      { label: "Digital inputs", value: "3 × isolated, 12–24 V DC" },
      { label: "Digital outputs", value: "3 × isolated, open collector" },
      { label: "Analog inputs", value: "4–20 mA current-loop sensor inputs" },
      { label: "Fieldbus", value: "RS485 / Modbus, CAN" },
      { label: "Network", value: "Ethernet (Modbus TCP), Wi-Fi, MQTT" },
      { label: "Supply", value: "12–24 V DC industrial" },
      { label: "Mounting", value: "DIN rail" },
      { label: "Firmware", value: "Arduino IDE programmable" },
    ],
    retrofit: "For panels with 4–20 mA sensors, a few interlocks and an RS485 device that need to reach the cloud.",
    datasheet: `${DOCS}/IA015_Retro_To_IIoT.pdf`,
  },
  {
    code: "IA010",
    name: "RS485 to IIoT",
    line: "IA",
    tagline: "Make legacy Modbus equipment Industry 4.0-ready.",
    summary:
      "An ESP32 Modbus converter that bridges RS485 equipment to Ethernet, Wi-Fi and Bluetooth. Speaks Modbus TCP, works with PLCs and MQTT brokers, so the machine stays and only the data path changes.",
    image: {
      src: "/images/products/ia010.webp",
      width: 361,
      height: 366,
      alt: "Armtronix IA010 Modbus to IoT module in a white DIN-rail case, printed 'Made in India', with RS485 A/B, DO and 24 V DC terminals.",
      cutout: true,
    },
    interfaces: ["RS485", "Modbus TCP", "Ethernet", "Wi-Fi", "BT", "1 DO"],
    specs: [
      { label: "MCU", value: "ESP32" },
      { label: "Fieldbus", value: "2-wire RS485 / Modbus RTU" },
      { label: "Network", value: "Ethernet, Wi-Fi, Bluetooth" },
      { label: "Protocols", value: "Modbus TCP, MQTT" },
      { label: "Digital output", value: "1 × isolated" },
      { label: "Supply", value: "12–24 V DC" },
      { label: "Mounting", value: "DIN rail" },
      { label: "Integration", value: "PLC- and MQTT-broker compatible" },
    ],
    retrofit: "For drives, meters and controllers that already talk RS485 but sit offline.",
    datasheet: `${DOCS}/ARMtronix_IA_ProdcutCatalogue.pdf`,
  },
  {
    code: "IA009",
    name: "Wi-Fi 12 DI / 12 DO",
    line: "IA",
    tagline: "A wireless I/O card for sensors far from the PLC.",
    summary:
      "Twelve opto-isolated inputs and twelve opto-isolated outputs on a 12–24 V DC industrial supply, reporting over MQTT on Wi-Fi. Reflashable through exposed RX/TX/DTR/RTS.",
    image: {
      src: "/images/products/ia009.webp",
      width: 1100,
      height: 1008,
      alt: "Armtronix IA009 Wi-Fi 12 DI / 12 DO board on a workbench with two rows of green screw terminals and twelve red output LEDs.",
      cutout: false,
    },
    interfaces: ["12 DI", "12 DO", "Opto", "Wi-Fi", "MQTT"],
    specs: [
      { label: "Digital inputs", value: "12 × opto-isolated, 24 V DC tolerant" },
      { label: "Digital outputs", value: "12 × opto-isolated" },
      { label: "Network", value: "Wi-Fi 802.11 b/g/n" },
      { label: "Protocol", value: "MQTT (broker or Wi-Fi access point)" },
      { label: "Supply", value: "12–24 V DC industrial" },
      { label: "Expansion", value: "I²C header" },
      { label: "Programming", value: "Exposed RX / TX / DTR / RTS" },
      { label: "Mounting", value: "Screw mount" },
    ],
    retrofit: "For limit switches, lamps and contactors spread across a floor, too far to wire back to the PLC.",
    datasheet: `${DOCS}/IA009_Wifi_12-DIO_Board.pdf`,
  },
  {
    code: "IA013",
    name: "Wi-Fi ↔ RS485 ↔ LoRa",
    line: "IA",
    tagline: "Long-range links for energy meters and RS485 devices.",
    summary:
      "ESP32 plus an STM32 microcontroller and a LoRa module over SPI, with LoRaWAN support. IoT-enables energy meters and other RS485 devices across long distances.",
    image: {
      src: "/images/products/ia013.webp",
      width: 654,
      height: 625,
      alt: "Armtronix IA013 in a grey enclosure with a LoRa antenna and a green terminal block.",
      cutout: false,
    },
    interfaces: ["RS485", "LoRaWAN", "Wi-Fi", "STM32"],
    specs: [
      { label: "MCUs", value: "ESP32 + STM32F103" },
      { label: "Radio", value: "LoRa / LoRaWAN (SPI module)" },
      { label: "Fieldbus", value: "RS485 / Modbus, master or slave" },
      { label: "Network", value: "Wi-Fi, Bluetooth" },
      { label: "Supply", value: "24 V DC (230 V AC variant)" },
      { label: "Extra", value: "On-field programmable" },
    ],
    retrofit: "For energy meters and RS485 devices spread across a site, out of Wi-Fi range.",
    datasheet: `${DOCS}/IA013_Wifi_RS485_LoRa.pdf`,
  },
  {
    code: "IA002",
    name: "Isolated I/O for Raspberry Pi",
    line: "IA",
    tagline: "Put a Raspberry Pi safely on a 24 V panel.",
    summary: "Four isolated inputs and four isolated outputs at 24 V, fused, on a Raspberry Pi HAT-style board.",
    image: {
      src: "/images/products/ia002.webp",
      width: 900,
      height: 745,
      alt: "Armtronix IA002 Raspberry Pi isolated I/O board with green terminals, fuse and power regulator.",
      cutout: true,
    },
    interfaces: ["4 DI", "4 DO", "24 V", "Fused", "RPi"],
    specs: [
      { label: "Digital inputs", value: "4 × isolated, 24 V" },
      { label: "Digital outputs", value: "4 × isolated, 24 V" },
      { label: "Protection", value: "Fused" },
      { label: "Host", value: "Raspberry Pi" },
    ],
    retrofit: "For teams prototyping on a Raspberry Pi who need industrial-voltage I/O.",
    datasheet: `${DOCS}/IA002_RPi_4IN_4OUT_Board.pdf`,
  },
  {
    code: "IA003",
    name: "Pi I/O + UPS",
    line: "IA",
    tagline: "Digital, analog and a UPS for the Pi.",
    summary: "Digital and analog I/O plus an uninterruptible power supply for a Raspberry Pi in the field.",
    image: {
      src: "/images/products/ia003.webp",
      width: 419,
      height: 417,
      alt: "Armtronix IA003 Raspberry Pi I/O and UPS board with green terminals.",
      cutout: true,
    },
    interfaces: ["DI/DO", "ADC", "UPS", "RPi"],
    specs: [
      { label: "I/O", value: "Digital and analog" },
      { label: "Power", value: "On-board UPS" },
      { label: "Host", value: "Raspberry Pi" },
    ],
    retrofit: "For Pi-based gateways that must ride through power dips.",
    datasheet: `${DOCS}/IA003_RPi_4DIO_UPS.pdf`,
  },
  {
    code: "BA001",
    name: "Wi-Fi Dual Dimmer",
    line: "BA",
    tagline: "Virtual two-way control, phone or wall switch.",
    summary: "ESP8266 + ATmega328P dual dimmer with virtual two-way control from a phone or the existing physical switch.",
    image: { src: "/images/products/ba001.webp", width: 900, height: 626, alt: "Armtronix BA001 dimmer module in a grey and red enclosure.", cutout: true },
    interfaces: ["ESP8266", "ATmega328P", "2 ch"],
    specs: [
      { label: "MCUs", value: "ESP8266 + ATmega328P" },
      { label: "Channels", value: "2 dimmers" },
      { label: "Control", value: "Phone or physical switch (virtual two-way)" },
    ],
    retrofit: "For lighting circuits that should keep their wall switches.",
    datasheet: `${DOCS}/BA001_Wifi_Two_Triac_1A_Board%20(Mini).pdf`,
  },
  {
    code: "BA004",
    name: "Wi-Fi Single Triac Dimmer",
    line: "BA",
    tagline: "Fits inside the switch box.",
    summary: "100–240 V AC, 1 A triac dimmer with MQTT, HTTP and Alexa support, small enough for a standard switch box.",
    image: { src: "/images/products/ba004.webp", width: 517, height: 405, alt: "Armtronix BA004 Wi-Fi 1-Triac module, printed 'Made in India'.", cutout: true },
    interfaces: ["100–240 V AC", "MQTT", "HTTP", "Alexa"],
    specs: [
      { label: "Load", value: "100–240 V AC, 1 A" },
      { label: "Protocols", value: "MQTT, HTTP, Alexa" },
      { label: "Form factor", value: "Fits inside switch boxes" },
    ],
    retrofit: "For retrofitting a single dimmable load without rewiring.",
    datasheet: `${DOCS}/BA004_Wifi_One_Triac_Module.pdf`,
  },
  {
    code: "BA006",
    name: "Wi-Fi Single Relay",
    line: "BA",
    tagline: "One load, one relay, on Wi-Fi.",
    summary: "A single-relay Wi-Fi board for switching one load remotely.",
    image: { src: "/images/products/ba006.webp", width: 798, height: 706, alt: "Armtronix BA006 Wi-Fi single relay board with power module and ESP module.", cutout: false },
    interfaces: ["Relay", "Wi-Fi"],
    specs: [
      { label: "Outputs", value: "1 relay" },
      { label: "Network", value: "Wi-Fi" },
    ],
    retrofit: "For switching a single pump, fan or lamp remotely.",
    datasheet: `${DOCS}/BA006_Wifi_Single_Relay_Board.pdf`,
  },
  {
    code: "BA011",
    name: "Wi-Fi + BT Quad Relay",
    line: "BA",
    tagline: "Four relays, Wi-Fi and Bluetooth.",
    summary: "A four-relay board with Wi-Fi and Bluetooth on an ESP32.",
    image: { src: "/images/products/ba011.webp", width: 678, height: 668, alt: "Armtronix BA011 board with four blue relays and an ESP32 module.", cutout: false },
    interfaces: ["4 relays", "Wi-Fi", "BT"],
    specs: [
      { label: "Outputs", value: "4 relays" },
      { label: "Network", value: "Wi-Fi + Bluetooth" },
    ],
    retrofit: "For small panels that switch several loads.",
    datasheet: `${DOCS}/BA011_Wifi_BT_Quad_Relay_Board.pdf`,
  },
  {
    code: "BA014",
    name: "4-Triac with Power Monitoring",
    line: "BA",
    tagline: "Switch four loads and measure what they draw.",
    summary: "Four triac channels with power monitoring, so every switched load is also metered.",
    image: { src: "/images/products/ba014.webp", width: 850, height: 638, alt: "Armtronix BA014 four-triac board with power-monitoring circuitry and ESP module.", cutout: true },
    interfaces: ["4 triac", "Power monitor", "Wi-Fi"],
    specs: [
      { label: "Outputs", value: "4 triac channels" },
      { label: "Metering", value: "Per-board power monitoring" },
    ],
    retrofit: "For loads you need to switch and meter at the same time.",
    datasheet: `${DOCS}/BA014_Wifi_4T_PWR%20.pdf`,
  },
];

export const industrial = products.filter((p) => p.line === "IA");
export const building = products.filter((p) => p.line === "BA");

export function getProduct(code: string) {
  return products.find((p) => p.code.toLowerCase() === code.toLowerCase());
}
