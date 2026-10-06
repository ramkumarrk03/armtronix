"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMeter } from "@/lib/useMeter";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SignalDiagram, STAGES } from "./SignalDiagram";
import { STAGE_COPY } from "./stages";

gsap.registerPlugin(ScrollTrigger);

const PIN_LENGTH = 2600; // px of scroll the story occupies on desktop

/**
 * U1 · Signal Path. Desktop: the section pins and scroll drives one signal
 * through five stations. Phones and reduced motion: the same schematic,
 * stacked as five cropped panels with no pinning.
 */
export function SignalPath() {
  const reduced = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(false);
  const meter = useMeter(true);

  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setPinned(true);
      triggerRef.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${PIN_LENGTH}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
      });
      return () => {
        triggerRef.current = null;
        setPinned(false);
      };
    });
    return () => mm.revert();
  }, []);

  // Keyboard / click: jump the scroll to a station
  function goTo(i: number) {
    const st = triggerRef.current;
    if (!st) return;
    const target = st.start + ((i + 0.5) / STAGES) * (st.end - st.start);
    window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  }

  const stage = Math.min(STAGES - 1, Math.floor(progress * STAGES));

  return (
    <section id="signal-path" aria-labelledby="signal-title" className="relative border-t border-line">
      {/* Desktop pinned story */}
      <div ref={pinRef} className="hidden lg:block">
        {/* Pinned: exactly one screen, clipped so nothing can bleed into the next section.
            Not pinned (no JS yet, or reduced motion): normal flow, every station open. */}
        <div
          className={`mx-auto grid max-w-[1440px] grid-cols-[minmax(300px,0.8fr)_2fr] gap-12 px-10 ${
            pinned ? "h-[100svh] overflow-hidden pb-10 pt-24" : "py-28"
          }`}
        >
          <div className="flex flex-col">
            <SectionLabel refDes="U1" text="Signal path" />
            <h2 id="signal-title" className="nameplate mt-4 text-[clamp(2rem,3.4vw,3.2rem)]">
              One signal,
              <br />
              five stations
            </h2>
            <ol className="mt-8 flex flex-col">
              {STAGE_COPY.map((s, i) => {
                const active = pinned ? i === stage : true;
                const done = pinned ? i < stage : true;
                return (
                  <li key={s.n} className="border-t border-line">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      disabled={!pinned}
                      aria-current={active ? "step" : undefined}
                      className="group flex w-full items-baseline gap-3 py-3 text-left"
                    >
                      <span className={`font-mono text-[11px] ${active ? "text-signal" : done ? "text-copper" : "text-ink-dim"}`}>
                        {s.n}
                      </span>
                      <span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${active ? "text-ink" : "text-ink-dim group-hover:text-ink"}`}>
                        {s.key}
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-snap ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-4 text-[17px] font-semibold leading-snug text-ink">{s.title}</p>
                        <p className="pb-5 text-[15px] leading-relaxed text-ink-dim">{s.body}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={`relative flex min-h-0 flex-col ${pinned ? "" : "sticky top-24 self-start"}`}>
            <div className={`relative flex min-h-0 items-center ${pinned ? "flex-1" : "aspect-[1000/520]"}`}>
              <SignalDiagram
                progress={pinned ? progress : 1}
                reading={meter.reading}
                history={meter.history}
                className="h-full max-h-full w-full"
              />
            </div>
            <div className="mt-4 h-px w-full bg-line">
              <div className="h-px bg-signal" style={{ width: `${(pinned ? progress : 1) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Phones / tablets: stacked stations, no pinning */}
      <div className="px-4 py-20 sm:px-6 lg:hidden">
        <SectionLabel refDes="U1" text="Signal path" />
        <h2 className="nameplate mt-4 text-[clamp(2rem,8vw,3rem)]">
          One signal,
          <br />
          five stations
        </h2>
        <ol className="relative mt-10 flex flex-col gap-10 border-l border-copper/50 pl-5">
          {STAGE_COPY.map((s) => (
            <li key={s.n} className="relative">
              <span aria-hidden className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border border-copper bg-bg" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
                <span className="text-signal">{s.n}</span> · {s.key}
              </p>
              <p className="mt-2 text-[18px] font-semibold leading-snug">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{s.body}</p>
              <div className="mt-5">
                <SignalDiagram
                  progress={1}
                  reading={meter.reading}
                  history={meter.history}
                  viewBox={s.viewBox}
                  title={`${s.key} stage of the signal chain`}
                  className="max-h-[300px] w-full"
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
