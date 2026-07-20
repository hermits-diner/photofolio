/**
 * Generates stand-in frames for the contact sheet until real scans land in
 * public/roll/. Output is deliberately grainy monochrome at 3:2 — the 35mm
 * ratio — so the sheet reads correctly while the layout is being built.
 *
 *   node scripts/generate-placeholders.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "roll");
const W = 1500;
const H = 1000;

/** Deterministic PRNG so re-running produces the same roll. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Each frame is a handful of soft radial pools over a tonal gradient, then
 * grain on top. Not a photograph, but it holds the tonal range of one.
 */
function renderFrame(seed, { key, contrast }) {
  const rand = rng(seed);
  const pools = Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({
    x: rand() * W,
    y: rand() * H,
    r: (0.25 + rand() * 0.45) * W,
    amp: (rand() - 0.35) * 90,
  }));
  const tilt = rand() * Math.PI * 2;

  // Hard-edged masses. Pools alone read as fog; a picture needs edges.
  const horizon = (0.35 + rand() * 0.4) * H;
  const horizonStep = (rand() - 0.5) * 70;
  const blocks = Array.from({ length: 2 + Math.floor(rand() * 3) }, () => {
    const w = (0.08 + rand() * 0.26) * W;
    const h = (0.15 + rand() * 0.55) * H;
    return {
      x0: rand() * (W - w),
      x1: 0,
      y0: horizon - h * (0.7 + rand() * 0.5),
      y1: 0,
      w,
      h,
      amp: (rand() - 0.55) * 120,
      feather: 2 + rand() * 10,
    };
  }).map((b) => ({ ...b, x1: b.x0 + b.w, y1: b.y0 + b.h }));

  const buf = Buffer.allocUnsafe(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Base gradient, angled so no two frames sit the same way.
      const t = (x / W) * Math.cos(tilt) + (y / H) * Math.sin(tilt);
      let v = key + t * 38;

      // A ground/sky split — the single strongest cue that this is a scene.
      v += y > horizon ? horizonStep : -horizonStep * 0.4;

      for (const b of blocks) {
        if (x > b.x0 - b.feather && x < b.x1 + b.feather && y > b.y0 - b.feather && y < b.y1) {
          const edge =
            Math.min(x - b.x0, b.x1 - x, y - b.y0, (b.y1 - y) * 3) / b.feather;
          v += b.amp * Math.min(1, Math.max(0, edge));
        }
      }

      for (const p of pools) {
        const dx = x - p.x;
        const dy = y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) / p.r;
        if (d < 1) v += p.amp * (1 - d) * (1 - d);
      }

      // Falloff toward the corners, as an uncoated fast lens gives.
      const nx = (x / W - 0.5) * 2;
      const ny = (y / H - 0.5) * 2;
      v *= 1 - 0.34 * (nx * nx + ny * ny);

      // Grain: coarser in the shadows, the way real film behaves.
      const shadowWeight = 1 - Math.min(1, Math.max(0, v / 255)) * 0.6;
      v += (rand() - 0.5) * 26 * shadowWeight;

      v = (v - 128) * contrast + 128;
      buf[y * W + x] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  return buf;
}

const FRAMES = [
  // Sheet 037 — street: frame-01 … frame-12
  { key: 96, contrast: 1.18 },
  { key: 138, contrast: 1.02 },
  { key: 74, contrast: 1.3 },
  { key: 160, contrast: 0.92 },
  { key: 110, contrast: 1.12 },
  { key: 88, contrast: 1.24 },
  { key: 148, contrast: 0.98 },
  { key: 102, contrast: 1.16 },
  { key: 66, contrast: 1.34 },
  { key: 128, contrast: 1.06 },
  { key: 152, contrast: 0.95 },
  { key: 118, contrast: 1.2 },
  // Sheet 041 — portraits: frame-13 … frame-20, keyed darker for window light
  { key: 84, contrast: 1.28 },
  { key: 120, contrast: 1.15 },
  { key: 70, contrast: 1.35 },
  { key: 105, contrast: 1.2 },
  { key: 92, contrast: 1.1 },
  { key: 132, contrast: 1.05 },
  { key: 78, contrast: 1.3 },
  { key: 112, contrast: 1.18 },
  // Sheet 044 — harbor trip: frame-21 … frame-30, lighter and flatter
  { key: 150, contrast: 0.95 },
  { key: 165, contrast: 0.9 },
  { key: 128, contrast: 1.08 },
  { key: 172, contrast: 0.88 },
  { key: 142, contrast: 1.0 },
  { key: 118, contrast: 1.12 },
  { key: 96, contrast: 1.22 },
  { key: 80, contrast: 1.3 },
  { key: 155, contrast: 0.94 },
  { key: 136, contrast: 1.02 },
];

await mkdir(OUT, { recursive: true });

for (const [i, spec] of FRAMES.entries()) {
  const raw = renderFrame(0x9e37 + i * 7919, spec);
  const jpeg = await sharp(raw, { raw: { width: W, height: H, channels: 1 } })
    // Stretch to a full print scale — real blacks, a clean paper white.
    .normalise()
    // A whisper of warmth — selenium-toned fibre paper, not neutral grey.
    .toColourspace("srgb")
    .tint({ r: 255, g: 250, b: 243 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const name = `frame-${String(i + 1).padStart(2, "0")}.jpg`;
  await writeFile(path.join(OUT, name), jpeg);

  // Strip-sized copies for the share card. Generated here rather than at
  // render time — sharp and the Next build worker do not share nicely.
  await mkdir(path.join(OUT, "thumbs"), { recursive: true });
  await sharp(jpeg)
    .resize(216, 144, { fit: "cover" })
    .jpeg({ quality: 72 })
    .toFile(path.join(OUT, "thumbs", name));

  console.log(`  ${name}  ${(jpeg.length / 1024).toFixed(0)} KB`);
}

console.log(`\n${FRAMES.length} frames written to public/roll/`);
