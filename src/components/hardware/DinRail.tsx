"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/data/products";

type Props = {
  products: Product[];
  label: string;
  size?: "lg" | "sm";
};

/**
 * Modules clipped onto a DIN rail. Native horizontal scroll with snap
 * (touch-friendly), plus step buttons for mouse and keyboard users.
 */
export function DinRail({ products, label, size = "lg" }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const big = size === "lg";

  function step(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 24 : 320;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * w, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">{label}</p>
        <div className="flex gap-2">
          <RailButton onClick={() => step(-1)} label={`Previous ${label} module`} dir="left" />
          <RailButton onClick={() => step(1)} label={`Next ${label} module`} dir="right" />
        </div>
      </div>

      <div className="relative">
        {/* the rail itself: 35 mm top-hat profile with slots */}
        <div
          aria-hidden
          className={`din-rail pointer-events-none absolute inset-x-0 ${big ? "top-[150px] sm:top-[170px]" : "top-[98px]"}`}
        />
        <ul
          ref={trackRef}
          className="rail-track relative flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6"
          aria-label={label}
        >
          {products.map((p) => (
            <li key={p.code} className={`snap-start ${big ? "w-[280px] sm:w-[320px]" : "w-[220px]"} shrink-0`}>
              <article className="rail-module group relative h-full">
                <div className={`relative flex items-center justify-center ${big ? "h-[300px] sm:h-[340px]" : "h-[196px]"}`}>
                  <div
                    className={`rail-photo relative transition-transform duration-150 ease-snap group-hover:-translate-y-2 group-focus-within:-translate-y-2 ${
                      p.image.cutout ? "w-[86%]" : "w-[88%] overflow-hidden border border-line-strong"
                    }`}
                  >
                    <Image
                      src={p.image.src}
                      alt={p.image.alt}
                      width={p.image.width}
                      height={p.image.height}
                      sizes={big ? "320px" : "220px"}
                      className={`h-auto w-full ${p.image.cutout ? "drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)]" : "aspect-[4/3] object-cover"}`}
                    />
                  </div>
                </div>

                <div className="border-t border-line pt-4">
                  <p className="font-mono text-[12px] tracking-[0.14em] text-copper">{p.code}</p>
                  <h3 className={`mt-1 font-semibold leading-tight ${big ? "text-[19px]" : "text-[16px]"}`}>{p.name}</h3>
                  <Link
                    href={`/products/${p.code.toLowerCase()}`}
                    className="link-trace mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim after:absolute after:inset-0 after:content-['']"
                  >
                    Spec sheet →
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RailButton({ onClick, label, dir }: { onClick: () => void; label: string; dir: "left" | "right" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center border border-line-strong text-ink-dim transition-colors duration-150 hover:border-copper hover:text-copper"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
        <path d={dir === "left" ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"} stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </button>
  );
}
