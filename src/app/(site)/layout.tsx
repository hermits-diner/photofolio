import { SmoothScroll } from "@/components/smooth-scroll";

/** Everything the public site shares and the Studio must not inherit. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
