import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

/**
 * Everything that appears once on the site: the masthead, the hero copy, and
 * the colophon. Edited as a singleton — see the structure in sanity.config.ts.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "사이트 설정",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "name",
      title: "이름",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "latin",
      title: "이름 (로마자)",
      description: "표지의 큰 글자입니다. 콘덴스드 라틴 서체로 짜입니다.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "city", title: "도시", type: "string" }),
    defineField({
      name: "statement",
      title: "소개",
      description: "표지에 들어가는 두세 문장.",
      type: "text",
      rows: 4,
    }),

    defineField({
      name: "email",
      title: "이메일",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "instagram",
      title: "인스타그램",
      description: "@ 포함해서 적으세요.",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "threads",
      title: "스레드",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "commissionNote",
      title: "작업 의뢰 안내",
      type: "text",
      rows: 3,
      group: "contact",
    }),
  ],
  groups: [{ name: "contact", title: "연락" }],
  preview: {
    select: { title: "name", subtitle: "city" },
  },
});
