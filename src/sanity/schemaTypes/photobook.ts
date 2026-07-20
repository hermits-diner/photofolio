import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A book is the edit carried one step further: frames pulled from the
 * archive into a candidate pool, then paired into spreads. The spread — not
 * the page — is the unit of bookmaking, because two facing pictures either
 * talk to each other or they don't.
 *
 * Nothing here is public. The site learns about a book only after it exists
 * on paper — a public page for published books is a later phase.
 */
export const photobook = defineType({
  name: "photobook",
  title: "사진집",
  type: "document",
  icon: BookIcon,
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
      description: "출간 후 소개 페이지가 생기면 쓰입니다.",
      type: "slug",
      options: { source: "title", maxLength: 60 },
    }),
    defineField({
      name: "status",
      title: "상태",
      type: "string",
      options: {
        list: [
          { title: "기획", value: "planning" },
          { title: "에디트", value: "editing" },
          { title: "시퀀스 확정", value: "locked" },
          { title: "인쇄", value: "printing" },
          { title: "출간", value: "published" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "planning",
    }),
    defineField({
      name: "statement",
      title: "소개",
      description: "이 책이 무엇인지 두세 문장으로. 출간 후 소개 글의 바탕이 됩니다.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "cover",
      title: "표지 컷",
      type: "reference",
      to: [{ type: "photo" }],
    }),

    defineField({
      name: "candidates",
      title: "에디트 풀",
      description:
        "책에 들어갈 후보들. 시트의 셀렉트를 여기 모아놓고 시퀀스를 짭니다. 탈락해도 지우지 말고 남겨두세요 — 무엇을 뺐는지도 에디트의 기록입니다.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "photo" }] })],
    }),
    defineField({
      name: "spreads",
      title: "시퀀스 (펼침면)",
      description:
        "책이 펼쳐진 순서 그대로. 끌어서 순서를 바꿉니다. 한쪽을 비우면 백면입니다.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "spread",
          title: "펼침면",
          fields: [
            defineField({
              name: "left",
              title: "왼쪽",
              type: "reference",
              to: [{ type: "photo" }],
            }),
            defineField({
              name: "right",
              title: "오른쪽",
              type: "reference",
              to: [{ type: "photo" }],
            }),
            defineField({
              name: "note",
              title: "메모",
              description: "이 페어링을 왜 붙였는지. 나중의 자신에게 남기는 말입니다.",
              type: "string",
            }),
          ],
          preview: {
            select: {
              left: "left.frameRef",
              right: "right.frameRef",
              note: "note",
              media: "left.image",
              mediaRight: "right.image",
            },
            prepare: ({ left, right, note, media, mediaRight }) => ({
              title: `${left ?? "백면"} | ${right ?? "백면"}`,
              subtitle: note,
              media: media ?? mediaRight,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: "trimWidth",
      title: "판형 — 너비 (mm)",
      type: "number",
      group: "spec",
    }),
    defineField({
      name: "trimHeight",
      title: "판형 — 높이 (mm)",
      type: "number",
      group: "spec",
    }),
    defineField({
      name: "paper",
      title: "용지",
      description: "본문 용지. 몽블랑 130g, 반누보 …",
      type: "string",
      group: "spec",
    }),
    defineField({
      name: "binding",
      title: "제본",
      description: "사철, 무선, 중철 … 펼침면이 중요하면 사철이 유리합니다.",
      type: "string",
      group: "spec",
    }),
    defineField({
      name: "copies",
      title: "부수",
      type: "number",
      group: "spec",
    }),

    defineField({
      name: "productionLog",
      title: "제작 기록",
      description: "견적, 교정쇄, 입고 — 날짜와 비용이 남는 일은 전부 여기에.",
      type: "array",
      group: "production",
      of: [
        defineArrayMember({
          type: "object",
          name: "logEntry",
          title: "기록",
          fields: [
            defineField({ name: "date", title: "날짜", type: "date" }),
            defineField({
              name: "event",
              title: "내용",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "cost",
              title: "비용 (원)",
              type: "number",
            }),
            defineField({ name: "memo", title: "메모", type: "text", rows: 2 }),
          ],
          preview: {
            select: { title: "event", date: "date", cost: "cost" },
            prepare: ({ title, date, cost }) => ({
              title,
              subtitle: [date, cost != null ? `${cost.toLocaleString("ko-KR")}원` : null]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),
  ],
  groups: [
    { name: "spec", title: "사양" },
    { name: "production", title: "제작" },
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      spreads: "spreads",
      media: "cover.image",
    },
    prepare: ({ title, status, spreads, media }) => {
      const statusLabel =
        { planning: "기획", editing: "에디트", locked: "시퀀스 확정", printing: "인쇄", published: "출간" }[
          status as string
        ] ?? status;
      const count = Array.isArray(spreads) ? `펼침면 ${spreads.length}` : null;
      return {
        title,
        subtitle: [statusLabel, count].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
