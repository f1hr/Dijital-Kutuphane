import { getSupabase } from "@/lib/supabase";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function currentReadDate(): string {
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

export type BookQuote = {
  id: string;
  page?: number;
  chapter?: string;
  text: string;
  analysis: string;
  tags: string[];
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverColor: string;
  readDate: string;
  quotes: BookQuote[];
};

export type BooksData = {
  books: Book[];
};

export async function getBooks(): Promise<Book[]> {
  const { data: books, error } = await getSupabase()
    .from("books")
    .select("*, quotes(*)")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (books ?? []).map(mapBook);
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const { data, error } = await getSupabase()
    .from("books")
    .select("*, quotes(*)")
    .eq("slug", slug)
    .single();

  if (error) return undefined;
  return mapBook(data);
}

export async function addQuote(
  bookSlug: string,
  quote: Omit<BookQuote, "id">
): Promise<BookQuote> {
  const { data: book, error: bookErr } = await getSupabase()
    .from("books")
    .select("id")
    .eq("slug", bookSlug)
    .single();

  if (bookErr || !book) throw new Error(`Kitap bulunamadı: ${bookSlug}`);

  const { data, error } = await getSupabase()
    .from("quotes")
    .insert({
      book_id: book.id,
      page: quote.page ?? null,
      chapter: quote.chapter ?? null,
      text: quote.text,
      analysis: quote.analysis,
      tags: quote.tags,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: String(data.id),
    page: data.page ?? undefined,
    chapter: data.chapter ?? undefined,
    text: data.text,
    analysis: data.analysis,
    tags: data.tags ?? [],
  };
}

export async function addBook(book: {
  title: string;
  author: string;
  slug: string;
  coverColor?: string;
  readDate?: string;
}): Promise<Book> {
  const { data, error } = await getSupabase()
    .from("books")
    .insert({
      title: book.title,
      author: book.author,
      slug: book.slug,
      cover_color: book.coverColor ?? "#2C1810",
      read_date: book.readDate ?? currentReadDate(),
    })
    .select("*, quotes(*)")
    .single();

  if (error) throw new Error(error.message);
  return mapBook(data);
}

export async function deleteQuote(
  bookSlug: string,
  quoteId: string
): Promise<void> {
  const { data: book, error: bookErr } = await getSupabase()
    .from("books")
    .select("id")
    .eq("slug", bookSlug)
    .single();

  if (bookErr || !book) throw new Error(`Kitap bulunamadı: ${bookSlug}`);

  const { error } = await getSupabase()
    .from("quotes")
    .delete()
    .eq("id", quoteId)
    .eq("book_id", book.id);

  if (error) throw new Error(error.message);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    author: row.author,
    coverColor: row.cover_color,
    readDate: row.read_date,
    quotes: (row.quotes ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any): BookQuote => ({
        id: String(q.id),
        page: q.page ?? undefined,
        chapter: q.chapter ?? undefined,
        text: q.text,
        analysis: q.analysis,
        tags: q.tags ?? [],
      })
    ),
  };
}
