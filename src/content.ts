import "server-only";

import { frames as seedFrames, identity, session } from "@/data/seed";
import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
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

/** Sanity stores dates as 2026-03-04; the sheet prints them 2026.03.04. */
function formatShotAt(value: string | null | undefined) {
  if (!value) return null;
  return value.slice(0, 10).replaceAll("-", ".");
}

// ── Sanity ──────────────────────────────────────────────────────────────

type SanityFrame = Omit<Frame, "image"> & {
  image: { url: string; width: number; height: number; lqip?: string } | null;
};

function adaptFrame(f: SanityFrame): Frame | null {
  if (!f.image?.url) return null;
  return {
    ...f,
    shotAt: formatShotAt(f.shotAt),
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

/** Content changes when a session is published, so a minute of staleness is fine. */
const FRESHNESS = { next: { revalidate: 60 } } as const;

// ── Seed ────────────────────────────────────────────────────────────────

/**
 * The starter session, shaped like a Sanity result. Everything here is a
 * placeholder — it exists so the site builds and renders before a Sanity
 * project is connected, and it stops being used the moment one is.
 */
function seedSeries(): Series {
  return {
    id: "seed-session",
    title: "밤으로 가는 길",
    titleLatin: "Toward Night",
    slug: `sheet-${session.number}`,
    sheetNumber: session.number,
    statement: null,
    genre: session.genre,
    location: session.location,
    camera: session.camera,
    lenses: session.lenses,
    shotOver: session.shotOver,
    frames: seedFrames.map((f, i) => ({
      id: `seed-${i}`,
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
    commissionNote:
      "촬영 의뢰와 사용 문의를 받습니다. 일정과 용도를 함께 보내주시면 사흘 안에 답장합니다.",
  };
}

// ── Public API ──────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  if (!client) return seedSettings();
  const data = await client.fetch(settingsQuery, {}, FRESHNESS);
  return data ? ({ ...seedSettings(), ...data } as Settings) : seedSettings();
}

export async function getAllSeries(): Promise<Series[]> {
  if (!client) return [seedSeries()];
  const data = await client.fetch(allSeriesQuery, {}, FRESHNESS);
  return (data as unknown as SanitySeries[]).map(adaptSeries);
}

export async function getSeries(slug: string): Promise<Series | null> {
  if (!client) {
    const seed = seedSeries();
    return seed.slug === slug ? seed : null;
  }
  const data = await client.fetch(seriesBySlugQuery, { slug }, FRESHNESS);
  return data ? adaptSeries(data as unknown as SanitySeries) : null;
}

export async function getSeriesSlugs(): Promise<string[]> {
  if (!client) return [seedSeries().slug];
  const data = await client.fetch(seriesSlugsQuery, {}, FRESHNESS);
  return (data as { slug: string }[]).map((s) => s.slug);
}

export { isSanityConfigured };
