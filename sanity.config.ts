"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool, type StructureBuilder } from "sanity/structure";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { resolve } from "@/sanity/presentation";
import { schemaTypes } from "@/sanity/schemaTypes";

/**
 * Site settings is a singleton — one document, edited in place. Listing it
 * like an ordinary type invites a second copy, and then the site silently
 * reads whichever one Sanity returns first.
 *
 * Frames get working views on top of the flat list: the selects (what the
 * edit kept) and the unplaced (uploaded but on no sheet yet — the to-do
 * pile). Both are filters, not folders; a frame is always one document.
 */
const structure = (S: StructureBuilder) =>
  S.list()
    // A Korean-only title slugifies to an empty id, which the serializer
    // rejects — the id has to be set by hand.
    .id("content")
    .title("콘텐츠")
    .items([
      S.listItem()
        .title("사이트 설정")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("series").title("시리즈"),
      S.listItem()
        .title("프레임")
        .id("photos")
        .child(
          S.list()
            .id("photos")
            .title("프레임")
            .items([
              S.listItem()
                .title("모든 프레임")
                .id("photos-all")
                .child(S.documentTypeList("photo").title("모든 프레임")),
              S.listItem()
                .title("셀렉트")
                .id("photos-selects")
                .child(
                  S.documentList()
                    .id("photos-selects")
                    .title("셀렉트")
                    .schemaType("photo")
                    .filter('_type == "photo" && select == true')
                    .apiVersion(apiVersion),
                ),
              S.listItem()
                .title("미배치 — 시트에 없는 컷")
                .id("photos-unplaced")
                .child(
                  S.documentList()
                    .id("photos-unplaced")
                    .title("미배치 — 시트에 없는 컷")
                    .schemaType("photo")
                    .filter(
                      '_type == "photo" && !(_id in *[_type == "series"].frames[]._ref)',
                    )
                    .apiVersion(apiVersion),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("photobook").title("사진집"),
      S.documentTypeListItem("exhibition").title("전시"),
    ]);

export default defineConfig({
  name: "default",
  title: "사진 관리",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    // The singleton stays out of the "create new" menu — the structure pane
    // is the only door, and it always opens the same document.
    newDocumentOptions: (prev) =>
      prev.filter((template) => template.templateId !== "siteSettings"),
  },
  plugins: [
    structureTool({ structure }),
    // 편집하며 실제 사이트를 그대로 보는 탭. /api/draft-mode/enable 이
    // 사이트를 드래프트 모드로 전환해 미공개 수정까지 렌더링한다.
    presentationTool({
      resolve,
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
