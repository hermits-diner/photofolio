import { getAllSeries, getSettings } from "@/content";
import { OG_SIZE, renderSheetCard } from "@/lib/og-card";

export const alt = "흑백 필름 컨택트시트";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [settings, allSeries] = await Promise.all([getSettings(), getAllSeries()]);
  const frames = allSeries.flatMap((s) => s.frames);
  const selects = frames.filter((f) => f.select).length;

  return renderSheetCard({
    eyebrow: `${allSeries.length} sheets`,
    title: settings.latin,
    meta: `${settings.city} — ${frames.length} frames, ${selects} selects`,
    frames,
  });
}
