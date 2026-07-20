import "server-only";

import { identity, sessions, type SeedSession } from "@/data/seed";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import {
  allSeriesQuery,
  seriesBySlugQuery,
  seriesSlugsQuery,
  settingsQuery,
} from "@/sanity/lib/queries";

/**
 * The one shape the pages render. Sanity documents and the local seed are
 * both adapted into it, so no component ever branches on where content came
 * from — the only branch lives in this file.
 */
export type FrameImage = {
  url: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

export type Frame = {
  id: string;
  /** The filename the camera wrote: DSCF1043, _DSC4821 … */
  frameRef: string;
  slug: string | null;
  alt: string;
  caption: string | null;
  place: string | null;
  /** Already formatted for display — 2026.03.04 */
  shotAt: string | null;
  lens: string | null;
  aperture: string | null;
  shutter: string | null;
  iso: string | null;
  /** Survived the edit. */
  select: boolean;
  image: FrameImage;
};

export type Series = {
  id: string;
  title: string;
  titleLatin: string;
  slug: string;
  sheetNumber: string;
  statement: string | null;
  genre: string | null;
  location: string | null;
  camera: string | null;
  lenses: string | null;
  shotOver: string | null;
  frames: Frame[];
  cover: Frame | null;
};

/** No legal name anywhere — the byline slot holds a working alias. */
export type Settings = {
  alias: string;
  aliasLatin: string;
  city: string;
  statement: string;
  email: string;
  instagram: string;
  threads: string | null;
  commissionNote: string;
};

/**
 * Sanity stores dates as 2026-03-04, raw EXIF as 2026:03:04; the sheet
 * prints both as 2026.03.04.
 */
function formatShotAt(value: string | null | undefined) {
  if (!value) return null;
  return value.slice(0, 10).replaceAll("-", ".").replaceAll(":", ".");
}

/** 0.0166 → "1/60", 2.5 → "2.5s" — shutter the way a photographer reads it. */
function formatShutter(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return null;
  return seconds >= 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}`;
}

// ── Sanity ──────────────────────────────────────────────────────────────

type SanityFrame = Omit<Frame, "image"> & {
  image: { url: string; width: number; height: number; lqip?: string } | null;
  exif: {
    FocalLength?: number;
    FNumber?: number;
    ExposureTime?: number;
    ISO?: number;
    DateTimeOriginal?: string;
  } | null;
};

/**
 * Hand-entered fields win; the EXIF Sanity extracted on upload fills the
 * gaps. A scrubbed JPEG carries body, lens and exposure — so a freshly
 * uploaded frame annotates itself without any typing.
 */
function adaptFrame({ exif, ...f }: SanityFrame): Frame | null {
  if (!f.image?.url) return null;
  return {
    ...f,
    shotAt: formatShotAt(f.shotAt ?? exif?.DateTimeOriginal),
    lens: f.lens ?? (exif?.FocalLength ? `${Math.round(exif.FocalLength)}mm` : null),
    aperture: f.aperture ?? (exif?.FNumber ? `f/${exif.FNumber}` : null),
    shutter: f.shutter ?? formatShutter(exif?.ExposureTime),
    iso: f.iso ?? (exif?.ISO ? String(exif.ISO) : null),
    image: {
      url: f.image.url,
      width: f.image.width,
      height: f.image.height,
      blurDataURL: f.image.lqip,
    },
  };
}

type SanitySeries = Omit<Series, "frames" | "cover" | "titleLatin"> & {
  titleLatin: string | null;
  frames: SanityFrame[] | null;
  cover: SanityFrame | null;
};

function adaptSeries(s: SanitySeries): Series {
  return {
    ...s,
    titleLatin: s.titleLatin || s.title,
    frames: (s.frames ?? []).map(adaptFrame).filter((f): f is Frame => f !== null),
    cover: s.cover ? adaptFrame(s.cover) : null,
  };
}

/**
 * Passed by callers that feed text into places where stega's invisible
 * click-to-edit markers would corrupt the output: <title> tags, OG images,
 * static params. Page bodies leave it on (sanityFetch only encodes it
 * during draft mode anyway).
 */
type FetchOpts = { stega?: boolean };

// ── Seed ────────────────────────────────────────────────────────────────

/**
 * The starter sessions, shaped like Sanity results. Everything here is a
 * placeholder — it exists so the site builds and renders before a Sanity
 * project is connected, and it stops being used the moment one is.
 */
function seedSeries(s: SeedSession): Series {
  return {
    id: `seed-sheet-${s.number}`,
    title: s.title,
    titleLatin: s.titleLatin,
    slug: `sheet-${s.number}`,
    sheetNumber: s.number,
    statement: null,
    genre: s.genre,
    location: s.location,
    camera: s.camera,
    lenses: s.lenses,
    shotOver: s.shotOver,
    frames: s.frames.map((f, i) => ({
      id: `seed-${s.number}-${i}`,
      frameRef: f.frameRef,
      slug: null,
      alt: f.alt,
      caption: f.caption,
      place: f.place,
      shotAt: f.shotAt,
      lens: f.lens,
      aperture: f.aperture,
      shutter: f.shutter,
      iso: f.iso,
      select: f.select ?? false,
      image: { url: f.src, width: 1500, height: 1000 },
    })),
    cover: null,
  };
}

/** Newest sheet first, the same order the Sanity query returns. */
function seedSeriesList(): Series[] {
  return [...sessions]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(seedSeries);
}

function seedSettings(): Settings {
  return {
    alias: identity.alias,
    aliasLatin: identity.aliasLatin,
    city: identity.city,
    statement:
      "거리에서 찍습니다. 대부분은 버리고, 남은 것만 여기에 둡니다. 이름은 밝히지 않습니다.",
    email: identity.email,
    instagram: identity.instagram,
    threads: null,
    commissionNote: "작업에 대한 이야기와 질문은 이메일로 받습니다.",
  };
}

// ── Public API ──────────────────────────────────────────────────────────

export async function getSettings(opts: FetchOpts = {}): Promise<Settings> {
  if (!sanityFetch) return seedSettings();
  const { data } = await sanityFetch({ query: settingsQuery, stega: opts.stega });
  return data ? ({ ...seedSettings(), ...data } as Settings) : seedSettings();
}

export async function getAllSeries(opts: FetchOpts = {}): Promise<Series[]> {
  if (!sanityFetch) return seedSeriesList();
  const { data } = await sanityFetch({ query: allSeriesQuery, stega: opts.stega });
  return (data as unknown as SanitySeries[]).map(adaptSeries);
}

export async function getSeries(
  slug: string,
  opts: FetchOpts = {},
): Promise<Series | null> {
  if (!sanityFetch) {
    return seedSeriesList().find((s) => s.slug === slug) ?? null;
  }
  const { data } = await sanityFetch({
    query: seriesBySlugQuery,
    params: { slug },
    stega: opts.stega,
  });
  return data ? adaptSeries(data as unknown as SanitySeries) : null;
}

export async function getSeriesSlugs(): Promise<string[]> {
  if (!sanityFetch) return seedSeriesList().map((s) => s.slug);
  const { data } = await sanityFetch({
    query: seriesSlugsQuery,
    perspective: "published",
    stega: false,
  });
  return (data as { slug: string }[]).map((s) => s.slug);
}

export { isSanityConfigured };
