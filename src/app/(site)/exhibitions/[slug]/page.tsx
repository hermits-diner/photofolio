import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LogLine } from "@/components/log-line";
import { Colophon, Masthead } from "@/components/site-chrome";
import { getExhibition, getExhibitionSlugs, getSettings } from "@/content";

export async function generateStaticParams() {
  const slugs = await getExhibitionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = await getExhibition(slug, { stega: false });
  if (!exhibition) return {};
  return {
    title: `${exhibition.title} — 전시`,
    description: exhibition.statement ?? undefined,
  };
}

export default async function ExhibitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, exhibition] = await Promise.all([
    getSettings(),
    getExhibition(slug),
  ]);
  if (!exhibition) notFound();

  const period = [exhibition.startDate, exhibition.endDate]
    .filter(Boolean)
    .join(" — ");

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead settings={settings} right={period || null} />

      <section className="grid gap-10 pt-12 pb-16 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:pt-20 lg:pb-20">
        <div>
          <p className="rebate-type text-silver">
            전시
            <span className="mx-2 text-grease">▸▸▸</span>
            {exhibition.venue ?? "장소 미정"}
          </p>

          <h1 className="mt-4 font-display text-[clamp(3rem,10vw,8rem)] leading-[0.86] font-medium tracking-[-0.015em] uppercase">
            {exhibition.titleLatin}
          </h1>
          <p className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {exhibition.title}
          </p>

          {exhibition.statement && (
            <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-rebate/85 sm:text-xl whitespace-pre-line">
              {exhibition.statement}
            </p>
          )}
        </div>

        {/* The wall label: where, when, how many prints. */}
        <dl className="self-end lg:pb-3">
          <LogLine label="Venue" value={exhibition.venue} />
          <LogLine label="Address" value={exhibition.address} />
          <LogLine label="Dates" value={period || null} />
          <LogLine label="Opening" value={exhibition.opening} />
          <LogLine label="Prints" value={`${exhibition.works.length}`} />
        </dl>
      </section>

      <section aria-labelledby="works-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
          <h2 id="works-heading" className="rebate-type text-silver">
            출품작
          </h2>
          <Link href="/exhibitions" className="rebate-type text-silver hover:text-grease">
            ← 모든 전시
          </Link>
        </div>

        {exhibition.works.length === 0 && (
          <p className="border-t border-rebate/20 py-12 font-body text-lg text-silver">
            출품작이 아직 공개되지 않았습니다.
          </p>
        )}

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {exhibition.works.map((work) =>
            work.photo ? (
              <figure key={work.id}>
                <div className="relative aspect-3/2 overflow-hidden rounded-sm border border-black/40 bg-rebate">
                  <Image
                    src={work.photo.image.url}
                    alt={work.photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={75}
                    placeholder={work.photo.image.blurDataURL ? "blur" : "empty"}
                    blurDataURL={work.photo.image.blurDataURL}
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2">
                  <p className="font-display text-lg font-medium tracking-tight">
                    {work.photo.caption ?? work.photo.frameRef}
                  </p>
                  <p className="rebate-type mt-1 text-silver">
                    {[work.printSize, work.paper, work.frame, work.edition]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </figcaption>
              </figure>
            ) : null,
          )}
        </div>
      </section>

      <Colophon settings={settings} />
    </main>
  );
}
