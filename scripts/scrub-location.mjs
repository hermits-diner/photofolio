/**
 * Strips the metadata that de-anonymises a photographer, and nothing else.
 *
 *   node scripts/scrub-location.mjs <파일 또는 폴더...> [--out <폴더>] [--in-place] [--dry-run]
 *
 * Run this on exports BEFORE uploading them. Sanity reads EXIF verbatim on
 * upload, so anything left in the file ends up in the CMS and, for some
 * fields, on the page.
 *
 * What goes:
 *   · GPS — the whole IFD. Street work plots a daily route; a week of it
 *     describes where someone lives.
 *   · Body and lens serial numbers, camera owner name — these are the real
 *     danger. A serial links every photo you have ever posted anywhere to
 *     the same body, across sites and across aliases.
 *   · MakerNote — vendor blob that frequently carries the serial again,
 *     plus shutter count and owner strings.
 *   · Artist, Copyright, XPAuthor, UserComment — free-text fields that
 *     editing software fills in from the OS account name.
 *   · XMP (APP1) and IPTC/Photoshop (APP13) blocks, which carry their own
 *     copies of creator and location.
 *
 * What stays: make, model, lens, exposure, and the capture date — the
 * things the sheet actually displays.
 *
 * The image data is never re-encoded. Only the metadata segments are
 * rewritten, so this costs no quality.
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import exifr from "exifr";
import piexif from "piexifjs";

const JPEG = new Set([".jpg", ".jpeg"]);

// 0th IFD
const ARTIST = 315;
const COPYRIGHT = 33432;
const XP_AUTHOR = 40093;
// Exif IFD
const MAKER_NOTE = 37500;
const USER_COMMENT = 37510;
const CAMERA_OWNER = 42032;
const BODY_SERIAL = 42033;
const LENS_SERIAL = 42037;

const LABELS = {
  [ARTIST]: "Artist",
  [COPYRIGHT]: "Copyright",
  [XP_AUTHOR]: "XPAuthor",
  [MAKER_NOTE]: "MakerNote",
  [USER_COMMENT]: "UserComment",
  [CAMERA_OWNER]: "CameraOwnerName",
  [BODY_SERIAL]: "BodySerialNumber",
  [LENS_SERIAL]: "LensSerialNumber",
};

/**
 * Drops whole JPEG APP segments that piexif does not manage: the XMP packet
 * and the Photoshop/IPTC block. Walks markers up to the start of scan, after
 * which everything is compressed image data.
 */
function dropSidecarSegments(buf) {
  if (buf.readUInt16BE(0) !== 0xffd8) return { out: buf, dropped: [] };

  const keep = [buf.subarray(0, 2)];
  const dropped = [];
  let i = 2;

  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];

    // Start of scan, or anything without a length field — copy the rest as is.
    if (marker === 0xda || marker === 0xd9) {
      keep.push(buf.subarray(i));
      i = buf.length;
      break;
    }

    const length = buf.readUInt16BE(i + 2);
    const segment = buf.subarray(i, i + 2 + length);
    const payload = segment.subarray(4);

    const isXmp =
      marker === 0xe1 && payload.subarray(0, 28).toString("latin1").startsWith("http://ns.adobe.com/x");
    const isPhotoshop =
      marker === 0xed && payload.subarray(0, 13).toString("latin1").startsWith("Photoshop");

    if (isXmp) dropped.push("XMP");
    else if (isPhotoshop) dropped.push("IPTC/Photoshop");
    else keep.push(segment);

    i += 2 + length;
  }

  if (i < buf.length) keep.push(buf.subarray(i));
  return { out: Buffer.concat(keep), dropped };
}

