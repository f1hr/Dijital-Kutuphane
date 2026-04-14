"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookQuote } from "@/lib/books";

type QuoteCardProps = {
  quote: BookQuote;
  bookSlug: string;
};

export default function QuoteCard({ quote, bookSlug }: QuoteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Bu alıntıyı silmek istediğine emin misin?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quotes/${quote.id}?bookSlug=${bookSlug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Alıntı silinemedi.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bir hata oluştu.");
      setIsDeleting(false);
    }
  }

  return (
    <article className={`rounded-2xl border border-[#C4873A]/20 bg-[#1C1410] p-6 text-[#E8D5B7] shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-opacity ${isDeleting ? "opacity-50" : "opacity-100"}`}>
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
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {isDeleting ? "Siliniyor..." : "Sil"}
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
