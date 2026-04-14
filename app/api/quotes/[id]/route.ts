import { NextResponse } from "next/server";
import { deleteQuote } from "@/lib/books";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const bookSlug = searchParams.get("bookSlug");

    if (!bookSlug) {
      return NextResponse.json(
        { error: "bookSlug parametresi zorunlu." },
        { status: 400 }
      );
    }

    await deleteQuote(bookSlug, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Bir hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

