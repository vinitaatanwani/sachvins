import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── SachVins / Healing Hands by Vinita — soft lavender palette ──
        // Legacy alias names (ink/cream/gold/indigo/sky/…) are kept and remapped
        // so every existing screen reskins without touching call sites. Lavender
        // leads; pink, mint and peach are the playful accents.
        ink: "#403a5e", // dark purple-grey
        "ink-light": "#5b5578",
        "ink-muted": "#8b86a6",
        "warm-white": "#fbf9ff", // page canvas — soft lilac white
        cream: "#f3eefb", // lilac sunken tint
        parchment: "#e6ddf4", // hairline borders / tracks
        gold: "#d96a95", // rose accent (legible on lilac)
        "gold-light": "#f2a1c0", // soft pink
        sage: "#5bb894", // mint accent
        indigo: {
          DEFAULT: "#dd5b8f", // brand primary — rose pink (button-safe, from palette)
          dark: "#c23f74",
        },
        sunshine: {
          DEFAULT: "#f2a1c0", // soft pink (accent pop)
          light: "#fde3ee",
          dark: "#e07ba0",
        },
        sky: {
          DEFAULT: "#6d5cc0", // depth — deep lavender
          light: "#f2effc",
        },

        // ── Full palette scales ──
        // green = lavender/purple (primary), amber = pink/rose (warm accent),
        // berry = mint, plum/sky = deep lavender (depth).
        green: {
          50: "#f3f0fc", 100: "#e4ddfa", 200: "#cbbdf2", 300: "#ae9ae7",
          400: "#9a86de", 500: "#8171d4", 600: "#6d5cc0", 700: "#56479c",
          800: "#3f3372", 900: "#29224d",
        },
        amber: {
          50: "#fdeef4", 100: "#fbd6e4", 200: "#f6b4cd", 300: "#f2a1c0",
          400: "#ec84a9", 500: "#e07ba0", 600: "#c85f86", 700: "#a24868",
        },
        berry: {
          50: "#eaf7f1", 100: "#c9ecdd", 200: "#a9dcc7", 300: "#86cbb0",
          400: "#5bb894", 500: "#46a37f", 600: "#398468", 700: "#2c664f",
        },
        plum: {
          50: "#f2effc", 100: "#e0d8f6", 200: "#c4b6ec", 300: "#a88fe0",
          400: "#8467c9", 500: "#6d5cc0", 600: "#58489e", 700: "#423573",
        },
        sand: { 200: "#e6ddf4", 300: "#d6c9ec", 400: "#bcabdd" },
        stone: { 500: "#9d97b8", 600: "#8b86a6" },
        gold_tip: "#f8d489",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
        accent: ["var(--font-nunito)", "var(--font-mulish)", "sans-serif"],
      },
      backgroundImage: {
        petal: "linear-gradient(135deg, #8171d4 0%, #a86fd0 30%, #e07ba0 66%, #f6b79e 100%)",
        "petal-soft": "linear-gradient(135deg, #8171d4, #b06fc6 50%, #e07ba0 95%)",
      },
      boxShadow: {
        clay: "inset 0 2px 3px rgba(255,255,255,.5), inset 0 -5px 11px rgba(0,0,0,.13), 0 9px 20px rgba(109,92,192,.14)",
        "clay-teal": "0 10px 22px rgba(125,108,207,.35), inset 0 2px 3px rgba(255,255,255,.4), inset 0 -5px 11px rgba(80,64,150,.3)",
        glass: "0 10px 30px rgba(109,92,192,.12)",
        soft: "0 12px 30px rgba(109,92,192,.1)",
        lift: "0 22px 44px rgba(109,92,192,.18)",
      },
    },
  },
  plugins: [],
};

export default config;
