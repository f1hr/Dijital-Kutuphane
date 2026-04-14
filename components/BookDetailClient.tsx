"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddQuoteModal from "@/components/AddQuoteModal";
import QuoteCard from "@/components/QuoteCard";
import type { Book } from "@/lib/books";

type BookDetailClientProps = {
  book: Book;
};

export default function BookDetailClient({ book }: BookDetailClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSuccess() {
    router.refresh();
  }

  return (
    <>
      <div className="space-y-10">
        {book.quotes.length === 0 ? (
          <div className="rounded-3xl border border-[#C4873A]/18 bg-[#241913] px-6 py-12 text-center">
            <p className="text-lg italic text-[#E8D5B7]/82">
              Henüz alıntı eklenmedi.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {book.quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} bookSlug={book.slug} />
            ))}
          </div>
        )}

        <div className="border-t border-[#E8D5B7]/10 pt-8">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-[#C4873A] px-5 py-3 text-sm font-medium text-[#1C1410] transition hover:bg-[#d79a4a]"
          >
            Alıntı Ekle
          </button>
        </div>
      </div>

      <AddQuoteModal
        bookSlug={book.slug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
