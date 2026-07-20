import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

/**
 * Everything that appears once on the site: the masthead, the opening copy,
 * and the colophon. Edited as a singleton — see the structure in
 * sanity.config.ts.
 *
 * There is deliberately no field for a legal name. The byline slot holds a
 * working alias, so the site can be run anonymously without the design
 * having an empty hole where a name would go.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "사이트 설정",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "alias",
      title: "이름 대신 쓸 것",
      description:
        "본명이 아니라 활동명이나 프로젝트 이름을 씁니다. 사이트 어디에도 본명이 들어가는 자리는 없습니다.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "aliasLatin",
      title: "로마자 표기",
      description: "표지의 큰 글자입니다. 콘덴스드 라틴 서체로 짜입니다.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      title: "주 활동 지역",
      description: "비워둬도 됩니다. 도시까지만 적는 편이 익명에 안전합니다.",
      type: "string",
    }),
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
      description: "본명이 드러나지 않는 주소를 쓰세요.",
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
    select: { title: "alias", subtitle: "city" },
  },
});
