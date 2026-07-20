import { PresentationIcon } from "@sanity/icons/Presentation";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A show: the selects moved from the sheet to a wall. Works carry their own
 * print spec — size, paper, frame, edition — because a print is a different
 * object from a file, and the spec is what the framer and the printer ask for.
 *
 * The checklist and budget are private working state; the public page (a
 * later phase) reads only title, venue, dates, statement and the works.
 * Like a series, nothing is public until 공개일 is set.
 */
export const exhibition = defineType({
  name: "exhibition",
  title: "전시",
  type: "document",
  icon: PresentationIcon,
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
      name: "venue",
      title: "공간",
      description: "갤러리·카페·대안공간 이름. 미정이면 비워두세요.",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "주소 (장소)",
      type: "string",
    }),
    defineField({ name: "startDate", title: "시작일", type: "date" }),
    defineField({ name: "endDate", title: "종료일", type: "date" }),
    defineField({
      name: "opening",
      title: "오프닝",
      description: "2026-09-05 18:00 처럼. 없으면 비워두세요.",
      type: "datetime",
    }),
    defineField({
      name: "statement",
      title: "전시 서문",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "cover",
      title: "대표 컷",
      description: "공유 카드와 목록에 쓰입니다. 비워두면 첫 출품작을 씁니다.",
      type: "reference",
      to: [{ type: "photo" }],
    }),

    defineField({
      name: "works",
      title: "출품작",
      description: "벽에 걸리는 순서대로. 사양은 프린트·액자 발주서에 쓰는 값 그대로.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "work",
          title: "출품작",
          fields: [
            defineField({
              name: "photo",
              title: "프레임",
              type: "reference",
              to: [{ type: "photo" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "printSize",
              title: "프린트 사이즈",
              description: "40×50cm, 11×14in …",
              type: "string",
            }),
            defineField({
              name: "paper",
              title: "용지",
              description: "한지, 하네뮬레 포토랙 …",
              type: "string",
            }),
            defineField({
              name: "frame",
              title: "액자",
              description: "무광 알루미늄 흑색, 우드 …",
              type: "string",
            }),
            defineField({
              name: "edition",
              title: "에디션",
              description: "1/7 처럼. 에디션을 두지 않으면 비워두세요.",
              type: "string",
            }),
            defineField({
              name: "price",
              title: "판매가 (원)",
              description: "판매하지 않으면 비워두세요.",
              type: "number",
            }),
          ],
          preview: {
            select: {
              frameRef: "photo.frameRef",
              caption: "photo.caption",
              printSize: "printSize",
              media: "photo.image",
            },
            prepare: ({ frameRef, caption, printSize, media }) => ({
              title: caption || frameRef || "(프레임 없음)",
              subtitle: [frameRef, printSize].filter(Boolean).join(" · "),
              media,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: "checklist",
      title: "체크리스트",
      description: "장소 섭외부터 철수까지. 끝낸 일은 지우지 말고 완료로 표시하세요.",
      type: "array",
      group: "prep",
      of: [
        defineArrayMember({
          type: "object",
          name: "task",
          title: "할 일",
          fields: [
            defineField({
              name: "task",
              title: "할 일",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "due", title: "마감", type: "date" }),
            defineField({
              name: "done",
              title: "완료",
              type: "boolean",
              initialValue: false,
            }),
            defineField({ name: "memo", title: "메모", type: "text", rows: 2 }),
          ],
          preview: {
            select: { title: "task", due: "due", done: "done" },
            prepare: ({ title, due, done }) => ({
              title: done ? `✓ ${title}` : title,
              subtitle: due,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "budget",
      title: "예산",
      description: "견적을 받으면 견적가를, 결제하면 실제 지출을 적습니다.",
      type: "array",
      group: "prep",
      of: [
        defineArrayMember({
          type: "object",
          name: "budgetItem",
          title: "항목",
          fields: [
            defineField({
              name: "item",
              title: "항목",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "quoted", title: "견적가 (원)", type: "number" }),
            defineField({ name: "actual", title: "실제 지출 (원)", type: "number" }),
            defineField({ name: "memo", title: "메모", type: "string" }),
          ],
          preview: {
            select: { title: "item", quoted: "quoted", actual: "actual" },
            prepare: ({ title, quoted, actual }) => ({
              title,
              subtitle:
                actual != null
                  ? `지출 ${actual.toLocaleString("ko-KR")}원`
                  : quoted != null
                    ? `견적 ${quoted.toLocaleString("ko-KR")}원`
                    : undefined,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: "materials",
      title: "인쇄물",
      description:
        "포스터·엽서·리플릿. 인쇄소에 넘기는 최종 파일과 사양을 전시와 함께 보관합니다.",
      type: "array",
      group: "prep",
      of: [
        defineArrayMember({
          type: "object",
          name: "printMaterial",
          title: "인쇄물",
          fields: [
            defineField({
              name: "kind",
              title: "종류",
              type: "string",
              options: {
                list: ["포스터", "엽서", "리플릿", "현수막", "도록", "기타"],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "이름",
              description: "A2 오프닝 포스터, 관객 배포용 엽서 …",
              type: "string",
            }),
            defineField({
              name: "file",
              title: "인쇄용 파일",
              description: "인쇄소에 넘기는 최종 파일 그대로 — PDF, AI, 고해상 JPEG.",
              type: "file",
            }),
            defineField({
              name: "preview",
              title: "미리보기 이미지",
              description: "목록에서 알아보기 위한 시안. 없으면 비워두세요.",
              type: "image",
            }),
            defineField({
              name: "size",
              title: "규격",
              description: "A2, 100×148mm …",
              type: "string",
            }),
            defineField({ name: "paper", title: "용지", type: "string" }),
            defineField({ name: "copies", title: "수량", type: "number" }),
            defineField({ name: "cost", title: "비용 (원)", type: "number" }),
            defineField({ name: "memo", title: "메모", type: "text", rows: 2 }),
          ],
          preview: {
            select: {
              kind: "kind",
              title: "title",
              size: "size",
              copies: "copies",
              media: "preview",
            },
            prepare: ({ kind, title, size, copies, media }) => ({
              title: title || kind,
              subtitle: [kind, size, copies != null ? `${copies}부` : null]
                .filter(Boolean)
                .join(" · "),
              media,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: "publishedAt",
      title: "공개일",
      description:
        "사이트의 전시 페이지가 생기면 이 순서로 공개됩니다. 비어 있으면 공개되지 않습니다 — 준비 중인 전시를 숨겨두는 방법입니다.",
      type: "datetime",
    }),
  ],
  groups: [{ name: "prep", title: "준비" }],
  orderings: [
    {
      name: "startDesc",
      title: "최신순",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      venue: "venue",
      startDate: "startDate",
      media: "cover.image",
      fallback: "works.0.photo.image",
    },
    prepare: ({ title, venue, startDate, media, fallback }) => ({
      title,
      subtitle: [venue ?? "장소 미정", startDate].filter(Boolean).join(" · "),
      media: media ?? fallback,
    }),
  },
});
