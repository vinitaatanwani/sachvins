import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Clarity Method",
    short_name: "Clarity",
    description: "Guided healing and nervous-system regulation — journaling, meditation, and sound.",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#fff8ed",
    theme_color: "#087f71",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
