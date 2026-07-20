import type { Metadata } from "next";
import Image from "next/image";

import { Colophon, Masthead } from "@/components/site-chrome";
import { getBooks, getSettings, type Book } from "@/content";

export const metadata: Metadata = {
  title: "사진집",
  description: "출간된 사진집들.",
};

function BookRow({ book }: { book: Book }) {
  const trim =
    book.trimWidth && book.trimHeight ? `${book.trimWidth}×${book.trimHeight}mm` : null;
  const spec = [trim, book.paper, book.binding, book.copies ? `${book.copies}부` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="-mx-3 grid gap-6 border-t border-rebate/20 px-3 py-8 sm:grid-cols-[220px_1fr]">
      {book.cover ? (
        <div className="relative aspect-3/4 overflow-hidden rounded-sm border border-black/30 bg-rebate shadow-md">
          <Image
            src={book.cover.image.url}
            alt=""
            fill
            sizes="220px"
            quality={70}
            placeholder={book.cover.image.blurDataURL ? "blur" : "empty"}
            blurDataURL={book.cover.image.blurDataURL}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-3/4 rounded-sm border border-rebate/15 bg-rebate/5" />
      )}

      <div className="self-end">
        <h2 className="font-display text-3xl font-medium tracking-tight uppercase sm:text-4xl">
          {book.titleLatin}
        </h2>
        <p className="mt-1 font-display text-xl font-medium tracking-tight">{book.title}</p>
        {book.statement && (
          <p className="mt-4 max-w-md font-body text-lg leading-relaxed text-rebate/85">
            {book.statement}
          </p>
        )}
        <p className="rebate-type mt-4 text-silver">
          {[spec, book.spreadCount ? `펼침면 ${book.spreadCount}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </article>
  );
}

export default async function BooksPage() {
  const [settings, books] = await Promise.all([getSettings(), getBooks()]);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14">
      <Masthead settings={settings} right={`${books.length} books`} />

      <section className="pt-12 pb-10 lg:pt-20">
        <h1 className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.86] font-medium tracking-[-0.015em] uppercase text-rebate">
          Books
        </h1>
        <p className="mt-3 font-display text-2xl font-medium tracking-tight">사진집</p>
      </section>

      {books.length === 0 ? (
        <p className="border-t border-rebate/20 py-16 font-body text-lg text-silver">
          아직 출간된 사진집이 없습니다. 만드는 중인 책은 출간되는 날 여기에 올라옵니다.
        </p>
      ) : (
        <section aria-label="사진집">
          {books.map((book) => (
            <BookRow key={book.id} book={book} />
          ))}
        </section>
      )}

      <Colophon settings={settings} />
    </main>
  );
}
