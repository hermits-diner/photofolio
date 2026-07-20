import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

/**
 * One frame. Named for what it is on the sheet, not for what a CMS usually
 * calls it — the exposure fields are the ones a photographer writes on the
 * negative sleeve, in the notation they'd actually write.
 *
 * Scanner EXIF on film is either absent or describes the scanner, so the
 * exposure fields stay hand-entered. Sanity still extracts EXIF on upload;
 * it's kept for digital work and as a fallback, never as the source of truth.
 */
export const photo = defineType({
  name: "photo",
  title: "프레임",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "image",
      title: "스캔",
      type: "image",
      options: {
        hotspot: true,
        // Dimensions come back regardless; these are the extras worth paying
        // for. lqip is what fills the frame while the scan loads.
        metadata: ["lqip", "exif", "palette"],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "대체 텍스트",
      description:
        "사진을 볼 수 없는 사람에게 이 장면을 설명합니다. 캡션과 다릅니다 — 캡션은 제목, 이 필드는 묘사입니다.",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "edge",
      title: "엣지 넘버",
      description: "필름 여백에 찍히는 번호. 35mm는 1, 1A, 2, 2A … 순입니다.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "주소",
      description: "이 컷만 따로 공유할 때 쓰는 주소입니다.",
      type: "slug",
      options: { source: (doc) => `${doc.caption ?? doc.edge}`, maxLength: 60 },
    }),
    defineField({ name: "caption", title: "캡션", type: "string" }),
    defineField({ name: "place", title: "장소", type: "string" }),
    defineField({ name: "shotAt", title: "촬영일", type: "date" }),

    defineField({
      name: "lens",
      title: "렌즈",
      type: "string",
      description: "35mm, 50mm …",
      group: "exposure",
    }),
    defineField({
      name: "aperture",
      title: "조리개",
      type: "string",
      description: "f/1.4, f/8 …",
      group: "exposure",
    }),
    defineField({
      name: "shutter",
      title: "셔터",
      type: "string",
      description: "1/60, 1/500 …",
      group: "exposure",
    }),

    defineField({
      name: "select",
      title: "인화할 컷",
      description: "시트에 유성연필 동그라미가 그려집니다. 아껴 쓰세요.",
      type: "boolean",
      initialValue: false,
    }),

    // Phase 2 — the store reads these once checkout exists. Marking a frame
    // here does nothing on the site yet.
    defineField({
      name: "licensable",
      title: "판매 대상",
      type: "boolean",
      initialValue: false,
      group: "sales",
    }),
    defineField({
      name: "licenseNote",
      title: "이용 조건 메모",
      type: "text",
      rows: 3,
      group: "sales",
    }),
  ],
  groups: [
    { name: "exposure", title: "노출" },
    { name: "sales", title: "판매" },
  ],
  preview: {
    select: { title: "caption", subtitle: "edge", media: "image", select: "select" },
    prepare: ({ title, subtitle, media, select }) => ({
      title: title || "(캡션 없음)",
      subtitle: select ? `${subtitle} · 인화` : subtitle,
      media,
    }),
  },
});
