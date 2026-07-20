import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Colophon, Masthead } from "@/components/site-chrome";
import { getExhibitions, getSettings, type Exhibition } from "@/content";

export const metadata: Metadata = {
  title: "전시",
  description: "진행 중이거나 지난 전시들.",
};

/** 종료일이 오늘보다 앞이면 지난 전시. 날짜가 없으면 예정으로 둔다. */
function isPast(e: Exhibition) {
  if (!e.endDate) return false;
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", ".");
  return e.endDate < today;
}

function ExhibitionRow({ exhibition }: { exhibition: Exhibition }) {
  const period = [exhibition.startDate, exhibition.endDate]
    .filter(Boolean)
    .join(" — ");

  return (
    <Link
      href={`/exhibitions/${exhibition.slug}`}
      className="group -mx-3 grid gap-6 rounded-lg border-t border-rebate/20 px-3 py-8 transition-all hover:bg-rebate/5 sm:grid-cols-[220px_1fr]"
    >
      {exhibition.cover ? (
        <div className="relative aspect-3/2 overflow-hidden rounded-sm border border-black/30 bg-rebate">
          <Image
            src={exhibition.cover.image.url}
            alt=""
            fill
            sizes="220px"
            quality={70}
            placeholder={exhibition.cover.image.blurDataURL ? "blur" : "empty"}
            blurDataURL={exhibition.cover.image.blurDataURL}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-3/2 rounded-sm border border-rebate/15 bg-rebate/5" />
      )}

      <div>
        <h2 className="font-display text-3xl font-medium tracking-tight uppercase group-hover:text-grease transition-colors sm:text-4xl">
          {exhibition.titleLatin}
        </h2>
        <p className="mt-1 font-display text-xl font-medium tracking-tight">
          {exhibition.title}
        </p>
        <p className="note mt-3 text-silver">
          {[exhibition.venue, period].filter(Boolean).join(" · ") || "일정 미정"}
        </p>
        {exhibition.workCount > 0 && (
          <p className="rebate-type mt-2 text-silver">{exhibition.workCount} prints</p>
        )}
      </div>
    </Link>
  );
}

export default async function ExhibitionsPage() {
  const [settings, exhibitions] = await Promise.all([getSettings(), getExhibitions()]);
  const current = exhibitions.filter((e) => !isPast(e));
  const past = exhibitions.filter(isPast);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead settings={settings} right={`${exhibitions.length} exhibitions`} />

      <section className="pt-12 pb-10 lg:pt-20">
        <h1 className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.86] font-medium tracking-[-0.015em] uppercase text-rebate">
          Exhibitions
        </h1>
        <p className="mt-3 font-display text-2xl font-medium tracking-tight">전시</p>
      </section>

      {exhibitions.length === 0 && (
        <p className="border-t border-rebate/20 py-16 font-body text-lg text-silver">
          아직 공개된 전시가 없습니다. 준비 중인 전시는 공개일을 채우는 순간 여기에
          나타납니다.
        </p>
      )}

      {current.length > 0 && (
        <section aria-label="진행 중·예정 전시">
          {current.map((e) => (
            <ExhibitionRow key={e.id} exhibition={e} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section aria-label="지난 전시" className="mt-16">
          <p className="rebate-type pb-2 text-silver">지난 전시</p>
          {past.map((e) => (
            <ExhibitionRow key={e.id} exhibition={e} />
          ))}
        </section>
      )}

      <Colophon settings={settings} />
    </main>
  );
}
