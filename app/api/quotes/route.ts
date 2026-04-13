import { NextResponse } from "next/server";
import { addQuote } from "@/lib/books";

type CreateQuoteBody = {
  bookSlug?: string;
  page?: number;
  chapter?: string;
  text?: string;
  analysis?: string;
  tags?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateQuoteBody;

    const bookSlug = body.bookSlug?.trim();
    const text = body.text?.trim();
    const analysis = body.analysis?.trim();
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : [];

    if (!bookSlug || !text || !analysis) {
      return NextResponse.json(
        { error: "bookSlug, text ve analysis zorunlu." },
        { status: 400 }
      );
    }

    const page =
      typeof body.page === "number" && Number.isFinite(body.page)
        ? body.page
        : undefined;

    const chapter = body.chapter?.trim();

    await addQuote(bookSlug, {
      page,
      chapter,
      text,
      analysis,
      tags,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Geçersiz JSON body." },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      const status = error.message.includes("Kitap bulunamad") ? 400 : 500;

      return NextResponse.json(
        { error: error.message || "Bir hata oluştu." },
        { status }
      );
    }

    return NextResponse.json(
      { error: "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
