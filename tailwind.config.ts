import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── SachVins / Healing Hands by Vinita — soothing palette ──
        // Legacy alias names (ink/cream/gold/indigo/sky/…) are kept and remapped
        // to the new palette so every existing screen reskins without touching
        // call sites. Deep Teal leads; coral/orange/gold/magenta are accents.
        ink: "#282a22", // warm charcoal-green
        "ink-light": "#4c5142",
        "ink-muted": "#83887a",
        "warm-white": "#fdfbf2", // page canvas — soft cream
        cream: "#f5f2e4", // warm sunken tint
        parchment: "#e6e3d2", // hairline borders / tracks
        gold: "#c39a20", // deep golden (legible on cream)
        "gold-light": "#eccb4a", // Golden Yellow (pop)
        sage: "#82abac", // soft blue-grey neutral
        indigo: {
          DEFAULT: "#2f7d43", // brand primary — Forest Green (pop)
          dark: "#276a39",
        },
        sunshine: {
          DEFAULT: "#eccb4a", // Golden Yellow (pop)
          light: "#fdf3c2",
          dark: "#c39a20",
        },
        sky: {
          DEFAULT: "#3c6467", // depth — deep blue-grey
          light: "#eef4f4",
        },

        // ── Full palette scales ──
        // green = forest→leaf (primary pop), amber = golden yellows (accent pop),
        // berry/plum = soft blue-grey (calm neutral / depth).
        green: {
          50: "#edf6ea", 100: "#d2e8c5", 200: "#aed897", 300: "#8cc264",
          400: "#57a747", 500: "#2f7d43", 600: "#276a39", 700: "#1f532d",
          800: "#173f22", 900: "#102a17",
        },
        amber: {
          50: "#fdf7e1", 100: "#faedb4", 200: "#f4dd80", 300: "#eccb4a",
          400: "#e0b62f", 500: "#c39a20", 600: "#9b7a16", 700: "#775e10",
        },
        berry: {
          50: "#eef4f4", 100: "#d6e5e5", 200: "#a8c6c7", 300: "#82abac",
          400: "#5e8e90", 500: "#467073", 600: "#38585b", 700: "#2a4345",
        },
        plum: {
          50: "#eef4f4", 100: "#d3e2e2", 200: "#a8c6c7", 300: "#7ba6a7",
          400: "#547e80", 500: "#3c6467", 600: "#2f5052", 700: "#233d3f",
        },
        sand: { 200: "#e6e3d2", 300: "#d6d2bd", 400: "#bcb89e" },
        stone: { 500: "#9a9683", 600: "#83887a" },
        gold_tip: "#eccb4a",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
        accent: ["var(--font-nunito)", "var(--font-mulish)", "sans-serif"],
      },
      backgroundImage: {
        petal: "linear-gradient(135deg, #2f7d43 0%, #57a747 42%, #e0b62f 78%, #eccb4a 100%)",
        "petal-soft": "linear-gradient(135deg, #2f7d43, #57a747 52%, #e0b62f 95%)",
      },
      boxShadow: {
        clay: "inset 0 2px 3px rgba(255,255,255,.45), inset 0 -5px 11px rgba(0,0,0,.14), 0 9px 20px rgba(0,0,0,.10)",
        "clay-teal": "0 9px 20px rgba(47,125,67,.28), inset 0 2px 3px rgba(255,255,255,.4), inset 0 -5px 11px rgba(25,70,38,.32)",
        glass: "0 10px 30px rgba(40,60,40,.08)",
        soft: "0 12px 30px rgba(40,60,40,.08)",
        lift: "0 22px 44px rgba(40,60,40,.14)",
      },
    },
  },
  plugins: [],
};

export default config;
