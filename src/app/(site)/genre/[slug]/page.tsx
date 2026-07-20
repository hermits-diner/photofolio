import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SheetRow } from "@/components/sheet-row";
import { Colophon, Masthead } from "@/components/site-chrome";
import { getAllSeries, getSettings } from "@/content";
import { GENRES, genreBySlug, matchesGenre } from "@/lib/genres";

export function generateStaticParams() {
  return GENRES.map((genre) => ({ slug: genre.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = genreBySlug(slug);
  if (!genre) return {};
  return {
    title: `${genre.label} SHEET`,
    description: `${genre.korean} 시트 목록.`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const genre = genreBySlug(slug);
  if (!genre) notFound();

  const [settings, allSeries] = await Promise.all([getSettings(), getAllSeries()]);
  const sheets = allSeries.filter((s) => matchesGenre(s.genre, genre));
  const totalFrames = sheets.reduce((n, s) => n + s.frames.length, 0);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead
        settings={settings}
        right={`${sheets.length} sheet${sheets.length === 1 ? "" : "s"}`}
      />

      <section className="pt-12 pb-10 lg:pt-20">
        <p className="rebate-type text-silver">
          작업
          <span className="mx-2 text-grease">▸▸▸</span>
          {genre.korean}
        </p>
        <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.86] font-medium tracking-[-0.015em] uppercase text-rebate">
          {genre.label}
          <span className="text-silver/60"> Sheet</span>
        </h1>
        {sheets.length > 0 && (
          <p className="note mt-6 text-silver">
            시트 {sheets.length}장 · 모두 {totalFrames}컷 프레임
          </p>
        )}
      </section>

      {/* The other stacks, one hop away. */}
      <nav aria-label="다른 분야" className="flex flex-wrap gap-2 pb-8">
        <Link
          href="/"
          className="rebate-type rounded border border-rebate/25 px-3 py-1.5 text-xs text-rebate transition-colors hover:border-grease hover:text-grease"
        >
          ALL
        </Link>
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genre/${g.slug}`}
            className={`rebate-type rounded border px-3 py-1.5 text-xs transition-colors hover:border-grease hover:text-grease ${
              g.slug === genre.slug
                ? "border-grease text-grease font-bold"
                : "border-rebate/25 text-rebate"
            }`}
          >
            {g.label}
          </Link>
        ))}
      </nav>

      <section aria-label={`${genre.korean} 시트`}>
        {sheets.map((series) => (
          <SheetRow key={series.id} series={series} />
        ))}
        {sheets.length === 0 && (
          <p className="border-t border-rebate/20 py-16 font-body text-lg text-silver">
            {genre.korean} 시트가 아직 없습니다. 시리즈의 분야를{" "}
            <span className="font-data">{genre.korean}</span> 로 지정하고 공개일을
            채우면 여기에 쌓입니다.
          </p>
        )}
      </section>

      <Colophon settings={settings} />
    </main>
  );
}
