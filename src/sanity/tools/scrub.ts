import piexif from "piexifjs";

/**
 * Browser port of scripts/scrub-location.mjs — the same surgery, running in
 * the Studio before anything leaves the machine. GPS, serials, MakerNote,
 * authorship fields, XMP/IPTC blocks and the embedded thumbnail go; body,
 * lens, exposure and capture date stay. Image data is never re-encoded.
 */

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

const LABELS: Record<number, string> = {
  [ARTIST]: "Artist",
  [COPYRIGHT]: "Copyright",
  [XP_AUTHOR]: "XPAuthor",
  [MAKER_NOTE]: "MakerNote",
  [USER_COMMENT]: "UserComment",
  [CAMERA_OWNER]: "CameraOwnerName",
  [BODY_SERIAL]: "BodySerialNumber",
  [LENS_SERIAL]: "LensSerialNumber",
};

/** piexif works on latin1 strings; chunked to keep the arg list small. */
function toBinary(bytes: Uint8Array): string {
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return s;
}

function fromBinary(str: string): Uint8Array {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
  return out;
}

function u16(b: Uint8Array, i: number) {
  return (b[i] << 8) | b[i + 1];
}

function ascii(b: Uint8Array, start: number, len: number) {
  let s = "";
  for (let i = start; i < start + len && i < b.length; i++) {
    s += String.fromCharCode(b[i]);
  }
  return s;
}

/** Drops whole APP segments piexif does not manage: XMP and IPTC/Photoshop. */
function dropSidecarSegments(b: Uint8Array): { out: Uint8Array; dropped: string[] } {
  if (u16(b, 0) !== 0xffd8) return { out: b, dropped: [] };

  const keep: Uint8Array[] = [b.subarray(0, 2)];
  const dropped: string[] = [];
  let i = 2;

  while (i < b.length - 1) {
    if (b[i] !== 0xff) break;
    const marker = b[i + 1];

    // Start of scan, or anything without a length field — copy the rest as is.
    if (marker === 0xda || marker === 0xd9) {
      keep.push(b.subarray(i));
      i = b.length;
      break;
    }

    const length = u16(b, i + 2);
    const segment = b.subarray(i, i + 2 + length);

    const isXmp =
      marker === 0xe1 && ascii(segment, 4, 28).startsWith("http://ns.adobe.com/x");
    const isPhotoshop =
      marker === 0xed && ascii(segment, 4, 13).startsWith("Photoshop");

    if (isXmp) dropped.push("XMP");
    else if (isPhotoshop) dropped.push("IPTC/Photoshop");
    else keep.push(segment);

    i += 2 + length;
  }

  if (i < b.length) keep.push(b.subarray(i));

  const total = keep.reduce((n, part) => n + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of keep) {
    out.set(part, offset);
    offset += part.length;
  }
  return { out, dropped };
}

export function scrubJpeg(bytes: Uint8Array): { out: Uint8Array; removed: string[] } {
  const { out: withoutSidecars, dropped } = dropSidecarSegments(bytes);
  const removed: string[] = [...dropped];

  let exif: ReturnType<typeof piexif.load>;
  try {
    exif = piexif.load(toBinary(withoutSidecars));
  } catch {
    return { out: withoutSidecars, removed };
  }

  let exifTouched = false;

  if (exif.GPS && Object.keys(exif.GPS).length > 0) {
    removed.push(`GPS (${Object.keys(exif.GPS).length} tags)`);
    exif.GPS = {};
    exifTouched = true;
  }
  if (exif.thumbnail) {
    // A second copy of the picture with its own metadata; survives crops.
    removed.push("embedded thumbnail");
    exif.thumbnail = null;
    exif["1st"] = {};
    exifTouched = true;
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
  ] as const) {
    if (exif[ifd] && exif[ifd][tag] !== undefined) {
      removed.push(LABELS[tag]);
      delete exif[ifd][tag];
      exifTouched = true;
    }
  }

  if (!exifTouched) return { out: withoutSidecars, removed };

  const inserted = piexif.insert(
    piexif.dump(exif),
    toBinary(withoutSidecars),
  );
  return { out: fromBinary(inserted), removed };
}
