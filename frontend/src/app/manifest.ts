import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TraumaSense India — Multilingual Crisis Triage",
    short_name: "TraumaSense",
    description:
      "Trauma-informed multilingual crisis reporting, acoustic distress triage, and clinical decision support platform across 7 Indian regional languages.",
    start_url: "/portal",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0D9488",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
