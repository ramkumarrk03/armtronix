"use client";

import { useId, useState, type FormEvent } from "react";

export type Intent = "quote" | "sample" | "consult";

const INTENT_LABEL: Record<Intent, string> = {
  quote: "Request a quote",
  sample: "Request a dev sample",
  consult: "Book a retrofit consultation",
};

type Fields = { name: string; company: string; email: string; phone: string; qty: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (f.company.trim().length < 2) e.company = "Enter your company or plant.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid work email, like name@plant.in.";
  if (f.phone.trim() && !/^[+\d][\d\s-]{7,15}$/.test(f.phone.trim())) e.phone = "Use digits, spaces or + only.";
  if (!f.qty) e.qty = "Pick a rough quantity.";
  return e;
}

function ticketFor(f: Fields, code?: string) {
  let h = 0;
  for (const c of f.email + f.company) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `RFQ-${code ?? "GEN"}-${String(h % 10000).padStart(4, "0")}`;
}

/** Mock RFQ: validates on the client, never posts anywhere. */
export function RfqForm({ productCode, initialIntent }: { productCode?: string; initialIntent: Intent }) {
  const uid = useId();
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [fields, setFields] = useState<Fields>({ name: "", company: "", email: "", phone: "", qty: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function set<K extends keyof Fields>(k: K, v: string) {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate(fields);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 1100);
  }

  const field = (k: keyof Fields, label: string, opts: { type?: string; required?: boolean; autoComplete?: string } = {}) => (
    <div>
      <label htmlFor={`${uid}-${k}`} className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">
        {label} {opts.required ? <span className="text-copper">*</span> : <span className="normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={`${uid}-${k}`}
        type={opts.type ?? "text"}
        value={fields[k]}
        autoComplete={opts.autoComplete}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `${uid}-${k}-err` : undefined}
        className="field-input mt-1.5"
      />
      {errors[k] && (
        <p id={`${uid}-${k}-err`} className="mt-1.5 font-mono text-[11px] text-fault">
          {errors[k]}
        </p>
      )}
    </div>
  );

  if (status === "sent") {
    return (
      <section id="rfq" aria-labelledby="rfq-done" className="scroll-mt-20 border border-copper bg-bg/80 p-5 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ok">● Packet delivered · ACK</p>
        <h2 id="rfq-done" className="nameplate mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)]">
          Logged on
          <br />
          the bench
        </h2>
        <dl className="mt-6 divide-y divide-line border-y border-line font-mono text-[12.5px]">
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-dim">Ticket</dt>
            <dd className="text-signal">{ticketFor(fields, productCode)}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-dim">Request</dt>
            <dd>{INTENT_LABEL[intent]}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-dim">Board</dt>
            <dd className="text-copper">{productCode ?? "To be advised"}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-dim">Reply to</dt>
            <dd className="break-all text-right">{fields.email}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-dim">
          An Armtronix engineer in Hubballi reviews every request. This demo build doesn&apos;t transmit
          forms, so for a real enquiry write to{" "}
          <a href="mailto:info@armtronix.in" className="link-trace text-ink">
            info@armtronix.in
          </a>{" "}
          or call{" "}
          <a href="tel:+919880310042" className="link-trace text-ink">
            +91 98803 10042
          </a>
          .
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn-ghost mt-6">
          ← Edit request
        </button>
      </section>
    );
  }

  return (
    <section id="rfq" aria-labelledby="rfq-title" className="scroll-mt-20 border border-line bg-bg/80 p-5 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">RFQ · request for quote</p>
      <h2 id="rfq-title" className="mt-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-tight [font-variation-settings:'wdth'_112]">
        Tell us about the machine
      </h2>
      {productCode && (
        <p className="mt-3 font-mono text-[12px] text-ink-dim">
          Board: <span className="text-copper">{productCode}</span>
        </p>
      )}

      <form noValidate onSubmit={submit} className="mt-6 space-y-5">
        <fieldset>
          <legend className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">I want to</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(Object.keys(INTENT_LABEL) as Intent[]).map((k) => (
              <label key={k} className={`flex cursor-pointer items-center gap-2 border px-3 py-2.5 text-[13.5px] transition-colors duration-100 ${intent === k ? "border-copper text-ink" : "border-line-strong text-ink-dim hover:text-ink"}`}>
                <input type="radio" name={`${uid}-intent`} value={k} checked={intent === k} onChange={() => setIntent(k)} className="accent-[var(--copper)]" />
                {k === "quote" ? "Get a quote" : k === "sample" ? "Dev sample" : "Consultation"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          {field("name", "Name", { required: true, autoComplete: "name" })}
          {field("company", "Company / plant", { required: true, autoComplete: "organization" })}
          {field("email", "Work email", { type: "email", required: true, autoComplete: "email" })}
          {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
        </div>

        <div>
          <label htmlFor={`${uid}-qty`} className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">
            Quantity <span className="text-copper">*</span>
          </label>
          <select
            id={`${uid}-qty`}
            value={fields.qty}
            onChange={(e) => set("qty", e.target.value)}
            aria-invalid={!!errors.qty}
            aria-describedby={errors.qty ? `${uid}-qty-err` : undefined}
            className="field-input mt-1.5"
          >
            <option value="">Select…</option>
            <option value="proto">1–5 · prototype / pilot</option>
            <option value="small">6–50 · one line or site</option>
            <option value="med">51–500 · multiple sites</option>
            <option value="oem">500+ · OEM / white-label</option>
          </select>
          {errors.qty && (
            <p id={`${uid}-qty-err`} className="mt-1.5 font-mono text-[11px] text-fault">
              {errors.qty}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${uid}-message`} className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">
            Machine &amp; signals <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id={`${uid}-message`}
            rows={4}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="e.g. 6 energy meters on one RS485 bus, need Modbus TCP into our SCADA"
            className="field-input mt-1.5 resize-y"
          />
        </div>

        <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center disabled:opacity-80">
          {status === "sending" ? "Transmitting…" : `${INTENT_LABEL[intent]} →`}
        </button>
        {status === "sending" && (
          <div className="h-px w-full overflow-hidden bg-line" aria-hidden>
            <div className="rfq-packet h-px w-1/4 bg-signal" />
          </div>
        )}
      </form>
    </section>
  );
}
