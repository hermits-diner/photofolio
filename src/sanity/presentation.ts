import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

/**
 * Tells the Presentation tab which page shows a given document, so editing
 * a series opens its sheet in the preview pane. Frames have no page of
 * their own — they surface through the series that place them.
 */
export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    series: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "제목 없음", href: `/series/${doc?.slug}` },
          { title: "모든 시트", href: "/" },
        ],
      }),
    }),
    exhibition: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "제목 없음", href: `/exhibitions/${doc?.slug}` },
          { title: "모든 전시", href: "/exhibitions" },
        ],
      }),
    }),
    photobook: defineLocations({
      message: "출간 상태가 되면 사진집 페이지에 나옵니다",
      locations: [{ title: "사진집", href: "/books" }],
    }),
    siteSettings: defineLocations({
      message: "사이트 전체에 표시됩니다",
      locations: [
        { title: "홈", href: "/" },
        { title: "소개", href: "/about" },
      ],
    }),
  },
};
