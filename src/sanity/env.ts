/**
 * Until a Sanity project exists, `projectId` is empty and the site renders
 * from the seed in src/data/roll.ts instead. See `isSanityConfigured`.
 *
 * Values are cleaned of stray quotes and whitespace — dotenv strips quotes
 * but hosting dashboards keep them, and a pasted `"abc123"` fails the
 * client's projectId validation at build time.
 */
function cleanEnv(value: string | undefined) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export const projectId = cleanEnv(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
export const dataset = cleanEnv(process.env.NEXT_PUBLIC_SANITY_DATASET) || "production";
export const apiVersion =
  cleanEnv(process.env.NEXT_PUBLIC_SANITY_API_VERSION) || "2026-07-01";

export const isSanityConfigured = projectId.length > 0;
