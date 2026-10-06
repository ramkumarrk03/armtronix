"use client";

import { useEffect, useId, useState } from "react";
import { homeNav, primaryNav } from "@/data/nav";

/** Phone navigation: a terminal-style drop panel under the status strip. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 border border-line-strong px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink"
      >
        <span aria-hidden className="flex w-3.5 flex-col gap-[3px]">
          <span className={`h-px bg-current transition-transform duration-150 ${open ? "translate-y-[4px] rotate-45" : ""}`} />
          <span className={`h-px bg-current transition-opacity duration-100 ${open ? "opacity-0" : ""}`} />
          <span className={`h-px bg-current transition-transform duration-150 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
        </span>
        Menu
      </button>
      <nav
        id={id}
        aria-label="Primary"
        hidden={!open}
        className="absolute inset-x-0 top-14 border-b border-line bg-bg px-4 pb-6 pt-2"
      >
        <ul className="divide-y divide-line">
          {[homeNav, ...primaryNav].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-4 font-mono text-[13px] uppercase tracking-[0.16em] text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
