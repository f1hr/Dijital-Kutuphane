import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import type { BooksData } from "@/lib/books";

export async function GET() {
  return handler();
}

export async function POST() {
  return handler();
}

async function handler() {
  const filePath = path.join(process.cwd(), "data", "books.json");
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as BooksData;

  for (const book of data.books) {
    const { data: existing } = await getSupabase()
      .from("books")
      .select("id")
      .eq("slug", book.slug)
      .single();

    let bookId: number;

    if (existing) {
      bookId = existing.id;
    } else {
      const { data: inserted, error } = await getSupabase()
        .from("books")
        .insert({
          slug: book.slug,
          title: book.title,
          author: book.author,
          cover_color: book.coverColor,
          read_date: book.readDate,
        })
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      bookId = inserted.id;
    }

    for (const quote of book.quotes) {
      const { data: existingQ } = await getSupabase()
        .from("quotes")
        .select("id")
        .eq("book_id", bookId)
        .eq("text", quote.text)
        .single();

      if (!existingQ) {
        await getSupabase().from("quotes").insert({
          book_id: bookId,
          page: quote.page ?? null,
          chapter: quote.chapter ?? null,
          text: quote.text,
          analysis: quote.analysis,
          tags: quote.tags,
        });
      }
    }
  }

  return NextResponse.json({ success: true, bookCount: data.books.length });
}
