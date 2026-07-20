import type { Metadata } from "next";

import { LogLine } from "@/components/log-line";
import { Colophon, Masthead } from "@/components/site-chrome";
import { getAllSeries, getSettings } from "@/content";

export const metadata: Metadata = {
  title: "소개",
  description: "작업 방식과 태도에 대하여.",
};

export default async function AboutPage() {
  const [settings, allSeries] = await Promise.all([getSettings(), getAllSeries()]);

  // The log writes itself from the archive — genres and bodies actually in
  // use, not a claimed list. An anonymous page has no résumé to lean on.
  const genres = [...new Set(allSeries.map((s) => s.genre).filter(Boolean))] as string[];
  const cameras = [...new Set(allSeries.map((s) => s.camera).filter(Boolean))] as string[];
  const totalFrames = allSeries.reduce((n, s) => n + s.frames.length, 0);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead settings={settings} right={settings.city || null} />

      <section className="grid gap-10 pt-12 pb-16 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:pt-20 lg:pb-20">
        <div>
          <h1 className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.86] font-medium tracking-[-0.015em] uppercase text-rebate">
            About
          </h1>
          <p className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {settings.alias}
          </p>

          <p className="mt-8 max-w-md font-body text-xl leading-relaxed text-rebate/85 sm:text-2xl">
            {settings.statement}
          </p>

          {settings.about && (
            <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-rebate/75 whitespace-pre-line">
              {settings.about}
            </p>
          )}
        </div>

        <dl className="self-end lg:pb-3">
          <LogLine label="Based in" value={settings.city || null} />
          <LogLine label="Genres" value={genres.join(" · ") || null} />
          <LogLine label="Cameras" value={cameras.join(" · ") || null} />
          <LogLine label="Sheets" value={`${allSeries.length}`} />
          <LogLine label="Frames" value={`${totalFrames}`} />
        </dl>
      </section>

      <Colophon settings={settings} />
    </main>
  );
}
