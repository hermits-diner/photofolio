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
      // Published content only, served from the CDN. Draft previews would
      // need a read token; that is a separate step from publishing a site.
      useCdn: true,
      perspective: "published",
    })
  : null;
