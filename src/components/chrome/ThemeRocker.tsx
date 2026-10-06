"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type ThemeName } from "@/lib/theme";

function readTheme(): ThemeName {
  return document.documentElement.getAttribute("data-theme") === "sheet"
    ? "sheet"
    : "bench";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/**
 * A panel-mount rocker switch: BENCH (dark) / SHEET (light).
 * Physical metaphor instead of a sun/moon icon; snaps in 120 ms, no bounce.
 */
export function ThemeRocker() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "bench");
  const isSheet = theme === "sheet";

  function toggle() {
    const next: ThemeName = isSheet ? "bench" : "sheet";
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
    window.setTimeout(() => root.classList.remove("theme-transition"), 220);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isSheet}
      aria-label="Datasheet mode (light theme)"
      onClick={toggle}
      className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim"
    >
      <span aria-hidden className={`hidden sm:inline ${isSheet ? "" : "text-ink"}`}>
        Bench
      </span>
      <span
        aria-hidden
        className="relative block h-7 w-[46px] rounded-[3px] border border-line-strong bg-bg-raised p-[3px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
      >
        {/* rocker paddle */}
        <span
          className={`absolute top-[3px] bottom-[3px] w-[19px] rounded-[2px] border border-line-strong transition-[left,background-color] duration-[120ms] ease-snap ${
            isSheet
              ? "left-[calc(100%-22px)] bg-ink"
              : "left-[3px] bg-copper"
          }`}
        >
          <span className="absolute inset-x-[5px] top-1/2 h-px -translate-y-1/2 bg-bg/60" />
        </span>
        <span className="absolute left-[9px] top-1/2 h-[9px] w-px -translate-y-1/2 bg-ink-dim/40" />
        <span className="absolute right-[8px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full border border-ink-dim/40" />
      </span>
      <span aria-hidden className={`hidden sm:inline ${isSheet ? "text-ink" : ""}`}>
        Sheet
      </span>
    </button>
  );
}
