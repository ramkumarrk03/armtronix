"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProduct } from "@/data/products";
import { QUESTIONS, recommend, type Answers } from "@/data/retrofit";
import { RfqForm, type Intent } from "./RfqForm";

type Props = { initialIntent: Intent; initialProduct?: string };

/** Three questions → one recommended board → RFQ. */
export function RetrofitFinder({ initialIntent, initialProduct }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(initialProduct ? QUESTIONS.length : 0);
  const [chosen, setChosen] = useState<string | undefined>(initialProduct);

  const done = step >= QUESTIONS.length;
  const rec = chosen ? { code: chosen, reasons: [] as string[] } : done ? recommend(answers) : null;
  const product = rec ? getProduct(rec.code) : undefined;

  function pick(qid: (typeof QUESTIONS)[number]["id"], oid: string) {
    setAnswers((a) => ({ ...a, [qid]: oid }));
    setStep((s) => s + 1);
  }

  function restart() {
    setAnswers({});
    setChosen(undefined);
    setStep(0);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
      <section aria-labelledby="finder-title" className="border border-line bg-bg/70">
        <h2 id="finder-title" className="sr-only">
          Retrofit finder
        </h2>

        {/* progress rail: a trace with one via per question */}
        <ol className="flex items-center gap-0 border-b border-line px-4 py-4 sm:px-6" aria-label="Progress">
          {QUESTIONS.map((q, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <li key={q.id} className="flex flex-1 items-center last:flex-none">
                <button
                  type="button"
                  disabled={i > step || !!chosen}
                  onClick={() => setStep(i)}
                  aria-current={state === "active" ? "step" : undefined}
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] disabled:cursor-default"
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full border ${
                      state === "done" ? "border-copper bg-copper text-bg" : state === "active" ? "border-signal text-signal" : "border-line-strong text-ink-dim"
                    }`}
                  >
                    {state === "done" ? "✓" : q.n.slice(1)}
                  </span>
                  <span className={`hidden sm:inline ${state === "todo" ? "text-ink-dim" : "text-ink"}`}>{q.id}</span>
                </button>
                {i < QUESTIONS.length - 1 && (
                  <span aria-hidden className="mx-3 h-px flex-1 bg-line-strong">
                    <span className="block h-px bg-copper transition-[width] duration-200 ease-linear" style={{ width: i < step ? "100%" : "0%" }} />
                  </span>
                )}
              </li>
            );
          })}
          <li className="ml-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            <span className={done ? "text-signal" : ""}>→ board</span>
          </li>
        </ol>

        <div className="p-4 sm:p-6" aria-live="polite">
          {!done &&
            QUESTIONS.map(
              (q, i) =>
                i === step && (
                  <fieldset key={q.id}>
                    <legend className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                      Question {q.n} of 03
                    </legend>
                    <p className="mt-2 text-[clamp(1.3rem,2.2vw,1.8rem)] font-semibold leading-tight [font-variation-settings:'wdth'_112]">
                      {q.title}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {q.options.map((o) => {
                        const selected = answers[q.id] === o.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => pick(q.id, o.id)}
                            aria-pressed={selected}
                            className={`cta-terminal text-left ${selected ? "border-copper" : ""}`}
                          >
                            <span className="cta-terminal__pin" aria-hidden />
                            <span>
                              <span className="block text-[15.5px] font-semibold leading-snug">{o.label}</span>
                              <span className="mt-1 block font-mono text-[11px] text-ink-dim">{o.hint}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {i > 0 && (
                      <button type="button" onClick={() => setStep(i - 1)} className="link-trace mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                        ← Back
                      </button>
                    )}
                  </fieldset>
                ),
            )}

          {done && product && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
                {chosen ? "Selected board" : "Recommended board"}
              </p>
              <div className="mt-4 grid items-center gap-6 sm:grid-cols-[200px_1fr]">
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  width={product.image.width}
                  height={product.image.height}
                  sizes="200px"
                  className={`h-auto w-full ${product.image.cutout ? "drop-shadow-[0_16px_20px_rgba(0,0,0,0.5)]" : "border border-line-strong"}`}
                />
                <div>
                  <p className="nameplate text-[44px] text-copper">{product.code}</p>
                  <p className="mt-1 text-[19px] font-semibold">{product.name}</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">{product.tagline}</p>
                </div>
              </div>
              {rec && rec.reasons.length > 0 && (
                <ul className="mt-6 space-y-2 border-t border-line pt-5">
                  {rec.reasons.map((r) => (
                    <li key={r} className="flex gap-3 text-[15px]">
                      <span className="text-ok" aria-hidden>
                        ✓
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/products/${product.code.toLowerCase()}`} className="btn-ghost">
                  Open spec sheet →
                </Link>
                <button type="button" onClick={restart} className="btn-ghost">
                  ↺ Run the finder again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <RfqForm key={product?.code ?? "none"} productCode={product?.code} initialIntent={initialIntent} />
    </div>
  );
}
