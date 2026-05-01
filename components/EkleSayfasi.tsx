"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Book } from "@/lib/books";

type DraftQuote = {
  text: string;
  analysis: string;
  tags: string[];
  approved: boolean;
};

type BookMode = "existing" | "new";
type PageState = "idle" | "loading" | "review";

export default function EkleSayfasi({ books }: { books: Book[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<PageState>("idle");
  const [bookMode, setBookMode] = useState<BookMode>(
    books.length > 0 ? "existing" : "new"
  );
  const [selectedSlug, setSelectedSlug] = useState(books[0]?.slug ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [quotes, setQuotes] = useState<DraftQuote[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setError("Sadece PDF dosyaları desteklenir.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFileChange(f);
    },
    [handleFileChange]
  );

  async function handleAnalyze() {
    if (!file) { setError("PDF seçin."); return; }
    if (bookMode === "existing" && !selectedSlug) { setError("Kitap seçin."); return; }
    if (bookMode === "new" && !newTitle.trim()) { setError("Kitap başlığı zorunlu."); return; }
    if (bookMode === "new" && !newAuthor.trim()) { setError("Yazar adı zorunlu."); return; }

    setState("loading");
    setError("");

    const selectedBook = books.find((b) => b.slug === selectedSlug);
    const bookTitle = bookMode === "existing" ? (selectedBook?.title ?? "") : newTitle.trim();
    const bookAuthor = bookMode === "existing" ? (selectedBook?.author ?? "") : newAuthor.trim();

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("bookTitle", bookTitle);
    formData.append("bookAuthor", bookAuthor);

    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");

      setQuotes(
        data.quotes.map((q: Omit<DraftQuote, "approved">) => ({ ...q, approved: true }))
      );
      setState("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
      setState("idle");
    }
  }

  async function handleSave() {
    const approved = quotes.filter((q) => q.approved);
    if (!approved.length) { setError("En az bir alıntı seçin."); return; }

    setSaving(true);
    setError("");

    try {
      let bookSlug = selectedSlug;

      if (bookMode === "new") {
        const res = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle.trim(), author: newAuthor.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Kitap oluşturulamadı.");
        bookSlug = data.slug;
      }

      await Promise.all(
        approved.map((q) =>
          fetch("/api/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookSlug,
              text: q.text,
              analysis: q.analysis,
              tags: q.tags,
            }),
          })
        )
      );

      router.push(`/${bookSlug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      setSaving(false);
    }
  }

  function updateQuote(i: number, patch: Partial<DraftQuote>) {
    setQuotes((prev) => prev.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  }

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-[#1C1410] text-[#E8D5B7] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-10 h-10 border-2 border-[#C4873A] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-[#E8D5B7]">Sayfalar arasında dolaşıyor...</p>
            <p className="font-mono text-xs text-[#E8D5B7]/40 uppercase tracking-widest">
              Gemini okuyor · birkaç dakika sürebilir
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state === "review") {
    const approvedCount = quotes.filter((q) => q.approved).length;

    return (
      <main className="min-h-screen bg-[#1C1410] text-[#E8D5B7]">
        <section className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16 pb-32">
          <div className="mb-10 space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#C4873A]">
              Alıntı İnceleme
            </p>
            <h1 className="text-4xl leading-tight text-[#E8D5B7]">
              {quotes.length} alıntı bulundu
            </h1>
            <p className="text-sm text-[#E8D5B7]/60">
              İstediğin alıntıları seç, düzenle ve kütüphaneye ekle.
              Analysis veya etiketlere tıklayarak düzenleyebilirsin.
            </p>
          </div>

          <div className="space-y-4">
            {quotes.map((q, i) => (
              <QuoteCard key={i} quote={q} onUpdate={(patch) => updateQuote(i, patch)} />
            ))}
          </div>

          {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
        </section>

        <div className="fixed bottom-0 left-0 right-0 bg-[#1C1410]/95 border-t border-[#E8D5B7]/10 backdrop-blur px-6 py-4">
          <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
            <p className="text-sm text-[#E8D5B7]/60">
              <span className="text-[#E8D5B7] font-medium">{approvedCount}</span> alıntı seçildi
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setState("idle")}
                className="px-4 py-2 text-sm text-[#E8D5B7]/50 hover:text-[#E8D5B7] transition"
              >
                Geri
              </button>
              <button
                onClick={handleSave}
                disabled={saving || approvedCount === 0}
                className="px-6 py-2 bg-[#C4873A] text-[#1C1410] text-sm font-medium rounded hover:bg-[#D4975A] disabled:opacity-40 transition"
              >
                {saving ? "Ekleniyor..." : "Kütüphaneye Ekle"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1C1410] text-[#E8D5B7]">
      <section className="mx-auto max-w-2xl px-6 py-12 md:px-10 md:py-16">
        <div className="mb-10 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[#C4873A] transition hover:text-[#E8D5B7]"
          >
            ← Geri
          </Link>
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#C4873A]">
              Alıntı Ekle
            </p>
            <h1 className="text-5xl leading-none tracking-tight text-[#E8D5B7]">
              PDF&apos;ten Yükle
            </h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              {(["existing", "new"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBookMode(mode)}
                  className={`px-4 py-2 text-sm rounded border transition ${
                    bookMode === mode
                      ? "border-[#C4873A] text-[#C4873A]"
                      : "border-[#E8D5B7]/15 text-[#E8D5B7]/40 hover:border-[#E8D5B7]/30 hover:text-[#E8D5B7]/60"
                  }`}
                >
                  {mode === "existing" ? "Mevcut Kitap" : "Yeni Kitap"}
                </button>
              ))}
            </div>

            {bookMode === "existing" ? (
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full bg-[#2A1E14] border border-[#E8D5B7]/15 rounded px-4 py-3 text-[#E8D5B7] text-sm focus:outline-none focus:border-[#C4873A] transition"
              >
                {books.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Kitap başlığı"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#2A1E14] border border-[#E8D5B7]/15 rounded px-4 py-3 text-[#E8D5B7] text-sm placeholder-[#E8D5B7]/25 focus:outline-none focus:border-[#C4873A] transition"
                />
                <input
                  type="text"
                  placeholder="Yazar"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-[#2A1E14] border border-[#E8D5B7]/15 rounded px-4 py-3 text-[#E8D5B7] text-sm placeholder-[#E8D5B7]/25 focus:outline-none focus:border-[#C4873A] transition"
                />
              </div>
            )}
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#E8D5B7]/15 rounded-xl p-14 text-center cursor-pointer hover:border-[#C4873A]/40 transition"
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
            {file ? (
              <div className="space-y-2">
                <p className="text-[#C4873A] text-sm">{file.name}</p>
                <p className="text-[#E8D5B7]/35 text-xs font-mono">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[#E8D5B7]/50 text-sm">
                  PDF&apos;i buraya sürükle ya da tıkla
                </p>
                <p className="text-[#E8D5B7]/25 text-xs font-mono uppercase tracking-widest">
                  PDF · max 50MB
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={!file}
            className="w-full py-3 bg-[#C4873A] text-[#1C1410] text-sm font-medium rounded hover:bg-[#D4975A] disabled:opacity-40 transition"
          >
            Analiz Et
          </button>
        </div>
      </section>
    </main>
  );
}

function QuoteCard({
  quote,
  onUpdate,
}: {
  quote: DraftQuote;
  onUpdate: (patch: Partial<DraftQuote>) => void;
}) {
  const [editingAnalysis, setEditingAnalysis] = useState(false);
  const [editingTags, setEditingTags] = useState(false);

  return (
    <div
      className={`rounded-xl border p-6 space-y-4 transition-all ${
        quote.approved
          ? "border-[#E8D5B7]/12 bg-[#231912]"
          : "border-[#E8D5B7]/5 bg-[#1C1410] opacity-35"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[#E8D5B7] leading-relaxed italic flex-1 text-base">
          &ldquo;{quote.text}&rdquo;
        </p>
        <button
          onClick={() => onUpdate({ approved: !quote.approved })}
          className={`shrink-0 w-7 h-7 rounded-full border text-xs flex items-center justify-center transition ${
            quote.approved
              ? "border-[#C4873A] text-[#C4873A] bg-[#C4873A]/10"
              : "border-[#E8D5B7]/20 text-[#E8D5B7]/30"
          }`}
        >
          {quote.approved ? "✓" : "✗"}
        </button>
      </div>

      {editingAnalysis ? (
        <textarea
          autoFocus
          defaultValue={quote.analysis}
          onBlur={(e) => {
            onUpdate({ analysis: e.target.value.trim() });
            setEditingAnalysis(false);
          }}
          className="w-full bg-[#1C1410] border border-[#C4873A]/25 rounded px-3 py-2 text-sm text-[#E8D5B7]/80 resize-none focus:outline-none"
          rows={3}
        />
      ) : (
        <p
          onClick={() => quote.approved && setEditingAnalysis(true)}
          className={`text-sm text-[#E8D5B7]/60 leading-relaxed ${
            quote.approved ? "cursor-text hover:text-[#E8D5B7]/80 transition" : ""
          }`}
        >
          {quote.analysis}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {editingTags ? (
          <input
            autoFocus
            defaultValue={quote.tags.join(", ")}
            onBlur={(e) => {
              const tags = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              onUpdate({ tags });
              setEditingTags(false);
            }}
            placeholder="virgülle ayır: strateji, odak"
            className="bg-[#1C1410] border border-[#C4873A]/25 rounded px-3 py-1 text-xs text-[#E8D5B7] focus:outline-none w-64"
          />
        ) : (
          quote.tags.map((tag, i) => (
            <span
              key={i}
              onClick={() => quote.approved && setEditingTags(true)}
              className={`font-mono text-xs uppercase tracking-[0.2em] text-[#C4873A]/60 ${
                quote.approved ? "cursor-pointer hover:text-[#C4873A] transition" : ""
              }`}
            >
              {tag}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
