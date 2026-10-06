import { HeroStage } from "./HeroStage";

const POST = [
  { text: "POST", d: 0 },
  { text: "24 V ok", d: 300 },
  { text: "wi-fi", d: 600 },
  { text: "mqtt connected", d: 900 },
];

export function Hero() {
  return (
    <HeroStage>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center px-4 pb-16 pt-10 text-center sm:px-6 lg:px-10">
        <div data-hero-content className="flex max-w-[760px] flex-col items-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink-dim">
            Industrial IoT hardware · Hubballi
          </p>

          <h1 id="hero-title" className="nameplate mt-7 text-[clamp(3.2rem,10vw,9rem)] text-ink">
            <span className="block">Retro</span>
            <span className="flex items-center justify-center gap-[0.12em]">
              <svg aria-hidden viewBox="0 0 120 40" className="hero-arrow h-[0.5em] w-[1.1em] shrink-0 text-copper">
                <path d="M0 20 H96" stroke="currentColor" strokeWidth="7" fill="none" />
                <path d="M84 6 L104 20 L84 34" stroke="currentColor" strokeWidth="7" fill="none" strokeLinejoin="miter" />
                <circle cx="6" cy="20" r="6" fill="currentColor" />
              </svg>
              <span className="normal-case">IIoT</span>
            </span>
          </h1>

          <p className="mt-8 max-w-[32rem] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-ink-dim">
            Connect the machines you already run. No replacements, just a board on the rail.
          </p>

          <div className="mt-11 flex flex-col items-center gap-3 sm:flex-row">
            <a href="#engineers" className="btn-primary min-w-[220px] justify-center">
              I&apos;m an engineer
            </a>
            <a href="#buyers" className="btn-ghost min-w-[220px] justify-center bg-bg/40">
              I&apos;m a buyer
            </a>
          </div>

          <p
            aria-label="Board self-test passed"
            className="mt-12 flex flex-wrap items-center justify-center gap-x-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim"
          >
            {POST.map((seg, i) => (
              <span
                key={seg.text}
                className={`post-seg ${i === POST.length - 1 ? "text-signal" : ""}`}
                style={{ ["--d" as string]: `${seg.d}ms` }}
              >
                {i > 0 && <span className="mr-2 opacity-50">·</span>}
                {seg.text}
              </span>
            ))}
          </p>
        </div>
      </div>
    </HeroStage>
  );
}
