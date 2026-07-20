import { defineQuery } from "next-sanity";

/**
 * Every frame is projected the same way so the adapter in src/content.ts has
 * one shape to convert. `asset->` pulls the dimensions and the LQIP the
 * design needs while a scan loads.
 */
const FRAME = /* groq */ `
  "id": _id,
  frameRef,
  "slug": slug.current,
  alt,
  caption,
  place,
  shotAt,
  lens,
  aperture,
  shutter,
  iso,
  "select": coalesce(select, false),
  "image": image.asset->{
    url,
    "width": metadata.dimensions.width,
    "height": metadata.dimensions.height,
    "lqip": metadata.lqip
  },
  // What the camera wrote, extracted by Sanity on upload. The adapter falls
  // back to these when the hand-entered exposure fields are empty — upload a
  // scrubbed JPEG and the sheet annotates itself.
  "exif": image.asset->metadata.exif{
    FocalLength,
    FNumber,
    ExposureTime,
    "ISO": coalesce(ISO, ISOSpeedRatings),
    DateTimeOriginal
  }
`;

const SERIES = /* groq */ `
  "id": _id,
  title,
  titleLatin,
  "slug": slug.current,
  sheetNumber,
  statement,
  genre,
  location,
  camera,
  lenses,
  shotOver,
  publishedAt,
  "frames": frames[]->{ ${FRAME} },
  "cover": coalesce(cover->{ ${FRAME} }, frames[0]->{ ${FRAME} })
`;

/** Only series with a publish date are live — an empty date keeps one hidden. */
export const allSeriesQuery = defineQuery(`
  *[_type == "series" && defined(publishedAt) && defined(slug.current)]
    | order(publishedAt desc) { ${SERIES} }
`);

export const seriesBySlugQuery = defineQuery(`
  *[_type == "series" && slug.current == $slug][0] { ${SERIES} }
`);

export const seriesSlugsQuery = defineQuery(`
  *[_type == "series" && defined(publishedAt) && defined(slug.current)]
    { "slug": slug.current }
`);

export const settingsQuery = defineQuery(`
  *[_type == "siteSettings"][0] {
    alias, aliasLatin, city, statement, about, email, instagram, threads, commissionNote
  }
`);

// ── Exhibitions ─────────────────────────────────────────────────────────
// The public shape only: checklist, budget and print materials are working
// state and never leave the Studio.

const EXHIBITION_CARD = /* groq */ `
  "id": _id,
  title,
  titleLatin,
  "slug": slug.current,
  venue,
  address,
  startDate,
  endDate,
  opening,
  statement,
  "cover": coalesce(cover->{ ${FRAME} }, works[0].photo->{ ${FRAME} }),
  "workCount": count(works)
`;

export const allExhibitionsQuery = defineQuery(`
  *[_type == "exhibition" && defined(publishedAt) && defined(slug.current)]
    | order(coalesce(startDate, publishedAt) desc) { ${EXHIBITION_CARD} }
`);

export const exhibitionBySlugQuery = defineQuery(`
  *[_type == "exhibition" && slug.current == $slug && defined(publishedAt)][0] {
    ${EXHIBITION_CARD},
    "works": works[]{
      "id": _key,
      printSize,
      paper,
      frame,
      edition,
      "photo": photo->{ ${FRAME} }
    }
  }
`);

export const exhibitionSlugsQuery = defineQuery(`
  *[_type == "exhibition" && defined(publishedAt) && defined(slug.current)]
    { "slug": slug.current }
`);

// ── Books ───────────────────────────────────────────────────────────────
// A book goes public when its status reaches 출간 — there is no separate
// publish date, because the object on paper is the publication.

export const allBooksQuery = defineQuery(`
  *[_type == "photobook" && status == "published"]
    | order(_createdAt desc) {
      "id": _id,
      title,
      titleLatin,
      "slug": slug.current,
      statement,
      trimWidth,
      trimHeight,
      paper,
      binding,
      copies,
      "cover": coalesce(cover->{ ${FRAME} }, spreads[0].left->{ ${FRAME} }),
      "spreadCount": count(spreads)
    }
`);
