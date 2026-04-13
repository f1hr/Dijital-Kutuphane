"use client";

import { useEffect, useState } from "react";

type AddQuoteModalProps = {
  bookSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormState = {
  page: string;
  chapter: string;
  text: string;
  analysis: string;
  tags: string;
};

const initialFormState: FormState = {
  page: "",
  chapter: "",
  text: "",
  analysis: "",
  tags: "",
};

export default function AddQuoteModal({
  bookSlug,
  isOpen,
  onClose,
  onSuccess,
}: AddQuoteModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialFormState);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) {
    return null;
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const payload = {
      bookSlug,
      page: form.page ? Number(form.page) : undefined,
      chapter: form.chapter.trim() || undefined,
      text: form.text.trim(),
      analysis: form.analysis.trim(),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    };

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(data?.error || "Alıntı kaydedilemedi.");
      }

      setForm(initialFormState);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-[#C4873A]/25 bg-[#1C1410] p-6 text-[#E8D5B7] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#C4873A]">
              Yeni Alıntı
            </p>
            <h2 className="text-3xl italic leading-tight text-[#E8D5B7]">
              Kitaptan yeni bir karar parçası ekle
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full border border-[#E8D5B7]/15 px-3 py-1 text-sm text-[#E8D5B7]/70 transition hover:border-[#C4873A]/40 hover:text-[#E8D5B7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kapat
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-sm text-[#E8D5B7]/72">Sayfa No</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={form.page}
                onChange={(event) => updateField("page", event.target.value)}
                className="w-full rounded-2xl border border-[#E8D5B7]/12 bg-[#241913] px-4 py-3 text-[#E8D5B7] outline-none transition placeholder:text-[#E8D5B7]/30 focus:border-[#C4873A]"
                placeholder="Örn. 47"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[#E8D5B7]/72">Bölüm Adı</span>
              <input
                type="text"
                value={form.chapter}
                onChange={(event) => updateField("chapter", event.target.value)}
                className="w-full rounded-2xl border border-[#E8D5B7]/12 bg-[#241913] px-4 py-3 text-[#E8D5B7] outline-none transition placeholder:text-[#E8D5B7]/30 focus:border-[#C4873A]"
                placeholder="Örn. 1. Bölüm"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-[#E8D5B7]/72">Alıntı Metni</span>
            <textarea
              required
              rows={5}
              value={form.text}
              onChange={(event) => updateField("text", event.target.value)}
              className="w-full rounded-2xl border border-[#E8D5B7]/12 bg-[#241913] px-4 py-3 text-[#E8D5B7] outline-none transition placeholder:text-[#E8D5B7]/30 focus:border-[#C4873A]"
              placeholder="Orijinal alıntıyı yaz"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-[#E8D5B7]/72">Analiz</span>
            <textarea
              required
              rows={4}
              value={form.analysis}
              onChange={(event) => updateField("analysis", event.target.value)}
              className="w-full rounded-2xl border border-[#E8D5B7]/12 bg-[#241913] px-4 py-3 text-[#E8D5B7] outline-none transition placeholder:text-[#E8D5B7]/30 focus:border-[#C4873A]"
              placeholder="Bu alıntının pratik anlamını yaz"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-[#E8D5B7]/72">
              Tag&apos;ler
            </span>
            <input
              type="text"
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              className="w-full rounded-2xl border border-[#E8D5B7]/12 bg-[#241913] px-4 py-3 text-[#E8D5B7] outline-none transition placeholder:text-[#E8D5B7]/30 focus:border-[#C4873A]"
              placeholder="strateji, disiplin, odak"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-2xl border border-[#E8D5B7]/15 px-5 py-3 text-sm text-[#E8D5B7]/72 transition hover:border-[#E8D5B7]/30 hover:text-[#E8D5B7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[#C4873A] px-5 py-3 text-sm font-medium text-[#1C1410] transition hover:bg-[#d79a4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
