/**
 * Turns the starter session in src/data/seed.ts into a dataset the Studio can
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
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The seed is TypeScript, so read the values out of the source rather than
// importing it — this script runs on bare node, without a compiler.
const root = process.cwd();
const source = await readFile(path.join(root, "src", "data", "seed.ts"), "utf8");

function pick(block, key) {
  const m = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return m ? m[1] : undefined;
}

const identityBlock = source.match(/export const identity = \{([\s\S]*?)\n\}/)[1];
const sessionBlock = source.match(/export const session = \{([\s\S]*?)\n\}/)[1];
const frameBlocks = [...source.matchAll(/\{\s*frameRef:[\s\S]*?\n {2}\}/g)].map(
  (m) => m[0],
);

const docs = [];

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  alias: pick(identityBlock, "alias"),
  aliasLatin: pick(identityBlock, "aliasLatin"),
  city: pick(identityBlock, "city"),
  statement:
    "거리에서 찍습니다. 대부분은 버리고, 남은 것만 여기에 둡니다. 이름은 밝히지 않습니다.",
  email: pick(identityBlock, "email"),
  instagram: pick(identityBlock, "instagram"),
  commissionNote:
    "촬영 의뢰와 사용 문의를 받습니다. 일정과 용도를 함께 보내주시면 사흘 안에 답장합니다.",
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
    frameRef: pick(block, "frameRef"),
    alt: pick(block, "alt"),
    caption: pick(block, "caption"),
    place: pick(block, "place"),
    // The seed writes dates as 2026.03.04; Sanity's date type wants ISO.
    shotAt: shotAt ? shotAt.replaceAll(".", "-") : undefined,
    lens: pick(block, "lens"),
    aperture: pick(block, "aperture"),
    shutter: pick(block, "shutter"),
    iso: pick(block, "iso"),
    select: /select:\s*true/.test(block),
    slug: { _type: "slug", current: id },
    image: {
      _type: "image",
      _sanityAsset: `image@${pathToFileURL(path.join(root, "public", src)).href}`,
    },
  });
}

const sheetNumber = pick(sessionBlock, "number");

docs.push({
  _id: `seed-sheet-${sheetNumber}`,
  _type: "series",
  title: "밤으로 가는 길",
  titleLatin: "Toward Night",
  slug: { _type: "slug", current: `sheet-${sheetNumber}` },
  sheetNumber,
  genre: pick(sessionBlock, "genre"),
  location: pick(sessionBlock, "location"),
  camera: pick(sessionBlock, "camera"),
  lenses: pick(sessionBlock, "lenses"),
  shotOver: pick(sessionBlock, "shotOver"),
  publishedAt: "2026-04-14T00:00:00.000Z",
  frames: photoIds.map((id) => ({ _key: id, _type: "reference", _ref: id })),
});

const out = path.join(root, "sanity-seed.ndjson");
await writeFile(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");

console.log(`${docs.length} documents -> sanity-seed.ndjson`);
console.log("다음: npx sanity dataset import sanity-seed.ndjson production");
