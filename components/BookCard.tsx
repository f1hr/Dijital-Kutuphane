import Link from "next/link";
import type { Book } from "@/lib/books";

type BookCardProps = {
  book: Book;
  href?: string;
};

function BookCardContent({ book }: { book: Book }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#C4873A]/20 bg-[#1C1410] p-5 text-[#E8D5B7] transition duration-300 hover:-translate-y-1 hover:border-[#C4873A]/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div
        className="mb-5 h-56 rounded-xl border border-[#E8D5B7]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{
          background: `linear-gradient(160deg, ${book.coverColor} 0%, #1C1410 100%)`,
        }}
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4873A]">
            {book.author}
          </p>
          <h3 className="text-2xl leading-tight text-[#E8D5B7]">
            {book.title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#E8D5B7]/10 pt-3 text-sm text-[#E8D5B7]/72">
          <span>{book.readDate}</span>
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#C4873A]">
            {book.quotes.length} alıntı
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BookCard({ book, href }: BookCardProps) {
  if (!href) {
    return <BookCardContent book={book} />;
  }

  return (
    <Link
      href={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4873A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1C1410]"
    >
      <BookCardContent book={book} />
    </Link>
  );
}
