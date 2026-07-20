import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactSheet } from "@/components/contact-sheet";
import { LogLine } from "@/components/log-line";
import { Colophon, Masthead } from "@/components/site-chrome";
import { getSeries, getSeriesSlugs, getSettings } from "@/content";

export async function generateStaticParams() {
  const slugs = await getSeriesSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug, { stega: false });
  if (!series) return {};
  return {
    title: `${series.title} — Sheet ${series.sheetNumber}`,
    description: series.statement ?? undefined,
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, series] = await Promise.all([getSettings(), getSeries(slug)]);
  if (!series) notFound();

  const selects = series.frames.filter((f) => f.select).length;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead settings={settings} right={series.shotOver} />

      <section className="grid gap-10 pt-12 pb-16 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:pt-20 lg:pb-20">
        <div>
          <p className="rebate-type text-silver">
            {series.genre ?? series.location ?? series.camera}
            <span className="mx-2 text-grease">▸▸▸</span>
            Sheet {series.sheetNumber}
          </p>

          <h1 className="mt-4 font-display text-[clamp(3rem,10vw,8rem)] leading-[0.86] font-medium tracking-[-0.015em] uppercase">
            {series.titleLatin}
          </h1>
          <p className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {series.title}
          </p>

          {series.statement && (
            <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-rebate/85 sm:text-xl">
              {series.statement}
            </p>
          )}

          <p className="note mt-10 text-silver">
            {series.frames.length}컷 중 {selects}컷 셀렉트
          </p>
        </div>

        {/* What the session actually was: where, with what, how much of it. */}
        <dl className="self-end lg:pb-3">
          <LogLine label="Sheet" value={series.sheetNumber} />
          <LogLine label="Genre" value={series.genre} />
          <LogLine label="Location" value={series.location} />
          <LogLine label="Camera" value={series.camera} />
          <LogLine label="Lens" value={series.lenses} />
          <LogLine label="Frames" value={`${series.frames.length}`} />
        </dl>
      </section>

      <section aria-labelledby="sheet-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
          <h2 id="sheet-heading" className="sr-only">
            Sheet {series.sheetNumber} 컨택트시트
          </h2>
          <p className="note text-silver">
            프레임을 누르면 크게 볼 수 있습니다 ·{" "}
            <span className="text-grease">✕</span> 표시는 셀렉트
          </p>
          <Link href="/" className="rebate-type text-silver hover:text-grease">
            ← 모든 시트
          </Link>
        </div>

        <ContactSheet frames={series.frames} />
      </section>

      <Colophon settings={settings} />
    </main>
  );
}
