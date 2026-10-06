import { IOBench } from "@/components/widgets/IOBench";
import { LoopBench } from "@/components/widgets/LoopBench";
import { SectionLabel } from "@/components/ui/SectionLabel";

const COPY: Record<string, { title: string; body: string }> = {
  IA009: {
    title: "Flip an input. Watch the output follow.",
    body: "Twelve inputs on one side of the opto-isolation barrier, twelve outputs on the other. Pick the logic, switch any input and see the MQTT messages the board would publish.",
  },
  IA015: {
    title: "Drag the loop. Read the tank.",
    body: "4 mA is empty, 20 mA is full. Below 3.6 mA the loop is open, so the reading is flagged as a fault rather than shown as an empty tank, which is how a real control system should treat it.",
  },
};

/** Live widget for products that have one. */
export function ProductWidget({ code }: { code: string }) {
  const copy = COPY[code];
  if (!copy) return null;
  return (
    <section aria-labelledby="bench-title" className="border-t border-line py-14">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_2fr]">
        <div>
          <SectionLabel refDes="J2" text="Live bench" />
          <h2 id="bench-title" className="mt-4 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-tight [font-variation-settings:'wdth'_112]">
            {copy.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">{copy.body}</p>
        </div>
        {code === "IA009" ? <IOBench /> : <LoopBench />}
      </div>
    </section>
  );
}
