"use client";

import { ReactLenis } from "lenis/react";

/**
 * A contact sheet is something you scan slowly with a loupe, so the page
 * carries a little weight as it moves. Users who ask for reduced motion get
 * the browser's native scroll instead — Lenis honours the media query itself.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 0.9 }}>
      {children}
    </ReactLenis>
  );
}
