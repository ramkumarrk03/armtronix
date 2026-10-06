import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[100svh] items-center pt-14">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fault">● 404 · no carrier</p>
        <h1 className="nameplate mt-5 text-[clamp(2.4rem,7vw,5.6rem)]">
          Open circuit
        </h1>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed text-ink-dim">
          This trace doesn&apos;t lead anywhere. The page may have moved, or the address has a typo.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            ← Back to home
          </Link>
          <Link href="/#hardware" className="btn-ghost">
            Browse hardware
          </Link>
        </div>
      </div>
    </main>
  );
}
