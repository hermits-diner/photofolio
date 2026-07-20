import Image from "next/image";
import Link from "next/link";

import { Colophon, Masthead } from "@/components/site-chrome";
import { getAllSeries, getSettings, type Series } from "@/content";

/**
 * A stack of sheets on the light table. Each row shows the sheet's own
 * number, its title, and the first frames of the strip running off the right
 * edge — enough to recognise the roll without opening it.
 */
function SheetRow({ series }: { series: Series }) {
  const strip = series.frames.slice(0, 6);
  const selects = series.frames.filter((f) => f.select).length;

  return (
    <Link
      href={`/series/${series.slug}`}
      className="group block border-t border-rebate/20 py-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-display text-4xl tracking-tight uppercase group-hover:text-grease sm:text-5xl">
          Sheet {series.sheetNumber}
        </h2>
        <p className="rebate-type text-silver">
          {series.frames.length} frames
          {selects > 0 && (
            <>
              {" / "}
              <span className="text-grease">{selects} selects</span>
            </>
          )}
        </p>
      </div>

      <p className="mt-1 font-display text-xl font-medium tracking-tight sm:text-2xl">
        {series.title}
      </p>

      {/* One strip, bled off the right edge — there is always more sheet. */}
      <div className="mt-5 -mr-5 flex gap-3 overflow-hidden bg-rebate p-3 sm:-mr-8 lg:-mr-14">
        {strip.map((frame) => (
          <div
            key={frame.id}
            className="relative aspect-3/2 w-40 shrink-0 overflow-hidden sm:w-52"
          >
            <Image
              src={frame.image.url}
              alt=""
              fill
              sizes="(max-width: 640px) 160px, 208px"
              quality={60}
              placeholder={frame.image.blurDataURL ? "blur" : "empty"}
              blurDataURL={frame.image.blurDataURL}
              className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
            />
          </div>
        ))}
      </div>
    </Link>
  );
}

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
        <h1 className="font-display text-[clamp(3.75rem,13vw,10.5rem)] leading-[0.84] font-medium tracking-[-0.015em] uppercase">
          {settings.latin}
        </h1>
        <p className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {settings.name}
        </p>

        <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-rebate/85 sm:text-xl">
          {settings.statement}
        </p>

        <p className="note mt-10 text-silver">
          ↓ 시트 {allSeries.length}장 · 모두 {totalFrames}컷
        </p>
      </section>

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
