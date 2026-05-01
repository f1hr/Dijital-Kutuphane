import { NextResponse } from "next/server";
import { addBook, slugify, getBookBySlug } from "@/lib/books";

export async function POST(request: Request) {
  try {
    const { title, author } = (await request.json()) as {
      title?: string;
      author?: string;
    };

    if (!title?.trim() || !author?.trim()) {
      return NextResponse.json(
        { error: "Başlık ve yazar zorunlu." },
        { status: 400 }
      );
    }

    let slug = slugify(title.trim());

    const existing = await getBookBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const book = await addBook({
      title: title.trim(),
      author: author.trim(),
      slug,
    });

    return NextResponse.json({ slug: book.slug });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
