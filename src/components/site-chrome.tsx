"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LogLine } from "@/components/log-line";
import type { Settings } from "@/content";

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

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-rebate/20 bg-paper/90 py-4 backdrop-blur-md transition-all">
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

      {right && (
        <div className="flex items-center gap-2">
          <p className="rebate-type text-silver bg-rebate/5 px-2.5 py-1 rounded border border-rebate/10">
            {right}
          </p>
        </div>
      )}
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
    <footer className="mt-24 grid gap-10 border-t border-rebate/20 py-16 sm:grid-cols-2 lg:mt-32 relative">
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

