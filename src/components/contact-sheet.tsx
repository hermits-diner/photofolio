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
 * editor makes on a sheet, borrowed here because nothing else says "this one"
 * as plainly. Drawn as an open, slightly-off path; a clean ellipse reads as a
 * UI badge.
 */
function SelectMark() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 150 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M118 14 C132 34, 128 66, 106 82 C82 99, 44 97, 24 80 C6 64, 8 32, 28 17 C48 3, 92 2, 120 18"
        fill="none"
        stroke="var(--color-grease)"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.9"
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

  return (
    <div ref={ref} className="flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`${frame.frameRef} 크게 보기${frame.caption ? ` — ${frame.caption}` : ""}`}
        className="group relative block aspect-3/2 w-full cursor-zoom-in overflow-hidden bg-rebate"
      >
        <Image
          src={frame.image.url}
          alt={frame.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={70}
          placeholder={frame.image.blurDataURL ? "blur" : "empty"}
          blurDataURL={frame.image.blurDataURL}
          className={cn(
            "object-cover transition-[filter] duration-500 group-hover:brightness-110",
            resolved && "resolves",
          )}
          style={{ "--resolve-delay": `${(index % 4) * 90}ms` } as React.CSSProperties}
        />
        {frame.select && <SelectMark />}
      </button>

      {/* The gutter below each frame, where the file number sits. */}
      <div className="flex items-baseline justify-between gap-2 px-1 py-1.5">
        <span className="rebate-type text-paper/70">{frame.frameRef}</span>
        {frame.select && (
          <span className="rebate-type text-grease" title="셀렉트">
            ✕
          </span>
        )}
      </div>
    </div>
  );
}

export function ContactSheet({ frames }: { frames: Frame[] }) {
  const [openAt, setOpenAt] = useState(-1);

  return (
    <>
      {/* The sheet itself: frames floating in a black field. */}
      <div className="bg-rebate p-3 shadow-[0_1px_0_var(--color-paper-shade)] sm:p-5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {frames.map((frame, i) => (
            <Cell key={frame.frameRef} frame={frame} index={i} onOpen={setOpenAt} />
          ))}
        </div>
      </div>

      <Lightbox
        open={openAt >= 0}
        index={Math.max(openAt, 0)}
        close={() => setOpenAt(-1)}
        slides={frames.map((f) => ({
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
            const f = frames[Math.max(openAt, 0)];
            if (!f) return null;
            return (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-[6vmin] pb-5 text-paper">
                <p className="font-display text-2xl leading-none tracking-tight">
                  {f.caption}
                  <span className="rebate-type ml-3 align-middle text-paper/50">
                    {f.place}
                  </span>
                </p>
                <p className="rebate-type text-paper/60">
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
