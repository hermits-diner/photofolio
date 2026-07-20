import Link from "next/link";

import { LogLine } from "@/components/log-line";
import type { Settings } from "@/content";

export function Masthead({
  settings,
  right,
}: {
  settings: Settings;
  right?: string | null;
}) {
  return (
    <header className="flex items-baseline justify-between gap-4 border-b border-rebate/20 py-4">
      <Link href="/" className="rebate-type hover:text-grease">
        {settings.latin} — {settings.city}
      </Link>
      {right && <p className="rebate-type text-silver">{right}</p>}
    </header>
  );
}

export function Colophon({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-24 grid gap-10 border-t border-rebate/20 py-12 sm:grid-cols-2 lg:mt-32">
      <div>
        <h2 className="font-display text-3xl tracking-tight uppercase">작업 의뢰</h2>
        <p className="mt-4 max-w-sm font-body text-lg leading-relaxed text-rebate/85">
          {settings.commissionNote}
        </p>
      </div>

      <dl className="self-end">
        <LogLine label="Email" value={settings.email} />
        <LogLine label="Instagram" value={settings.instagram} />
        <LogLine label="Threads" value={settings.threads} />
        <LogLine label="Based in" value={`${settings.city}, KR`} />
      </dl>
    </footer>
  );
}