/** Removes the GPS IFD and the identifying tags, leaving the rest intact. */
function scrubExif(buf) {
  const removed = [];
  let exif;

  try {
    exif = piexif.load(buf.toString("binary"));
  } catch {
    return { out: buf, removed: [] };
  }

  if (exif.GPS && Object.keys(exif.GPS).length > 0) {
    removed.push(`GPS (${Object.keys(exif.GPS).length} tags)`);
    exif.GPS = {};
  }
  if (exif.thumbnail) {
    // The embedded thumbnail is a second copy of the picture with its own
    // metadata, and it does not survive a crop — it can show what was
    // cropped out.
    removed.push("embedded thumbnail");
    exif.thumbnail = null;
    exif["1st"] = {};
  }

  for (const [ifd, tag] of [
    ["0th", ARTIST],
    ["0th", COPYRIGHT],
    ["0th", XP_AUTHOR],
    ["Exif", MAKER_NOTE],
    ["Exif", USER_COMMENT],
    ["Exif", CAMERA_OWNER],
    ["Exif", BODY_SERIAL],
    ["Exif", LENS_SERIAL],
  ]) {
    if (exif[ifd] && exif[ifd][tag] !== undefined) {
      removed.push(LABELS[tag]);
      delete exif[ifd][tag];
    }
  }

  if (removed.length === 0) return { out: buf, removed };

  const inserted = piexif.insert(piexif.dump(exif), buf.toString("binary"));
  return { out: Buffer.from(inserted, "binary"), removed };
}

async function collect(target) {
  const info = await stat(target);
  if (info.isFile()) return JPEG.has(path.extname(target).toLowerCase()) ? [target] : [];
  const entries = await readdir(target, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) continue; // one level; nested folders are usually exports of exports
    if (JPEG.has(path.extname(e.name).toLowerCase())) files.push(path.join(target, e.name));
  }
  return files;
}

// ── main ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const inPlace = args.includes("--in-place");
const dryRun = args.includes("--dry-run");
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 ? args[outIndex + 1] : null;
const outValueIndex = outIndex >= 0 ? outIndex + 1 : -1;
const targets = args.filter((a, i) => !a.startsWith("--") && i !== outValueIndex);

if (targets.length === 0) {
  console.error(
    "사용법: node scripts/scrub-location.mjs <파일 또는 폴더...> [--out <폴더>] [--in-place] [--dry-run]",
  );
  process.exit(1);
}

const files = (await Promise.all(targets.map(collect))).flat();
if (files.length === 0) {
  console.error("JPEG를 찾지 못했습니다. RAW·HEIC·PNG는 처리하지 않습니다.");
  process.exit(1);
}

let touched = 0;
let hadGps = 0;

for (const file of files) {
  const original = await readFile(file);

  // Report against the source, not the result — exifr sees XMP too.
  const before = await exifr.parse(file, { gps: true, xmp: true }).catch(() => null);
  const gpsSeen = Boolean(before?.latitude || before?.GPSLatitude);

  const { out: withoutSidecars, dropped } = dropSidecarSegments(original);
  const { out: clean, removed } = scrubExif(withoutSidecars);
  const all = [...removed, ...dropped];

  const name = path.basename(file);
  if (all.length === 0) {
    console.log(`  ${name.padEnd(24)} 지울 것 없음`);
    continue;
  }

  if (gpsSeen) hadGps++;
  touched++;
  console.log(`  ${name.padEnd(24)} ${all.join(", ")}`);

  if (dryRun) continue;

  let destination;
  if (inPlace) {
    destination = file;
  } else {
    const dir = outDir ?? path.join(path.dirname(file), "scrubbed");
    await mkdir(dir, { recursive: true });
    destination = path.join(dir, name);
  }
  await writeFile(destination, clean);
}

console.log("");
console.log(`${files.length}개 중 ${touched}개에서 메타데이터를 지웠습니다.`);
if (hadGps > 0) console.log(`그중 ${hadGps}개에 GPS 좌표가 들어 있었습니다.`);
if (dryRun) {
  console.log("--dry-run 이라 파일은 쓰지 않았습니다.");
} else if (!inPlace) {
  console.log(`결과는 ${outDir ?? "각 폴더의 scrubbed/"} 에 있습니다. 원본은 그대로입니다.`);
}
console.log("");
console.log("남긴 것: 바디·렌즈·노출·촬영일. RAW와 HEIC는 처리하지 않습니다.");
