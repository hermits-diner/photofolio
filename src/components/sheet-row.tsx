import Image from "next/image";
import Link from "next/link";

import type { Series } from "@/content";

/**
 * One sheet on the light table: its number, title, and the first frames of
 * the strip running off the right edge — enough to recognise the roll
 * without opening it. Shared by the full list and the genre pages.
 */
export function SheetRow({ series }: { series: Series }) {
  const strip = series.frames.slice(0, 8);
  const selects = series.frames.filter((f) => f.select).length;

  return (
    <Link
      href={`/series/${series.slug}`}
      className="group block border-t border-rebate/20 py-8 transition-all hover:bg-rebate/5 px-3 -mx-3 rounded-lg"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-display text-4xl tracking-tight uppercase group-hover:text-grease transition-colors sm:text-5xl flex items-center gap-3">
          Sheet {series.sheetNumber}
          <span className="text-xs font-sans rebate-type text-silver opacity-0 group-hover:opacity-100 transition-opacity">
            → 열기
          </span>
        </h2>
        <p className="rebate-type text-silver flex items-center gap-2">
          <span>{series.frames.length} frames</span>
          {selects > 0 && (
            <span className="bg-grease/10 text-grease border border-grease/30 px-2 py-0.5 rounded-full font-bold">
              ✕ {selects} selects
            </span>
          )}
        </p>
      </div>

      <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-xl font-medium tracking-tight sm:text-2xl">
        {series.title}
        {series.genre && (
          <span className="note font-normal text-silver">
            {[series.genre, series.location, series.camera].filter(Boolean).join(" · ")}
          </span>
        )}
      </p>

      {/* Film strip preview with custom scrollbar */}
      <div className="mt-5 flex gap-3 overflow-x-auto bg-rebate p-3 sm:p-4 rounded-sm border border-black/40 film-scrollbar shadow-inner">
        {strip.map((frame) => (
          <div
            key={frame.id}
            className="relative aspect-3/2 w-44 shrink-0 overflow-hidden rounded-sm sm:w-56 group/frame"
          >
            <Image
              src={frame.image.url}
              alt=""
              fill
              sizes="(max-width: 640px) 176px, 224px"
              quality={70}
              placeholder={frame.image.blurDataURL ? "blur" : "empty"}
              blurDataURL={frame.image.blurDataURL}
              className="object-cover transition-all duration-500 group-hover:brightness-110 group-hover/frame:scale-105"
            />
            {frame.select && (
              <div className="absolute top-1 right-1 bg-grease text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold shadow">
                ✕
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-rebate/80 px-2 py-1 text-[9px] font-mono text-paper/70 flex justify-between">
              <span>{frame.frameRef}</span>
              {frame.aperture && <span>{frame.aperture}</span>}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
