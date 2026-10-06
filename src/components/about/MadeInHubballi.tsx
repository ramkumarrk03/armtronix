import { SectionLabel } from "@/components/ui/SectionLabel";
import { TraceField } from "@/components/ui/TraceField";

const PROCESS = ["Schematic", "Layout", "Assembly", "QC", "Ship"];

function StepGlyph({ i }: { i: number }) {
  const paths = [
    "M2 12 H8 M8 7 V17 M11 7 V17 M11 12 H22",
    "M3 4 H21 V20 H3 Z M7 8 H12 V12 H17 M7 16 H10",
    "M5 18 L12 6 L19 18 Z M9 14 H15",
    "M3 12 H7 L9 6 L13 18 L15 12 H21",
    "M3 8 H15 V17 H3 Z M15 11 H19 L21 14 V17 H15",
  ];
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-copper" aria-hidden>
      <path d={paths[i]} stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

/** Design-to-production under one roof: a single line of process. */
export function MadeInHubballi() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative isolate overflow-hidden border-t border-line py-28 lg:py-40">
      <TraceField seed={37} density={0.7} />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionLabel refDes="Q1" text="Made in Hubballi" />
        <h2 id="about-title" className="nameplate mt-5 text-[clamp(2.2rem,5.4vw,4.4rem)]">
          One roof, <span className="text-copper">since 2015</span>
        </h2>
        <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-ink-dim">
          Founded by Naren Nagesh Nayak and Hemanth M Surakod at KLE Tech Park, Hubballi.
        </p>

        <ol className="mt-20 flex flex-wrap items-center gap-x-4 gap-y-8 sm:flex-nowrap">
          {PROCESS.map((p, i) => (
            <li key={p} className="flex flex-1 items-center gap-4">
              <span className="flex flex-col items-start gap-3">
                <StepGlyph i={i} />
                <span className="font-mono text-[12px] uppercase tracking-[0.18em]">{p}</span>
              </span>
              {i < PROCESS.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-line-strong sm:block" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
