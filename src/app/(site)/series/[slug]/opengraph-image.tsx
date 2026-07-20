import { getSeries, getSeriesSlugs } from "@/content";
import { OG_SIZE, renderSheetCard } from "@/lib/og-card";

export const alt = "컨택트시트";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getSeriesSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) return new Response("Not found", { status: 404 });

  const selects = series.frames.filter((f) => f.select).length;

  return renderSheetCard({
    eyebrow: series.genre ?? series.location ?? `Sheet ${series.sheetNumber}`,
    title: series.titleLatin,
    meta: `sheet ${series.sheetNumber} — ${series.frames.length} frames, ${selects} selects`,
    frames: series.frames,
  });
}
