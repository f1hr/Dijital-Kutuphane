"use client";

import { useState } from "react";
import type { BookQuote } from "@/lib/books";

type QuoteCardProps = {
  quote: BookQuote;
  bookSlug: string;
  onDelete: (quoteId: string) => void;
};

export default function QuoteCard({ quote, bookSlug, onDelete }: QuoteCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Bu alıntıyı silmek istediğinden emin misin?")) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/quotes?bookSlug=${encodeURIComponent(bookSlug)}&quoteId=${encodeURIComponent(quote.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onDelete(quote.id);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-[#C4873A]/20 bg-[#1C1410] p-6 text-[#E8D5B7] shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#E8D5B7]/45">
            {quote.page && quote.page > 0 ? `Sayfa ${quote.page}` : "Sayfa bilgisi yok"}
          </span>
          {quote.chapter && (
            <>
              <span className="h-1 w-1 rounded-full bg-[#C4873A]/30" />
              <span className="text-xs uppercase tracking-[0.28em] text-[#C4873A]/80 font-medium">
                {quote.chapter}
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg px-3 py-1 text-xs text-[#E8D5B7]/35 transition hover:text-red-400 disabled:opacity-40"
          aria-label="Alıntıyı sil"
        >
          {deleting ? "..." : "Sil"}
        </button>
      </div>

      <blockquote className="border-l border-[#C4873A]/40 pl-4 text-2xl italic leading-relaxed text-[#E8D5B7]">
        {quote.text}
      </blockquote>

      <p className="mt-5 text-base leading-8 text-[#E8D5B7]/82">
        {quote.analysis}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {quote.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#C4873A]/25 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[#C4873A]"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
