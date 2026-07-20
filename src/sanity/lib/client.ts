import { createClient } from "next-sanity";

import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

/**
 * Null until a project exists, so the content layer can fall back to the seed
 * rather than throwing at import time.
 */
export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Published content from the CDN by default; sanityFetch in lib/live.ts
      // switches to drafts when the Studio's Presentation tab is driving.
      useCdn: true,
      perspective: "published",
      // Overlay metadata for click-to-edit. Only encoded during draft mode,
      // so public visitors never receive it.
      stega: { studioUrl: "/studio" },
    })
  : null;
