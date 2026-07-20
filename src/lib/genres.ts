/**
 * The genre menu, fixed by hand. Series store the Korean word (the Studio
 * offers the same list), and the nav prints the Latin — the same pairing
 * the rest of the design uses.
 */
export type GenreDef = {
  slug: string;
  /** Printed in the nav and page headings: STREET SHEET. */
  label: string;
  korean: string;
};

export const GENRES: GenreDef[] = [
  { slug: "street", label: "STREET", korean: "스트리트" },
  { slug: "landscape", label: "LANDSCAPE", korean: "풍경" },
  { slug: "portrait", label: "PORTRAIT", korean: "인물" },
  { slug: "macro", label: "MACRO", korean: "매크로" },
  { slug: "architect", label: "ARCHITECT", korean: "건축" },
  { slug: "abstract", label: "ABSTRACT", korean: "추상" },
];

export function genreBySlug(slug: string) {
  return GENRES.find((g) => g.slug === slug) ?? null;
}

/** A series belongs to a genre when its 분야 matches in either language. */
export function matchesGenre(seriesGenre: string | null, genre: GenreDef) {
  if (!seriesGenre) return false;
  const value = seriesGenre.trim().toLowerCase();
  return value === genre.korean || value === genre.label.toLowerCase();
}
