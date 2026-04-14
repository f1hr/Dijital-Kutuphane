import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { kv } from "@vercel/kv";
import type { BooksData } from "@/lib/books";

export async function POST() {
  const filePath = path.join(process.cwd(), "data", "books.json");
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as BooksData;
  await kv.set("books", data);
  return NextResponse.json({ success: true, bookCount: data.books.length });
}
