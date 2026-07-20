import "server-only";

import { identity, sessions, type SeedSession } from "@/data/seed";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import {
  allBooksQuery,
  allExhibitionsQuery,
  allSeriesQuery,
  exhibitionBySlugQuery,
  exhibitionSlugsQuery,
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
  /** Optional on purpose — an anonymous site may say nothing about where. */
  city: string | null;
  statement: string;
  about: string | null;
  email: string;
  instagram: string;
  threads: string | null;
  commissionNote: string;
};

export type ExhibitionWork = {
  id: string;
  printSize: string | null;
  paper: string | null;
  frame: string | null;
  edition: string | null;
  photo: Frame | null;
};

export type Exhibition = {
  id: string;
  title: string;
  titleLatin: string;
  slug: string;
  venue: string | null;
  address: string | null;
  /** Already formatted for display — 2026.09.05 */
  startDate: string | null;
  endDate: string | null;
  /** Formatted with time, Seoul — 2026.09.05 18:00 */
  opening: string | null;
  statement: string | null;
  cover: Frame | null;
  workCount: number;
  /** Filled on the detail page only. */
  works: ExhibitionWork[];
};

export type Book = {
  id: string;
  title: string;
  titleLatin: string;
  slug: string | null;
  statement: string | null;
  trimWidth: number | null;
  trimHeight: number | null;
  paper: string | null;
  binding: string | null;
  copies: number | null;
  cover: Frame | null;
  spreadCount: number;
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

/** 2026-09-05T09:00:00Z → 2026.09.05 18:00, pinned to Seoul. */
function formatOpening(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

type SanityExhibition = Omit<
  Exhibition,
  "titleLatin" | "cover" | "works" | "workCount"
> & {
  titleLatin: string | null;
  cover: SanityFrame | null;
  workCount: number | null;
  works?:
    | (Omit<ExhibitionWork, "photo"> & { photo: SanityFrame | null })[]
    | null;
};

function adaptExhibition(e: SanityExhibition): Exhibition {
  return {
    ...e,
    titleLatin: e.titleLatin || e.title,
    startDate: formatShotAt(e.startDate),
    endDate: formatShotAt(e.endDate),
    opening: formatOpening(e.opening),
    cover: e.cover ? adaptFrame(e.cover) : null,
    workCount: e.workCount ?? 0,
    works: (e.works ?? []).map((w) => ({
      ...w,
      photo: w.photo ? adaptFrame(w.photo) : null,
    })),
  };
}

type SanityBook = Omit<Book, "titleLatin" | "cover" | "spreadCount"> & {
  titleLatin: string | null;
  cover: SanityFrame | null;
  spreadCount: number | null;
};

function adaptBook(b: SanityBook): Book {
  return {
    ...b,
    titleLatin: b.titleLatin || b.title,
    cover: b.cover ? adaptFrame(b.cover) : null,
    spreadCount: b.spreadCount ?? 0,
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
      "거리에서 시작했지만 거리에만 있지는 않습니다. 대부분은 버리고, 남은 것만 여기에 둡니다. 이름은 밝히지 않습니다.",
    about: null,
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

// The seed has no exhibitions or books — those begin in the Studio, so the
// pages show their empty state until real ones are published.

export async function getExhibitions(opts: FetchOpts = {}): Promise<Exhibition[]> {
  if (!sanityFetch) return [];
  const { data } = await sanityFetch({ query: allExhibitionsQuery, stega: opts.stega });
  return (data as unknown as SanityExhibition[]).map(adaptExhibition);
}

export async function getExhibition(
  slug: string,
  opts: FetchOpts = {},
): Promise<Exhibition | null> {
  if (!sanityFetch) return null;
  const { data } = await sanityFetch({
    query: exhibitionBySlugQuery,
    params: { slug },
    stega: opts.stega,
  });
  return data ? adaptExhibition(data as unknown as SanityExhibition) : null;
}

export async function getExhibitionSlugs(): Promise<string[]> {
  if (!sanityFetch) return [];
  const { data } = await sanityFetch({
    query: exhibitionSlugsQuery,
    perspective: "published",
    stega: false,
  });
  return (data as { slug: string }[]).map((s) => s.slug);
}

export async function getBooks(opts: FetchOpts = {}): Promise<Book[]> {
  if (!sanityFetch) return [];
  const { data } = await sanityFetch({ query: allBooksQuery, stega: opts.stega });
  return (data as unknown as SanityBook[]).map(adaptBook);
}

export { isSanityConfigured };
