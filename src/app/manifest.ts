import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Clarity Method",
    short_name: "Clarity",
    description: "Guided healing and nervous-system regulation — journaling, meditation, and sound.",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#00a855",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
