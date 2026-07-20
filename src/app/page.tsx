import { ContactSheet } from "@/components/contact-sheet";
import { frames, photographer, roll } from "@/data/roll";

/** Exposure data reads as a column of figures, the way a shooting log does. */
function LogLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-rebate/15 py-1.5">
      <dt className="rebate-type w-28 shrink-0 text-silver">{label}</dt>
      <dd className="font-data text-sm text-rebate">{value}</dd>
    </div>
  );
}

export default function Page() {
  const selects = frames.filter((f) => f.select).length;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      {/* ── Masthead ─────────────────────────────────────────────── */}
      <header className="flex items-baseline justify-between gap-4 border-b border-rebate/20 py-4">
        <p className="rebate-type">
          {photographer.latin} — {photographer.city}
        </p>
        <p className="rebate-type text-silver">{roll.shotOver}</p>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="grid gap-10 pt-12 pb-20 lg:grid-cols-[1.35fr_1fr] lg:gap-16 lg:pt-20 lg:pb-28">
        <div>
          <p className="rebate-type text-silver">
            {roll.stock} <span className="mx-2 text-grease">▸▸▸</span> Roll {roll.number}
          </p>

          {/* Set the way a name prints on a film rebate: Latin, condensed. */}
          <h1 className="mt-4 font-display text-[clamp(3.75rem,13vw,10.5rem)] leading-[0.84] font-medium tracking-[-0.015em] uppercase">
            {photographer.latin}
          </h1>
          <p className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {photographer.name}
          </p>

          <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-rebate/85 sm:text-xl">
            빛이 사라지기 직전의 도시를 찍습니다. 모든 사진은 필름으로 찍고 직접
            현상합니다. 아래는 가장 최근 롤의 컨택트시트입니다.
          </p>

          <p className="note mt-10 text-silver">
            ↓ {frames.length}컷 중 {selects}컷 인화 선정
          </p>
        </div>

        {/* The shooting log — the same data a photographer writes on the sleeve. */}
        <dl className="self-end lg:pb-3">
          <LogLine label="Roll" value={roll.number} />
          <LogLine label="Stock" value={roll.stock} />
          <LogLine label="Rated" value={roll.rated} />
          <LogLine label="Developer" value={roll.developer} />
          <LogLine label="Frames" value={`${frames.length}`} />
        </dl>
      </section>

      {/* ── The sheet ────────────────────────────────────────────── */}
      <section aria-labelledby="sheet-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
          <h2
            id="sheet-heading"
            className="font-display text-3xl tracking-tight uppercase"
          >
            Sheet {roll.number}
          </h2>
          <p className="note text-silver">
            프레임을 누르면 크게 볼 수 있습니다 ·{" "}
            <span className="text-grease">✕</span> 표시는 인화할 컷
          </p>
        </div>

        <ContactSheet frames={frames} />
      </section>

      {/* ── Colophon ─────────────────────────────────────────────── */}
      <footer className="mt-24 grid gap-10 border-t border-rebate/20 py-12 sm:grid-cols-2 lg:mt-32">
        <div>
          <h2 className="font-display text-3xl tracking-tight uppercase">
            작업 의뢰
          </h2>
          <p className="mt-4 max-w-sm font-body text-lg leading-relaxed text-rebate/85">
            인물, 공간, 기록 작업을 받습니다. 촬영 일정과 예산을 함께 보내주시면
            사흘 안에 답장합니다.
          </p>
        </div>

        <dl className="self-end">
          <LogLine label="Email" value={photographer.email} />
          <LogLine label="Instagram" value={photographer.instagram} />
          <LogLine label="Based in" value={`${photographer.city}, KR`} />
        </dl>
      </footer>
    </main>
  );
}
