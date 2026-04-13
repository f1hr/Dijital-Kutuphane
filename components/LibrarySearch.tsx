"use client";

import { useMemo, useState } from "react";
import BookCard from "@/components/BookCard";
import type { Book } from "@/lib/books";

type LibrarySearchProps = {
  books: Book[];
};

export default function LibrarySearch({ books }: LibrarySearchProps) {
  const [query, setQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr");

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) => {
      const haystack = [
        book.title,
        book.author,
        book.readDate,
        ...book.quotes.flatMap((quote) => [quote.text, quote.analysis, ...quote.tags]),
      ]
        .join(" ")
        .toLocaleLowerCase("tr");

      return haystack.includes(normalizedQuery);
    });
  }, [books, query]);

  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <label className="mb-3 block font-mono text-xs uppercase tracking-[0.26em] text-[#C4873A]">
          Arama
        </label>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kitap, yazar, alıntı veya tag ara"
          className="w-full rounded-2xl border border-[#E8D5B7]/12 bg-[#241913] px-5 py-4 text-base text-[#E8D5B7] outline-none transition placeholder:text-[#E8D5B7]/28 focus:border-[#C4873A]"
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-[#E8D5B7]/10 pb-4">
        <p className="text-sm text-[#E8D5B7]/66">
          {filteredBooks.length} kitap gösteriliyor
        </p>
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-mono text-xs uppercase tracking-[0.22em] text-[#C4873A] transition hover:text-[#E8D5B7]"
          >
            Temizle
          </button>
        ) : null}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-[#C4873A]/18 bg-[#241913] px-6 py-12 text-center">
          <p className="text-lg italic text-[#E8D5B7]/82">
            Bu aramayla eşleşen kitap bulunamadı.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} href={`/${book.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
