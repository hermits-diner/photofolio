"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogLine } from "@/components/log-line";
import type { Settings } from "@/content";

/**
 * The whole site, flat — the shape photographer sites settle on (Kenna:
 * work / upcoming / publications / resume / contact). No store, by policy.
 */
const NAV = [
  { href: "/", label: "시트" },
  { href: "/exhibitions", label: "전시" },
  { href: "/books", label: "사진집" },
  { href: "/about", label: "소개" },
] as const;

export function Masthead({
  settings,
  right,
}: {
  settings: Settings;
  right?: string | null;
}) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      setTimeStr(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rebate/20 bg-paper/90 py-4 backdrop-blur-md transition-all">
      <div className="flex items-center gap-3">
        <Link href="/" className="rebate-type hover:text-grease font-bold tracking-widest text-sm">
          {settings.aliasLatin}
          {settings.city && ` — ${settings.city}`}
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border border-rebate/15 bg-paper/60 text-[10px] rebate-type text-silver">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SEOUL {timeStr || "16:15"} KST</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <nav aria-label="주요 메뉴" className="flex items-center gap-3 sm:gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rebate-type text-xs transition-colors hover:text-grease ${
                isActive(item.href) ? "text-grease font-bold" : "text-silver"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a href="#contact" className="rebate-type text-xs text-silver hover:text-grease">
            연락
          </a>
        </nav>

        {right && (
          <p className="rebate-type text-silver bg-rebate/5 px-2.5 py-1 rounded border border-rebate/10 hidden md:block">
            {right}
          </p>
        )}
      </div>
    </header>
  );
}

export function Colophon({ settings }: { settings: Settings }) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (!settings.email) return;
    navigator.clipboard.writeText(settings.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="contact"
      className="mt-24 grid scroll-mt-20 gap-10 border-t border-rebate/20 py-16 sm:grid-cols-2 lg:mt-32 relative"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-grease" />
          <h2 className="font-display text-3xl tracking-tight uppercase">연락</h2>
        </div>
        <p className="mt-4 max-w-sm font-body text-lg leading-relaxed text-rebate/85">
          {settings.commissionNote}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="rebate-type px-4 py-2 bg-rebate text-paper hover:bg-grease transition-all rounded text-xs flex items-center gap-2 shadow-sm"
          >
            ✉️ {copied ? "이메일 복사 완료!" : `Email: ${settings.email}`}
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <dl className="space-y-1">
          <LogLine label="Email" value={settings.email} />
          <LogLine label="Instagram" value={settings.instagram} />
          <LogLine label="Threads" value={settings.threads} />
          <LogLine label="Based in" value={`${settings.city}, KR`} />
        </dl>

        <div className="mt-8 flex items-center justify-between border-t border-rebate/10 pt-4">
          <span className="rebate-type text-[10px] text-silver/80">
            © {new Date().getFullYear()} {settings.aliasLatin}. DIGITAL CONTACT SHEET.
          </span>
          <button
            type="button"
            onClick={scrollToTop}
            className="rebate-type text-silver hover:text-grease transition-colors text-xs flex items-center gap-1"
          >
            TOP ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

