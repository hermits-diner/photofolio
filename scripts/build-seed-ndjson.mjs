/**
 * Turns the starter roll in src/data/roll.ts into a dataset the Studio can
 * import, so a brand-new Sanity project opens with a working sheet rather
 * than an empty list. Images ride along via `_sanityAsset`, which the import
 * command resolves and uploads.
 *
 *   node scripts/build-seed-ndjson.mjs
 *   npx sanity dataset import sanity-seed.ndjson production
 *
 * Import is additive — running it twice creates duplicates. Use
 * `--replace` if you mean to overwrite.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The seed is TypeScript, so read the values out of the source rather than
// importing it — this script runs on bare node, without a compiler.
import { readFile } from "node:fs/promises";

const root = process.cwd();
const source = await readFile(path.join(root, "src", "data", "roll.ts"), "utf8");

function pick(block, key) {
  const m = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return m ? m[1] : null;
}

const photographerBlock = source.match(/export const photographer = \{([\s\S]*?)\}/)[1];
const rollBlock = source.match(/export const roll = \{([\s\S]*?)\}/)[1];
const frameBlocks = [...source.matchAll(/\{\s*edge:[\s\S]*?\n {2}\}/g)].map((m) => m[0]);

const docs = [];

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  name: pick(photographerBlock, "name"),
  latin: pick(photographerBlock, "latin"),
  city: pick(photographerBlock, "city"),
  statement:
    "빛이 사라지기 직전의 도시를 찍습니다. 모든 사진은 필름으로 찍고 직접 현상합니다.",
  email: pick(photographerBlock, "email"),
  instagram: pick(photographerBlock, "instagram"),
  commissionNote:
    "인물, 공간, 기록 작업을 받습니다. 촬영 일정과 예산을 함께 보내주시면 사흘 안에 답장합니다.",
});

const photoIds = [];

for (const [i, block] of frameBlocks.entries()) {
  const id = `seed-frame-${String(i + 1).padStart(2, "0")}`;
  const src = pick(block, "src");
  const shotAt = pick(block, "shotAt");
  photoIds.push(id);

  docs.push({
    _id: id,
    _type: "photo",
    edge: pick(block, "edge"),
    alt: pick(block, "alt"),
    caption: pick(block, "caption"),
    place: pick(block, "place"),
    // The seed writes dates as 2026.03.04; Sanity's date type wants ISO.
    shotAt: shotAt ? shotAt.replaceAll(".", "-") : undefined,
    lens: pick(block, "lens"),
    aperture: pick(block, "aperture"),
    shutter: pick(block, "shutter"),
    select: /select:\s*true/.test(block),
    slug: { _type: "slug", current: `${id}` },
    image: {
      _type: "image",
      _sanityAsset: `image@${pathToFileURL(path.join(root, "public", src)).href}`,
    },
  });
}

docs.push({
  _id: "seed-series-037",
  _type: "series",
  title: "롤 037",
  titleLatin: `Roll ${pick(rollBlock, "number")}`,
  slug: { _type: "slug", current: `roll-${pick(rollBlock, "number")}` },
  sheetNumber: pick(rollBlock, "number"),
  stock: pick(rollBlock, "stock"),
  rated: pick(rollBlock, "rated"),
  developer: pick(rollBlock, "developer"),
  shotOver: pick(rollBlock, "shotOver"),
  publishedAt: new Date(0).toISOString().replace("1970", "2026"),
  frames: photoIds.map((id) => ({
    _key: id,
    _type: "reference",
    _ref: id,
  })),
});

const out = path.join(root, "sanity-seed.ndjson");
await writeFile(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");

console.log(`${docs.length} documents -> sanity-seed.ndjson`);
console.log("다음: npx sanity dataset import sanity-seed.ndjson production");
