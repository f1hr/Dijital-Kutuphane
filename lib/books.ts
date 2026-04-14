import { kv } from "@vercel/kv";

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

const KV_KEY = "books";

export async function readBooksFile(): Promise<BooksData> {
  const data = await kv.get<BooksData>(KV_KEY);
  if (!data) return { books: [] };
  return data;
}

export async function writeBooksFile(data: BooksData): Promise<void> {
  await kv.set(KV_KEY, data);
}

export async function getBooks(): Promise<Book[]> {
  const data = await readBooksFile();
  return data.books;
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((book) => book.slug === slug);
}

export async function addQuote(
  bookSlug: string,
  quote: Omit<BookQuote, "id">
): Promise<BookQuote> {
  const data = await readBooksFile();
  const book = data.books.find((b) => b.slug === bookSlug);
  if (!book) throw new Error(`Kitap bulunamadı: ${bookSlug}`);

  const newQuote: BookQuote = {
    id: Date.now().toString(),
    ...quote,
  };

  book.quotes.push(newQuote);
  await writeBooksFile(data);
  return newQuote;
}

export async function deleteQuote(
  bookSlug: string,
  quoteId: string
): Promise<void> {
  const data = await readBooksFile();
  const book = data.books.find((b) => b.slug === bookSlug);
  if (!book) throw new Error(`Kitap bulunamadı: ${bookSlug}`);

  const index = book.quotes.findIndex((q) => q.id === quoteId);
  if (index === -1) throw new Error(`Alıntı bulunamadı: ${quoteId}`);

  book.quotes.splice(index, 1);
  await writeBooksFile(data);
}
