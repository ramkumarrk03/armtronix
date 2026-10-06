import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TraceField } from "@/components/ui/TraceField";
import { MqttConsole } from "./MqttConsole";

/** Two audiences, two terminals. One sentence and one proof each. */
export function Paths() {
  return (
    <section id="paths" aria-labelledby="paths-title" className="relative isolate overflow-hidden border-t border-line py-28 lg:py-40">
      <TraceField seed={23} density={0.7} />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionLabel refDes="X1" text="Two paths" />
        <h2 id="paths-title" className="nameplate mt-5 text-[clamp(2.2rem,5.4vw,4.4rem)]">
          Same board, two reasons
        </h2>

        <div className="mt-20 grid gap-20 lg:grid-cols-2 lg:gap-16">
          <article id="engineers" aria-labelledby="eng-title" className="scroll-mt-24">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">01 · Engineer</p>
            <h3 id="eng-title" className="mt-4 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-tight [font-variation-settings:'wdth'_112]">
              Open hardware you can flash and script.
            </h3>
            <p className="mt-4 max-w-[30rem] text-[16px] leading-relaxed text-ink-dim">
              Arduino-IDE compatible, MQTT and Modbus out of the box, code on GitHub.
            </p>
            <div className="mt-10">
              <MqttConsole />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/retrofit?intent=sample" className="btn-primary">
                Request a dev sample
              </Link>
              <a href="https://github.com/armtronix" target="_blank" rel="noreferrer" className="btn-ghost">
                GitHub ↗
              </a>
            </div>
          </article>

          <article id="buyers" aria-labelledby="buy-title" className="scroll-mt-24">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">02 · Buyer</p>
            <h3 id="buy-title" className="mt-4 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-tight [font-variation-settings:'wdth'_112]">
              Connect machines. Don&apos;t replace them.
            </h3>
            <p className="mt-4 max-w-[30rem] text-[16px] leading-relaxed text-ink-dim">
              One DIN-rail module on the signals you already have. Designed and built in Hubballi.
            </p>

            <div className="mt-10 grid grid-cols-2 border-y border-line">
              <div className="py-6 pr-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">Replace</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-dim line-through decoration-fault/60">
                  New machine, new wiring, line stopped
                </p>
              </div>
              <div className="border-l border-line py-6 pl-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-copper">Retrofit</p>
                <p className="mt-3 text-[15px] leading-relaxed">Same machine, one module, data on MQTT</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/retrofit" className="btn-primary">
                Find my retrofit →
              </Link>
              <Link href="/retrofit?intent=consult#rfq" className="btn-ghost">
                Talk to an engineer
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
