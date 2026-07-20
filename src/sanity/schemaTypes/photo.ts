import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

/**
 * One frame. Identified by the filename the camera wrote — that is the real
 * handle a digital photographer works from, and it survives every export.
 *
 * Sanity extracts EXIF on upload, so the exposure fields are a place to
 * correct or override it rather than to type everything by hand.
 */
export const photo = defineType({
  name: "photo",
  title: "프레임",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "image",
      title: "사진",
      type: "image",
      options: {
        hotspot: true,
        // Dimensions come back regardless; these are the extras worth paying
        // for. lqip is what fills the frame while the photo loads.
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
      name: "frameRef",
      title: "파일 번호",
      description: "카메라가 붙인 이름 그대로. DSCF1043, _DSC4821, IMG_0912 …",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "주소",
      description: "이 컷만 따로 공유할 때 쓰는 주소입니다.",
      type: "slug",
      options: { source: (doc) => `${doc.caption ?? doc.frameRef}`, maxLength: 60 },
    }),
    defineField({ name: "caption", title: "캡션", type: "string" }),
    defineField({ name: "place", title: "장소", type: "string" }),
    defineField({ name: "shotAt", title: "촬영일", type: "date" }),

    defineField({
      name: "lens",
      title: "렌즈",
      type: "string",
      description: "23mm, 35mm …",
      group: "exposure",
    }),
    defineField({
      name: "aperture",
      title: "조리개",
      type: "string",
      description: "f/2, f/8 …",
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
      name: "iso",
      title: "ISO",
      type: "string",
      description: "200, 6400 …",
      group: "exposure",
    }),

    defineField({
      name: "select",
      title: "셀렉트",
      description: "에디트에서 살아남은 컷. 시트에 표시가 붙습니다. 아껴 쓰세요.",
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
    select: {
      title: "caption",
      subtitle: "frameRef",
      media: "image",
      select: "select",
    },
    prepare: ({ title, subtitle, media, select }) => ({
      title: title || "(캡션 없음)",
      subtitle: select ? `${subtitle} · 셀렉트` : subtitle,
      media,
    }),
  },
});
