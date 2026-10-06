import Link from "next/link";
import { TraceField } from "@/components/ui/TraceField";

const CONTACT = [
  { k: "Email", v: "info@armtronix.in", href: "mailto:info@armtronix.in" },
  { k: "Phone", v: "+91 98803 10042", href: "tel:+919880310042" },
  { k: "Web", v: "armtronix.in", href: "https://armtronix.in" },
];

const SOCIAL = [
  { k: "GitHub", href: "https://github.com/armtronix" },
  { k: "X / Twitter", href: "https://x.com/armtronix_india" },
  { k: "Facebook", href: "https://facebook.com/Armtronix" },
];

/** The board edge: mounting holes, fiducials and the silkscreen footer. */
export function SiteFooter() {
  return (
    <footer id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden border-t border-line bg-mask/40">
      <TraceField seed={53} density={0.6} />
      <MountingHole className="left-4 top-4" />
      <MountingHole className="right-4 top-4" />
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-28 lg:pt-36 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">TP · Contact</p>
            <h2 id="contact-title" className="nameplate mt-4 text-[clamp(2.2rem,6vw,5rem)]">
              Bring us your
              <br />
              oldest machine
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/retrofit" className="btn-primary">
                Start a retrofit →
              </Link>
              <Link href="/retrofit?intent=quote#rfq" className="btn-ghost">
                Request a quote
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:self-end">
            <dl className="space-y-4">
              {CONTACT.map((c) => (
                <div key={c.k}>
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">{c.k}</dt>
                  <dd className="mt-1 text-[17px]">
                    <a href={c.href} className="link-trace" {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                      {c.v}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">Bench</p>
                <address className="mt-1 text-[15px] not-italic leading-relaxed">
                  First Floor, KLE Tech Park Building
                  <br />
                  KLE Technological University, Vidyanagar
                  <br />
                  Hubballi, Karnataka, India
                </address>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em]">
                {SOCIAL.map((s) => (
                  <li key={s.k}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="link-trace text-ink-dim">
                      {s.k} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim sm:flex-row sm:items-center sm:justify-between">
          <span>Armtronix IoT Pvt. Ltd. · Armtronix Technologies LLP</span>
          <span>Designed &amp; made in Hubballi, India · telemetry simulated</span>
        </div>
      </div>
    </footer>
  );
}

function MountingHole({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute grid h-6 w-6 place-items-center rounded-full border border-copper/60 ${className}`}>
      <span className="h-3 w-3 rounded-full border border-copper/60" />
    </span>
  );
}
