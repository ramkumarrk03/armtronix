import Link from "next/link";
import { building, industrial } from "@/data/products";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TraceField } from "@/components/ui/TraceField";
import { DinRail } from "./DinRail";

/** J1 · Hardware: the real catalogue on a DIN rail. One rail, one line of BA codes. */
export function HardwareRack() {
  return (
    <section id="hardware" aria-labelledby="hardware-title" className="relative isolate overflow-hidden border-t border-line py-28 lg:py-40">
      <TraceField seed={11} density={0.8} />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionLabel refDes="J1" text="Hardware" />
        <h2 id="hardware-title" className="nameplate mt-5 text-[clamp(2.2rem,5.4vw,4.4rem)]">
          Clipped to the rail
        </h2>
        <p className="mt-5 max-w-[28rem] text-[17px] leading-relaxed text-ink-dim">
          Designed, built and tested in Hubballi.
        </p>

        <div className="mt-16">
          <DinRail products={industrial} label="Industrial · IA series" />
        </div>

        <nav aria-label="Building automation boards" className="mt-14 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.14em]">
          <span className="text-ink-dim">Building · BA series</span>
          {building.map((p) => (
            <Link key={p.code} href={`/products/${p.code.toLowerCase()}`} className="link-trace text-ink" title={p.name}>
              {p.code}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
