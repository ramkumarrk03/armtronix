import type { Metadata } from "next";
import { RetrofitFinder } from "@/components/retrofit/RetrofitFinder";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getProduct } from "@/data/products";

export const metadata: Metadata = {
  title: "Retrofit Finder · Armtronix",
  description: "Three questions to the Armtronix board that connects your existing machine, then request a quote or a dev sample.",
};

const INTENTS = ["quote", "sample", "consult"] as const;
type Intent = (typeof INTENTS)[number];

export default async function RetrofitPage({ searchParams }: PageProps<"/retrofit">) {
  const sp = await searchParams;
  const rawIntent = typeof sp.intent === "string" ? sp.intent : "quote";
  const intent: Intent = (INTENTS as readonly string[]).includes(rawIntent) ? (rawIntent as Intent) : "quote";
  const productCode = typeof sp.product === "string" ? getProduct(sp.product)?.code : undefined;

  return (
    <main id="main" className="pt-14">
      <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
        <Breadcrumb
          trail={
            productCode
              ? [
                  { label: "Home", href: "/" },
                  { label: "Hardware", href: "/#hardware" },
                  { label: productCode, href: `/products/${productCode.toLowerCase()}` },
                  { label: "Retrofit" },
                ]
              : [{ label: "Home", href: "/" }, { label: "Retrofit finder" }]
          }
        />
        <header className="grid gap-6 pb-10 pt-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:pt-16">
          <div>
            <SectionLabel refDes="RF" text="Retrofit finder" />
            <h1 className="nameplate mt-4 text-[clamp(2.4rem,7vw,5.6rem)]">
              What&apos;s on
              <br />
              your floor?
            </h1>
          </div>
          <p className="max-w-[32rem] text-[16px] leading-relaxed text-ink-dim lg:justify-self-end">
            Answer three questions about the machine you already run. We&apos;ll match it to the
            Armtronix board that connects it, then you can ask for a quote, a dev sample or a
            consultation.
          </p>
        </header>
        <RetrofitFinder initialIntent={intent} initialProduct={productCode} />
      </div>
    </main>
  );
}
