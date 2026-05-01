import Link from "next/link";
import LibrarySearch from "@/components/LibrarySearch";
import { getBooks } from "@/lib/books";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const books = await getBooks();

  return (
    <main className="min-h-screen bg-[#1C1410] text-[#E8D5B7]">
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="mb-10 space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#C4873A]">
            Kişisel Karar Kütüphanesi
          </p>
          <div className="max-w-3xl space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-5xl leading-none tracking-tight text-[#E8D5B7] md:text-7xl">
                Kütüphanem
              </h1>
              <Link
                href="/ekle"
                className="shrink-0 mt-2 px-4 py-2 border border-[#C4873A]/40 text-[#C4873A] font-mono text-xs uppercase tracking-widest rounded hover:bg-[#C4873A]/10 transition"
              >
                + Ekle
              </Link>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#E8D5B7]/76 md:text-lg">
              Karar vermek, netleşmek ve hareket etmek için geri döndüğün
              kitaplar burada.
            </p>
          </div>
        </div>

        <LibrarySearch books={books} />
      </section>
    </main>
  );
}
