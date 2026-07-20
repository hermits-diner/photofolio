import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { frames, photographer, roll } from "@/data/roll";

const THUMB = { w: 216, h: 144 };

/**
 * Inlines a strip-sized copy written by scripts/generate-placeholders.mjs.
 * Resizing here instead would put sharp inside the Next build worker, which
 * fails with a libvips colourspace error.
 */
async function thumbnail(src: string) {
  const file = join(process.cwd(), "public", "roll", "thumbs", src.split("/").pop()!);
  const buf = await readFile(file);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

export const alt = `${photographer.latin} — 흑백 필름 사진, Sheet ${roll.number}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card is a crop of the sheet itself: paper margin, the name in
 * rebate lettering, and the first strip of frames running off the edge —
 * the same thing you'd see holding the real sheet up to a window.
 *
 * Latin only. ImageResponse needs every glyph covered by a loaded font, and
 * shipping a Hangul face here would add megabytes for one line of type.
 */
export default async function Image() {
  const display = await readFile(
    join(process.cwd(), "assets", "BarlowCondensed-Medium.ttf"),
  );

  const strip = await Promise.all(
    frames.slice(0, 5).map(async (f) => ({ ...f, thumb: await thumbnail(f.src) })),
  );

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
            {roll.stock.toUpperCase()}
            {/* Drawn, not typed — Barlow Condensed has no ▸, and a missing
                glyph sends satori looking for a fallback font over the network. */}
            <div style={{ display: "flex", gap: 5, margin: "0 16px", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "7px solid transparent",
                    borderBottom: "7px solid transparent",
                    borderLeft: "10px solid #c8102e",
                  }}
                />
              ))}
            </div>
            ROLL {roll.number}
          </div>

          <div style={{ display: "flex", fontSize: 168, lineHeight: 0.9, marginTop: 12 }}>
            {photographer.latin.toUpperCase()}
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
            {photographer.city.toUpperCase()} — {frames.length} FRAMES,{" "}
            {frames.filter((f) => f.select).length} SELECTS
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
            <div
              key={f.edge}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
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
                  {f.edge}
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
    { ...size, fonts: [{ name: "Barlow Condensed", data: display, style: "normal", weight: 500 }] },
  );
}
