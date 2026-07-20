/**
 * Until a Sanity project exists, `projectId` is empty and the site renders
 * from the seed in src/data/roll.ts instead. See `isSanityConfigured`.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-07-01";

export const isSanityConfigured = projectId.length > 0;
