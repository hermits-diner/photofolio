"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

/**
 * Draft mode persists in a cookie, so someone who opened a preview and
 * wandered off would keep seeing drafts with no way out. Inside the
 * Presentation iframe the Studio owns that lifecycle — the button only
 * shows when previewing the site directly.
 */
export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();
  if (isPresentationTool !== false) return null;

  return (
    <a
      href="/api/draft-mode/disable"
      className="rebate-type fixed right-4 bottom-4 z-50 rounded-full bg-rebate px-4 py-2 text-paper shadow-lg hover:text-grease"
    >
      드래프트 미리보기 끄기
    </a>
  );
}
