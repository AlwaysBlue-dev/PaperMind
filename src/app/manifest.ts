import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaperMind",
    short_name: "PaperMind",
    description:
      "AI-powered exam question prediction for Pakistani students.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#4F46E5",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
