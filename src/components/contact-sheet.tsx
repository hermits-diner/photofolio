"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import type { Frame } from "@/content";
import { cn } from "@/lib/utils";

/**
 * Adds the resolve animation once a strip has actually been scrolled to, so
 * the image appears as you arrive at it rather than all at once off-screen.
 */
function useResolveOnView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || resolved) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setResolved(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [resolved]);

  return { ref, resolved };
}

/**
 * The ring drawn around a frame that survived the edit — the one mark an
 * editor makes on a sheet. Drawn as an open, hand-drawn path with animated stroke.
 */
function SelectMark() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full z-10"
      viewBox="0 0 150 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M118 14 C132 34, 128 66, 106 82 C82 99, 44 97, 24 80 C6 64, 8 32, 28 17 C48 3, 92 2, 120 18"
        fill="none"
        stroke="var(--color-grease)"
        strokeWidth="2.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="animate-grease-draw"
        style={{
          filter: "drop-shadow(0 0 4px var(--color-grease-glow))",
        }}
      />
    </svg>
  );
}

function Cell({
  frame,
  index,
  onOpen,
}: {
  frame: Frame;
  index: number;
  onOpen: (index: number) => void;
}) {
  const { ref, resolved } = useResolveOnView<HTMLDivElement>();
  const [hovered, setHovered] = useState(false);

  const exifDetails = [
    frame.lens,
    frame.aperture,
    frame.shutter && `${frame.shutter}s`,
    frame.iso && `ISO${frame.iso}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div ref={ref} className="flex flex-col group/cell">
      <button
        type="button"
        onClick={() => onOpen(index)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`${frame.frameRef} 크게 보기${frame.caption ? ` — ${frame.caption}` : ""}`}
        className="group relative block aspect-3/2 w-full cursor-zoom-in overflow-hidden bg-rebate transition-all duration-300 hover:ring-2 hover:ring-grease/60 hover:shadow-2xl"
      >
        <Image
          src={frame.image.url}
          alt={frame.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={75}
          placeholder={frame.image.blurDataURL ? "blur" : "empty"}
          blurDataURL={frame.image.blurDataURL}
          className={cn(
            "object-cover transition-all duration-500 group-hover/cell:scale-[1.03] group-hover/cell:brightness-110",
            resolved && "resolves",
          )}
          style={{ "--resolve-delay": `${(index % 4) * 90}ms` } as React.CSSProperties}
        />
        
        {frame.select && <SelectMark />}

        {/* Hover overlay with zoom icon & EXIF overlay chip */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-rebate/90 via-rebate/20 to-transparent p-3 flex flex-col justify-between transition-opacity duration-300 pointer-events-none z-20",
            hovered ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex justify-end">
            <span className="glass-panel text-[10px] text-paper/90 px-2 py-0.5 rounded rebate-type font-mono tracking-widest border border-white/10">
              ZOOM ↗
            </span>
          </div>

          <div>
            {frame.caption && (
              <p className="text-paper text-xs font-display line-clamp-1 font-medium tracking-tight">
                {frame.caption}
              </p>
            )}
            {exifDetails && (
              <p className="text-[10px] font-mono text-paper/70 tracking-wider mt-0.5">
                {exifDetails}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* The gutter below each frame, where the file number sits. */}
      <div className="flex items-baseline justify-between gap-2 px-1 py-1.5 border-t border-paper/10 bg-[#0d0c0a]">
        <span className="rebate-type text-paper/60 group-hover/cell:text-paper transition-colors">
          {frame.frameRef}
        </span>
        <div className="flex items-center gap-1.5">
          {frame.place && (
            <span className="rebate-type text-silver/60 text-[9px] hidden sm:inline">
              {frame.place}
            </span>
          )}
          {frame.select && (
            <span
              className="rebate-type text-grease font-bold text-xs"
              title="셀렉트 (Survivors of the edit)"
            >
              ✕
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContactSheet({ frames }: { frames: Frame[] }) {
  const [openAt, setOpenAt] = useState(-1);
  const [filterSelectsOnly, setFilterSelectsOnly] = useState(false);

  const displayedFrames = filterSelectsOnly
    ? frames.filter((f) => f.select)
    : frames;

  const totalSelects = frames.filter((f) => f.select).length;

  return (
    <>
      {/* Control Bar: Filter Toggles */}
      <div className="flex items-center justify-between pb-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterSelectsOnly(false)}
            className={cn(
              "px-3 py-1 rebate-type rounded transition-all border",
              !filterSelectsOnly
                ? "bg-rebate text-paper border-rebate shadow"
                : "bg-paper/40 text-silver border-paper-shade hover:text-rebate",
            )}
          >
            전체 ({frames.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSelectsOnly(true)}
            className={cn(
              "px-3 py-1 rebate-type rounded transition-all border flex items-center gap-1.5",
              filterSelectsOnly
                ? "bg-grease text-white border-grease shadow-md shadow-grease/20"
                : "bg-paper/40 text-silver border-paper-shade hover:text-grease",
            )}
          >
            <span className="font-bold">✕</span> 셀렉트만 ({totalSelects})
          </button>
        </div>

        <span className="rebate-type text-silver hidden sm:inline">
          표시 중: {displayedFrames.length}컷
        </span>
      </div>

      {/* The sheet itself: frames floating in a black field. */}
      <div className="bg-rebate p-3 shadow-xl rounded-sm sm:p-5 border border-black/40">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {displayedFrames.map((frame, i) => (
            <Cell key={frame.frameRef} frame={frame} index={i} onOpen={setOpenAt} />
          ))}
        </div>

        {displayedFrames.length === 0 && (
          <div className="py-16 text-center text-paper/60 font-mono text-xs">
            선택된 셀렉트 프레임이 없습니다.
          </div>
        )}
      </div>

      <Lightbox
        open={openAt >= 0}
        index={Math.max(openAt, 0)}
        close={() => setOpenAt(-1)}
        slides={displayedFrames.map((f) => ({
          src: f.image.url,
          alt: f.alt,
          width: f.image.width,
          height: f.image.height,
        }))}
        carousel={{ finite: true, padding: "6%" }}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 400, swipe: 400 }}
        styles={{
          container: {
            backgroundColor:
              "color-mix(in srgb, var(--color-selenium) 99%, transparent)",
          },
        }}
        render={{
          // The frame opened, with the exposure that made it.
          slideFooter: () => {
            const f = displayedFrames[Math.max(openAt, 0)];
            if (!f) return null;
            return (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-[6vmin] pb-6 text-paper glass-panel border-t border-white/10">
                <div>
                  <p className="font-display text-2xl leading-none tracking-tight flex items-baseline gap-3">
                    {f.caption || f.frameRef}
                    {f.place && (
                      <span className="rebate-type text-paper/60 font-normal">
                        📍 {f.place}
                      </span>
                    )}
                  </p>
                </div>
                <p className="rebate-type text-paper/70 font-mono">
                  {[
                    f.frameRef,
                    f.lens,
                    f.aperture,
                    f.shutter && `${f.shutter}s`,
                    f.iso && `ISO ${f.iso}`,
                    f.shotAt,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            );
          },
        }}
      />
    </>
  );
}

