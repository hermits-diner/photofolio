import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Gothic_A1,
  Nanum_Myeongjo,
  Newsreader,
  Spline_Sans_Mono,
} from "next/font/google";

import { SmoothScroll } from "@/components/smooth-scroll";
import { photographer } from "@/data/roll";
import "./globals.css";

/*
  Three roles, borrowed from the objects the work is made of.

  Display is a condensed grotesque — the same class of letterform stamped
  along a film rebate and printed on a film box. Body is a serif, which
  inverts the usual pairing and keeps the running text quiet next to it.
  Mono carries exposure data, where figures need to line up in columns.
*/
const display = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const body = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const data = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
});

/*
  None of the three Latin faces carry Hangul, so Korean would drop to
  whatever the OS supplies — a different voice on every machine. These two
  are the Korean half of the same pairing: a gothic that sits with the
  condensed display, a myeongjo that sits with the serif body.
*/
const displayKo = Gothic_A1({
  variable: "--font-gothic-a1",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const bodyKo = Nanum_Myeongjo({
  variable: "--font-nanum-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  // Replace with the production origin so share cards resolve absolutely.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: `${photographer.name} — 흑백 필름 사진`,
  description: `${photographer.city}에서 흑백 필름으로 작업하는 ${photographer.name}의 컨택트시트.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${display.variable} ${body.variable} ${data.variable} ${displayKo.variable} ${bodyKo.variable} h-full`}
    >
      <body className="min-h-full">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
