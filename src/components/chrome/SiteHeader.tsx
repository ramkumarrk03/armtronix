import Link from "next/link";
import { ThemeRocker } from "./ThemeRocker";
import { MobileNav } from "./MobileNav";
import { primaryNav } from "@/data/nav";

/** Instrument status strip rather than a SaaS navbar. */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-[6px]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Armtronix home">
          <span className="nameplate text-[17px] tracking-[0.02em] text-ink transition-colors duration-150 hover:text-copper-hi">
            Armtronix
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em]">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="whitespace-nowrap px-3 py-2 text-ink-dim transition-colors duration-150 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-4 md:gap-4">
          <ThemeRocker />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
