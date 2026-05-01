import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kütüphanem",
    short_name: "Kütüphane",
    description: "Karar vermek ve geri dönmek için kişisel kitap kütüphanesi.",
    start_url: "/",
    display: "standalone",
    background_color: "#1C1410",
    theme_color: "#1C1410",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
