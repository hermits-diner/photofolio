import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import { DisableDraftMode } from "@/components/disable-draft-mode";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SanityLive } from "@/sanity/lib/live";

/** Everything the public site shares and the Studio must not inherit. */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SmoothScroll>
      {children}
      {/* Live Content API subscription — published edits appear without a reload. */}
      {SanityLive && <SanityLive />}
      {(await draftMode()).isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </SmoothScroll>
  );
}
