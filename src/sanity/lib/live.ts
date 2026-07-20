import { defineLive } from "next-sanity/live";

import { client } from "./client";

/** Cleaned like env.ts — a value pasted with quotes would 401 silently. */
export const readToken =
  (process.env.SANITY_API_READ_TOKEN ?? "").trim().replace(/^["']|["']$/g, "") ||
  undefined;

const token = readToken;

/**
 * sanityFetch keeps every page current via the Live Content API — publish in
 * the Studio and the site updates without a manual revalidate. The viewer
 * token additionally lets draft mode render unpublished edits inside the
 * Presentation tab; without one, live updates still work for published
 * content.
 *
 * Both are null until a project is connected — src/content.ts falls back to
 * the seed, and the layout skips <SanityLive />.
 */
export const { sanityFetch, SanityLive } = client
  ? defineLive({ client, serverToken: token, browserToken: token })
  : { sanityFetch: null, SanityLive: null };
