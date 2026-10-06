import Link from "next/link";

export type Crumb = { label: string; href?: string };

/**
 * Wayfinding for every sub-page: a clear back button plus the trail.
 * The back target is the last crumb with an href (the page you came from).
 */
export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  const parent = [...trail].reverse().find((c) => c.href);
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
      {parent?.href && (
        <Link
          href={parent.href}
          className="group inline-flex min-h-[40px] items-center gap-2 border border-line-strong px-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition-colors duration-150 hover:border-copper hover:text-copper-hi"
        >
          <span aria-hidden className="transition-transform duration-150 ease-snap group-hover:-translate-x-0.5">
            ←
          </span>
          Back<span className="sr-only"> to {parent.label}</span>
        </Link>
      )}
      <ol className="flex flex-wrap items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-dim">
        {trail.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="opacity-50">/</span>}
            {c.href ? (
              <Link href={c.href} className="link-trace hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-copper">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
