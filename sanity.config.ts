"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";

/**
 * Site settings is a singleton — one document, edited in place. Listing it
 * like an ordinary type invites a second copy, and then the site silently
 * reads whichever one Sanity returns first.
 */
const structure = (S: StructureBuilder) =>
  S.list()
    .title("콘텐츠")
    .items([
      S.listItem()
        .title("사이트 설정")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("series").title("시리즈"),
      S.documentTypeListItem("photo").title("프레임"),
    ]);

export default defineConfig({
  name: "default",
  title: "사진 관리",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
