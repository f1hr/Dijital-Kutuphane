import type { Metadata } from "next";
import { DM_Mono, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kütüphanem",
  description: "Karar vermek ve geri dönmek için tuttuğun kişisel kitap kütüphanesi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-[#1C1410]">
      <body
        className={`${playfair.variable} ${lora.variable} ${dmMono.variable} min-h-screen bg-[#1C1410] text-[#E8D5B7] antialiased`}
        style={{
          fontFamily: "var(--font-lora)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
