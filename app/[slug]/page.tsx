import Link from "next/link";
import { notFound } from "next/navigation";
import BookDetailClient from "@/components/BookDetailClient";
import { getBookBySlug } from "@/lib/books";

type BookPageProps = {
  params: {
    slug: string;
  };
};

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBookBySlug(params.slug);

  if (!book) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#1C1410] text-[#E8D5B7]">
      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
        <div className="mb-10 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[#C4873A] transition hover:text-[#E8D5B7]"
          >
            ← Geri
          </Link>

          <div className="space-y-3 border-b border-[#E8D5B7]/10 pb-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#C4873A]">
              {book.author}
            </p>
            <h1 className="text-4xl leading-tight text-[#E8D5B7] md:text-6xl">
              {book.title}
            </h1>
            <p className="text-sm text-[#E8D5B7]/62">{book.readDate}</p>
          </div>
        </div>

        <BookDetailClient book={book} />
      </section>
    </main>
  );
}
