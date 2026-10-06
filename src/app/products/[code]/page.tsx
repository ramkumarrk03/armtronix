import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";
import { ProductWidget } from "@/components/product/ProductWidget";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export function generateStaticParams() {
  return products.map((p) => ({ code: p.code.toLowerCase() }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/products/[code]">): Promise<Metadata> {
  const { code } = await params;
  const p = getProduct(code);
  return p ? { title: `${p.code} · ${p.name} · Armtronix`, description: p.summary } : {};
}

export default async function ProductPage({ params }: PageProps<"/products/[code]">) {
  const { code } = await params;
  const product = getProduct(code);
  if (!product) notFound();

  const siblings = products.filter((p) => p.line === product.line && p.code !== product.code).slice(0, 4);

  return (
    <main id="main" className="pt-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <Breadcrumb
          trail={[
            { label: "Home", href: "/" },
            { label: "Hardware", href: "/#hardware" },
            { label: product.code },
          ]}
        />

        <section aria-labelledby="product-title" className="grid gap-10 py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-16">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-dim">
              {product.line === "IA" ? "Industrial automation" : "Building automation"} · spec sheet
            </p>
            <h1 id="product-title" className="mt-3">
              <span className="nameplate block text-[clamp(3.4rem,10vw,8rem)] text-copper">{product.code}</span>
              <span className="mt-3 block text-[clamp(1.4rem,2.6vw,2.2rem)] font-semibold leading-tight [font-variation-settings:'wdth'_112]">
                {product.name}
              </span>
            </h1>
            <p className="mt-5 max-w-[36rem] text-[17px] leading-relaxed text-ink-dim">{product.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Interfaces">
              {product.interfaces.map((i) => (
                <li key={i} className="border border-copper/50 px-2 py-1 font-mono text-[12px] uppercase tracking-[0.1em] text-copper">
                  {i}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/retrofit?product=${product.code}&intent=quote#rfq`} className="btn-primary">
                Request a quote
              </Link>
              <Link href={`/retrofit?product=${product.code}&intent=sample#rfq`} className="btn-ghost">
                Request dev sample
              </Link>
              <a href={product.datasheet} target="_blank" rel="noreferrer" className="btn-ghost">
                Datasheet PDF ↗
              </a>
            </div>
          </div>

          <figure className="relative">
            <div className={`relative mx-auto ${product.image.cutout ? "max-w-[620px]" : "max-w-[720px] overflow-hidden border border-line-strong"}`}>
              <Image
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.width}
                height={product.image.height}
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`h-auto w-full ${product.image.cutout ? "drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]" : ""}`}
              />
            </div>
            <figcaption className="mt-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
              <span className="h-px w-8 bg-copper" aria-hidden />
              {product.code} · photographed by Armtronix
            </figcaption>
          </figure>
        </section>

        <ProductWidget code={product.code} />

        <section aria-labelledby="spec-title" className="grid gap-10 border-t border-line py-14 lg:grid-cols-[0.8fr_2fr]">
          <div>
            <SectionLabel refDes="TD" text="Technical data" />
            <h2 id="spec-title" className="nameplate mt-4 text-[clamp(1.6rem,3vw,2.6rem)]">
              Datasheet
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">{product.retrofit}</p>
          </div>
          <table className="w-full border-collapse border-t border-line-strong text-left">
            <caption className="sr-only">{product.code} technical data</caption>
            <tbody>
              {product.specs.map((s) => (
                <tr key={s.label} className="border-b border-line">
                  <th scope="row" className="w-[38%] py-3 pr-4 align-top font-mono text-[12px] font-normal uppercase tracking-[0.14em] text-ink-dim">
                    {s.label}
                  </th>
                  <td className="py-3 text-[15.5px]">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {siblings.length > 0 && (
          <section aria-labelledby="related-title" className="border-t border-line py-14">
            <h2 id="related-title" className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-dim">
              Same rail
            </h2>
            <ul className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {siblings.map((s) => (
                <li key={s.code} className="bg-bg">
                  <Link href={`/products/${s.code.toLowerCase()}`} className="group flex items-center gap-4 p-4">
                    <Image src={s.image.src} alt="" width={s.image.width} height={s.image.height} sizes="72px" className="h-14 w-[72px] object-contain" />
                    <span>
                      <span className="block font-mono text-[12px] text-copper">{s.code}</span>
                      <span className="block text-[14px] leading-snug group-hover:text-copper-hi">{s.name}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
