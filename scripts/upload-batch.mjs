/**
 * Bulk-registers a folder of JPEGs as 프레임 documents, optionally appending
 * them to a series in filename order — the order the camera shot them.
 *
 *   npx sanity exec scripts/upload-batch.mjs --with-user-token -- \
 *     --folder <스크럽된 폴더> [--series sheet-037] [--dry-run]
 *
 * Frame refs come from filenames (the camera's own numbering), exposure
 * comes from EXIF on the site, and documents are created published. The one
 * thing this cannot write for you is 대체 텍스트 — fill it per frame in the
 * Studio afterwards.
 *
 * Files that still carry GPS coordinates are skipped: run
 * scripts/scrub-location.mjs first. (--allow-gps overrides, at your own
 * risk — this site runs anonymously.)
 *
 * Re-running is safe: existing frames are recognised by id and not
 * duplicated, in the documents or in the series.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import exifr from "exifr";
import { getCliClient } from "sanity/cli";

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
};
const folder = flagValue("folder");
const seriesSlug = flagValue("series");
const dryRun = args.includes("--dry-run");
const allowGps = args.includes("--allow-gps");

if (!folder) {
  console.error(
    "사용법: npx sanity exec scripts/upload-batch.mjs --with-user-token -- --folder <폴더> [--series sheet-037] [--dry-run]",
  );
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2026-07-01" });

const files = (await readdir(folder)).filter((f) => /\.jpe?g$/i.test(f)).sort();
if (files.length === 0) {
  console.error(`JPEG이 없습니다: ${folder}`);
  process.exit(1);
}

let series = null;
if (seriesSlug) {
  series = await client.fetch(
    '*[_type == "series" && slug.current == $slug][0]{ _id, title }',
    { slug: seriesSlug },
  );
  if (!series) {
    console.error(`시리즈를 찾을 수 없습니다: ${seriesSlug}`);
    process.exit(1);
  }
}

console.log(
  `${files.length}장${dryRun ? " (dry-run — 실제로 올리지 않음)" : ""} → ${
    series ? `시리즈 「${series.title}」` : "프레임만 (시리즈 연결 없음)"
  }`,
);

const ids = [];
let skipped = 0;

for (const name of files) {
  const buf = await readFile(path.join(folder, name));

  const gps = await exifr.gps(buf).catch(() => null);
  if (gps && gps.latitude != null && !allowGps) {
    console.warn(
      `  ! ${name}: GPS 좌표가 남아 있어 건너뜁니다 — scrub-location.mjs를 먼저 돌리세요`,
    );
    skipped += 1;
    continue;
  }

  const frameRef = path.parse(name).name;
  const id = `photo-${frameRef.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const exists = await client.fetch("*[_id == $id][0]._id", { id });
  if (exists) {
    console.log(`  = ${name}: 이미 있음 (${id})`);
    ids.push(id);
    continue;
  }

  if (dryRun) {
    console.log(`  + ${name} → ${id}`);
    ids.push(id);
    continue;
  }

  const asset = await client.assets.upload("image", buf, { filename: name });
  await client.createIfNotExists({
    _id: id,
    _type: "photo",
    frameRef,
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    },
    slug: { _type: "slug", current: id },
    select: false,
  });
  console.log(`  ✓ ${name} → ${id}`);
  ids.push(id);
}

if (series && !dryRun && ids.length > 0) {
  const current =
    (await client.fetch("*[_id == $id][0].frames[]._ref", { id: series._id })) ?? [];
  const fresh = ids.filter((id) => !current.includes(id));
  if (fresh.length > 0) {
    await client
      .patch(series._id)
      .setIfMissing({ frames: [] })
      .append(
        "frames",
        fresh.map((id) => ({ _key: `frame-${id}`, _type: "reference", _ref: id })),
      )
      .commit();
  }
  console.log(
    `시리즈 「${series.title}」에 ${fresh.length}컷 추가 (기존 ${current.length}컷 유지)`,
  );
}

console.log(
  `\n완료: ${ids.length}컷 등록${skipped ? `, ${skipped}컷 GPS로 건너뜀` : ""}`,
);
if (!dryRun && ids.length > 0) {
  console.log("다음: Studio에서 각 프레임의 대체 텍스트를 채우세요 — 필수 항목입니다.");
}
