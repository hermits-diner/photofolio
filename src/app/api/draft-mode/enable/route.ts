import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/live";

/**
 * The Studio's Presentation tab calls this to switch the site into draft
 * mode, where sanityFetch renders unpublished edits. The URL carries a
 * one-time secret that defineEnableDraftMode verifies against the project.
 */
const notConfigured = async () =>
  new Response("Sanity is not configured", { status: 404 });

export const GET = client
  ? defineEnableDraftMode({
      client: client.withConfig({ token: readToken }),
    }).GET
  : notConfigured;
