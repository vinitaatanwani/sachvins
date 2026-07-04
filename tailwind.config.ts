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
        ink: "#2f2a26", // charcoal, warmed
        "ink-light": "#574d44",
        "ink-muted": "#8a7f74",
        "warm-white": "#fff8ed", // page canvas — Warm Cream
        cream: "#fbf1e1", // warm sunken tint
        parchment: "#efe3d0", // hairline borders / tracks
        gold: "#f7931e", // Solar Orange accent (legible on cream)
        "gold-light": "#f9c74f", // Golden Yellow
        sage: "#f7931e",
        indigo: {
          DEFAULT: "#087f71", // brand primary — Deep Teal
          dark: "#066a5e",
        },
        sunshine: {
          DEFAULT: "#f9c74f", // Golden Yellow (petal highlight)
          light: "#fff1cc",
          dark: "#f7931e",
        },
        sky: {
          DEFAULT: "#4b174f", // Vinita / depth (Deep Plum)
          light: "#f2e9f2",
        },

        // ── Full palette scales ──
        green: {
          50: "#e7f3f0", 100: "#c4e5de", 200: "#93ccc1", 300: "#57b1a2",
          400: "#229585", 500: "#087f71", 600: "#076a5e", 700: "#06554b",
          800: "#06443c", 900: "#05332d",
        },
        amber: {
          50: "#fef3e0", 100: "#fce1b6", 200: "#fbcf86", 300: "#f9c74f",
          400: "#f7931e", 500: "#e07f16", 600: "#c06a10", 700: "#96530d",
        },
        berry: {
          50: "#fdeaef", 100: "#fbccd6", 200: "#f7a0b0", 300: "#f4788c",
          400: "#f45b69", 500: "#e2306a", 600: "#d4146e", 700: "#a91058",
        },
        plum: {
          50: "#f2e9f2", 100: "#dcc6de", 200: "#c099c3", 300: "#9b6a9f",
          400: "#6f3f73", 500: "#4b174f", 600: "#3d1241", 700: "#2e0d31",
        },
        sand: { 200: "#efe3d0", 300: "#e0d0b6", 400: "#cbb99a" },
        stone: { 500: "#a4917a", 600: "#8a7f74" },
        gold_tip: "#f9c74f",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
        accent: ["var(--font-nunito)", "var(--font-mulish)", "sans-serif"],
      },
      backgroundImage: {
        petal: "linear-gradient(135deg, #4b174f 0%, #d4146e 42%, #f7931e 78%, #f9c74f 100%)",
        "petal-soft": "linear-gradient(135deg, #4b174f, #d4146e 52%, #f7931e 95%)",
      },
      boxShadow: {
        clay: "inset 0 2px 3px rgba(255,255,255,.45), inset 0 -5px 11px rgba(0,0,0,.14), 0 9px 20px rgba(0,0,0,.10)",
        "clay-teal": "0 9px 20px rgba(8,127,113,.28), inset 0 2px 3px rgba(255,255,255,.4), inset 0 -5px 11px rgba(4,70,60,.32)",
        glass: "0 10px 30px rgba(75,23,79,.08)",
        soft: "0 12px 30px rgba(75,23,79,.08)",
        lift: "0 22px 44px rgba(75,23,79,.14)",
      },
    },
  },
  plugins: [],
};

export default config;
