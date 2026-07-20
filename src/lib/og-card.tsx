import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { Frame } from "@/content";

export const OG_SIZE = { width: 1200, height: 630 };
const THUMB = { w: 216, h: 144 };

/**
 * Sanity serves a strip-sized crop straight from its CDN; the local seed has
 * copies on disk written by scripts/generate-placeholders.mjs. Resizing here
 * instead would put sharp inside the Next build worker, which fails with a
 * libvips colourspace error.
 */
async function stripSource(frame: Frame) {
  const { url } = frame.image;
  if (url.startsWith("http")) {
    return `${url}?w=${THUMB.w}&h=${THUMB.h}&fit=crop&auto=format`;
  }
  const file = join(process.cwd(), "public", "roll", "thumbs", url.split("/").pop()!);
  const buf = await readFile(file);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/**
 * The share card is a crop of the sheet itself: paper margin, the title in
 * rebate lettering, and the first strip of frames running off the edge — the
 * same thing you'd see holding the real sheet up to a window.
 *
 * Latin only. ImageResponse needs every glyph covered by a loaded font, and
 * shipping a Hangul face here would add megabytes for one line of type.
 */
export async function renderSheetCard({
  eyebrow,
  title,
  meta,
  frames,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  frames: Frame[];
}) {
  const [display, strip] = await Promise.all([
    readFile(join(process.cwd(), "assets", "BarlowCondensed-Medium.ttf")),
    Promise.all(
      frames.slice(0, 5).map(async (f) => ({ ...f, thumb: await stripSource(f) })),
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#e9eae6",
          color: "#141310",
          padding: "56px 0 0",
          fontFamily: "Barlow Condensed",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "0 60px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.22em",
              color: "#6e6f6a",
            }}
          >
            {eyebrow.toUpperCase()}
            {/* Drawn, not typed — Barlow Condensed has no ▸, and a missing
                glyph sends satori looking for a fallback font over the network. */}
            <div
              style={{ display: "flex", gap: 5, margin: "0 16px", alignItems: "center" }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 9, height: 9, background: "#c8102e" }} />
              ))}
            </div>
          </div>

          <div
            style={{ display: "flex", fontSize: 152, lineHeight: 0.9, marginTop: 12 }}
          >
            {title.toUpperCase()}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.18em",
              color: "#6e6f6a",
              marginTop: 18,
            }}
          >
            {meta.toUpperCase()}
          </div>
        </div>

        {/* One strip, bled off the bottom edge. */}
        <div
          style={{
            display: "flex",
            gap: 14,
            background: "#141310",
            padding: "16px 0 0 60px",
            height: 210,
            width: "100%",
          }}
        >
          {strip.map((f) => (
            <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.thumb} alt="" width={THUMB.w} height={THUMB.h} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 17,
                    letterSpacing: "0.2em",
                    color: "rgba(233,234,230,0.7)",
                  }}
                >
                  {f.frameRef}
                </span>
                {f.select && (
                  <div style={{ width: 8, height: 8, background: "#c8102e" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Barlow Condensed", data: display, style: "normal", weight: 500 },
      ],
    },
  );
}
