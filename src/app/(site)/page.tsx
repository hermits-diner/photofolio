import Link from "next/link";

import { SheetRow } from "@/components/sheet-row";
import { Colophon, Masthead } from "@/components/site-chrome";
import { getAllSeries, getSettings } from "@/content";
import { GENRES, matchesGenre } from "@/lib/genres";

export default async function Page() {
  const [settings, allSeries] = await Promise.all([getSettings(), getAllSeries()]);
  const totalFrames = allSeries.reduce((n, s) => n + s.frames.length, 0);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead
        settings={settings}
        right={`${allSeries.length} sheet${allSeries.length === 1 ? "" : "s"}`}
      />

      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="inline-block bg-rebate/5 border border-rebate/10 px-3 py-1 rounded text-xs rebate-type text-silver mb-4">
          DIGITAL CONTACT SHEET ARCHIVE
        </div>
        <h1 className="font-display text-[clamp(3.75rem,13vw,10.5rem)] leading-[0.84] font-medium tracking-[-0.015em] uppercase text-rebate">
          {settings.aliasLatin}
        </h1>
        {settings.alias !== settings.aliasLatin && (
          <p className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl text-rebate/90">
            {settings.alias}
          </p>
        )}

        <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-rebate/85 sm:text-xl">
          {settings.statement}
        </p>

        <div className="note mt-10 text-silver flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-grease" />
          <span>시트 {allSeries.length}장 · 모두 {totalFrames}컷 프레임</span>
        </div>
      </section>

      {/* Kenna keeps galleries by theme; here every theme is a stack of sheets. */}
      <nav aria-label="분야별 시트" className="flex flex-wrap gap-2 pb-8">
        {GENRES.map((genre) => {
          const count = allSeries.filter((s) => matchesGenre(s.genre, genre)).length;
          return (
            <Link
              key={genre.slug}
              href={`/genre/${genre.slug}`}
              className={`rebate-type rounded border px-3 py-1.5 text-xs transition-colors hover:border-grease hover:text-grease ${
                count > 0
                  ? "border-rebate/25 text-rebate"
                  : "border-rebate/10 text-silver"
              }`}
            >
              {genre.label} SHEET{count > 0 && ` · ${count}`}
            </Link>
          );
        })}
      </nav>

      <section aria-label="시리즈">
        {allSeries.map((series) => (
          <SheetRow key={series.id} series={series} />
        ))}
        {allSeries.length === 0 && (
          <p className="border-t border-rebate/20 py-16 font-body text-lg text-silver">
            아직 공개된 시리즈가 없습니다. <code className="font-data">/studio</code>{" "}
            에서 시리즈를 만들고 공개일을 채우면 여기에 나타납니다.
          </p>
        )}
      </section>

      <Colophon settings={settings} />
    </main>
  );
}

