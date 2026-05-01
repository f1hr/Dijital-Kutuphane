import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export const maxDuration = 300;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

type Quote = { text: string; analysis: string; tags: string[] };

const MELIH_PROFILE = `## Okuyucu: Melih
Hatay'da yaşayan 20'li yaşlarında bir girişimci. Çok boyutlu:
- Büyük hedef: 40 yaşında 100M$ servet. Şirket üret→geliştir→sat→tekrar başla.
- İslam inancı güçlü. Manevi boyut hayatının parçası.
- Türkçeye derin bağlılık. Kelime dağarcığını kutsal sayıyor.
- "Zamanın şartlarına uymak" birincil ilkesi. Geçmişe değil geleceğe bakar.
- Sadece girişimci değil: dil, kültür, anlam, insan doğası da önemli.

## Kural
ZORLAMA YAPMA. Kitabın doğal çerçevesini koru.
- Roman → insan doğası, psikoloji, dil açısından ele al
- İş/strateji kitabı → pratik, hedefleriyle ilişkilendir
- Her alıntı için sor: "Melih bunu okuyunca gerçekten ne hisseder?"`;

function textPrompt(bookTitle: string, bookAuthor: string, sectionLabel: string, text: string): string {
  return `"${bookTitle}"${bookAuthor ? ` (${bookAuthor})` : ""} kitabının ${sectionLabel} bölümünden alıntılar çıkar.

${MELIH_PROFILE}

SADECE aşağıdaki metinden 3-4 alıntı seç:

${text}

JSON döndür:
{"quotes": [{"text": "orijinal metin", "analysis": "2-4 cümle somut analiz", "tags": ["kelime"]}]}
tags: 1-3 kelime, küçük harf, Türkçe`;
}

function filesAPIPrompt(bookTitle: string, bookAuthor: string, section: string): string {
  return `"${bookTitle}"${bookAuthor ? ` (${bookAuthor})` : ""} kitabından alıntılar çıkar.

${MELIH_PROFILE}

ÖNEMLİ: ${section}

JSON döndür:
{"quotes": [{"text": "orijinal metin", "analysis": "2-4 cümle somut analiz", "tags": ["kelime"]}]}
tags: 1-3 kelime, küçük harf, Türkçe`;
}

async function parseJSON(text: string): Promise<Quote[]> {
  try {
    const parsed = JSON.parse(text) as { quotes: Quote[] };
    return Array.isArray(parsed.quotes) ? parsed.quotes : [];
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return [];
    try {
      const parsed = JSON.parse(match[0]) as { quotes: Quote[] };
      return Array.isArray(parsed.quotes) ? parsed.quotes : [];
    } catch {
      return [];
    }
  }
}

async function extractWithText(buffer: Buffer, bookTitle: string, bookAuthor: string): Promise<Quote[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }> = require("pdf-parse");
  const parsed = await pdfParse(buffer);

  if (parsed.text.trim().length < 500) {
    throw new Error("Yetersiz metin");
  }

  const t = parsed.text.length;
  const p = parsed.numpages;

  const sections = [
    { text: parsed.text.slice(0, Math.floor(t / 3)), label: `başı (1–${Math.floor(p / 3)}. sayfa)` },
    { text: parsed.text.slice(Math.floor(t / 3), Math.floor((2 * t) / 3)), label: `ortası (${Math.floor(p / 3) + 1}–${Math.floor((2 * p) / 3)}. sayfa)` },
    { text: parsed.text.slice(Math.floor((2 * t) / 3)), label: `sonu (${Math.floor((2 * p) / 3) + 1}–${p}. sayfa)` },
  ];

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });

  const results = await Promise.all(
    sections.map(async (s) => {
      const result = await model.generateContent(textPrompt(bookTitle, bookAuthor, s.label, s.text));
      return parseJSON(result.response.text());
    })
  );

  return results.flat();
}

async function extractWithFilesAPI(buffer: Buffer, bookTitle: string, bookAuthor: string): Promise<Quote[]> {
  const tmpPath = join(tmpdir(), `pdf-${Date.now()}.pdf`);
  await writeFile(tmpPath, buffer);

  try {
    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: "application/pdf",
      displayName: `${bookTitle}.pdf`,
    });

    let fileData = uploadResult.file;
    while (fileData.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 2000));
      fileData = await fileManager.getFile(fileData.name);
    }

    if (fileData.state === "FAILED") throw new Error("PDF işlenemedi.");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    });

    const sectionInstructions = [
      "SADECE kitabın ilk üçte birinden (başından) 3-4 alıntı seç. Orta ve son kısımları atlıyorsun.",
      "SADECE kitabın orta üçte birinden 3-4 alıntı seç. Baş ve son kısımları atlıyorsun.",
      "SADECE kitabın son üçte birinden (sonundan) 3-4 alıntı seç. Baş ve orta kısımları atlıyorsun.",
    ];

    const results = await Promise.all(
      sectionInstructions.map(async (instruction) => {
        const result = await model.generateContent([
          { fileData: { mimeType: "application/pdf", fileUri: fileData.uri } },
          filesAPIPrompt(bookTitle, bookAuthor, instruction),
        ]);
        return parseJSON(result.response.text());
      })
    );

    return results.flat();
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdf = formData.get("pdf") as File | null;
    const bookTitle = (formData.get("bookTitle") as string)?.trim();
    const bookAuthor = (formData.get("bookAuthor") as string)?.trim() ?? "";

    if (!pdf || !bookTitle) {
      return NextResponse.json({ error: "PDF ve kitap başlığı zorunlu." }, { status: 400 });
    }

    const isPdf = pdf.type === "application/pdf" ||
      pdf.type === "application/octet-stream" ||
      pdf.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Sadece PDF dosyaları desteklenir." }, { status: 400 });
    }

    const buffer = Buffer.from(await pdf.arrayBuffer());

    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF çok büyük. Maksimum 50MB." }, { status: 400 });
    }

    let quotes: Quote[] = [];
    let lastError = "";

    try {
      quotes = await extractWithText(buffer, bookTitle, bookAuthor);
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Metin çıkarılamadı";
      try {
        quotes = await extractWithFilesAPI(buffer, bookTitle, bookAuthor);
      } catch (e2) {
        lastError = e2 instanceof Error ? e2.message : "PDF işlenemedi";
      }
    }

    if (quotes.length === 0) {
      const msg = lastError && lastError !== "Yetersiz metin"
        ? lastError
        : "Alıntı çıkarılamadı. PDF metin tabanlı değilse veya çok küçükse bu hata çıkabilir.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ quotes });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
