import { DocumentsIcon } from "@sanity/icons/Documents";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A theme, presented as one contact sheet. The log fields are not decoration
 * — they are the spine of the page's right-hand column, and the sheet number
 * is what the design calls the section.
 *
 * Frames are an ordered list rather than a back-reference so that dragging
 * them in the Studio is the same act as reordering the sheet.
 */
export const series = defineType({
  name: "series",
  title: "시리즈",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "title",
      title: "제목",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "titleLatin",
      title: "제목 (로마자)",
      description:
        "큰 제목은 콘덴스드 라틴 서체로 짜입니다. 비워두면 한글 제목이 그 자리에 들어갑니다.",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "주소",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sheetNumber",
      title: "시트 번호",
      description: "037 처럼. 화면에 'SHEET 037' 로 나옵니다.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "statement",
      title: "설명",
      description: "이 시리즈가 무엇인지 두세 문장으로.",
      type: "text",
      rows: 4,
    }),

    defineField({
      name: "frames",
      title: "프레임",
      description: "찍은 순서대로. 끌어서 순서를 바꾸면 시트도 그대로 바뀝니다.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "photo" }] })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "cover",
      title: "대표 컷",
      description: "공유 카드와 목록에 쓰입니다. 비워두면 첫 프레임을 씁니다.",
      type: "reference",
      to: [{ type: "photo" }],
    }),

    // The list mirrors src/lib/genres.ts — the genre menu matches on these
    // exact words, so free typing would silently drop a sheet from its page.
    // 여행 stays for existing sheets; it has no menu of its own yet.
    defineField({
      name: "genre",
      title: "분야",
      description: "분야별 메뉴(STREET SHEET …)가 이 값으로 시트를 모읍니다.",
      type: "string",
      options: {
        list: ["스트리트", "풍경", "인물", "매크로", "건축", "추상", "여행"],
      },
      group: "log",
    }),
    defineField({
      name: "location",
      title: "지역",
      description: "서울 중구, 오사카 …",
      type: "string",
      group: "log",
    }),
    defineField({
      name: "camera",
      title: "바디",
      type: "string",
      description: "Fujifilm X100V …",
      group: "log",
    }),
    defineField({
      name: "lenses",
      title: "렌즈",
      type: "string",
      description: "23mm 고정, 35mm · 50mm …",
      group: "log",
    }),
    defineField({
      name: "shotOver",
      title: "촬영 기간",
      type: "string",
      description: "2026년 3월 — 4월",
      group: "log",
    }),

    defineField({
      name: "publishedAt",
      title: "공개일",
      type: "datetime",
      description: "목록은 이 순서로 정렬됩니다. 비어 있으면 공개되지 않습니다.",
    }),
  ],
  groups: [{ name: "log", title: "촬영 정보" }],
  orderings: [
    {
      name: "publishedDesc",
      title: "최신순",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      sheetNumber: "sheetNumber",
      media: "cover.image",
      fallback: "frames.0.image",
    },
    prepare: ({ title, sheetNumber, media, fallback }) => ({
      title,
      subtitle: `Sheet ${sheetNumber ?? "—"}`,
      media: media ?? fallback,
    }),
  },
});
