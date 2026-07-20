import { getAllSeries, getSettings } from "@/content";
import { OG_SIZE, renderSheetCard } from "@/lib/og-card";

export const alt = "흑백 필름 컨택트시트";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [settings, allSeries] = await Promise.all([
    getSettings({ stega: false }),
    getAllSeries({ stega: false }),
  ]);
  const frames = allSeries.flatMap((s) => s.frames);
  const selects = frames.filter((f) => f.select).length;

  return renderSheetCard({
    eyebrow: `${allSeries.length} sheet${allSeries.length === 1 ? "" : "s"}`,
    title: settings.aliasLatin,
    meta: [settings.city, `${frames.length} frames, ${selects} selects`]
      .filter(Boolean)
      .join(" — "),
    frames,
  });
}
