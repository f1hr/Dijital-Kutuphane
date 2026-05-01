import EkleSayfasi from "@/components/EkleSayfasi";
import { getBooks } from "@/lib/books";

export const dynamic = "force-dynamic";

export default async function EklePage() {
  const books = await getBooks();
  return <EkleSayfasi books={books} />;
}
