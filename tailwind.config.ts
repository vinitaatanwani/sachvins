import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── SachVins / Healing Hands by Vinita brand ──
        // Legacy alias names (ink/cream/gold/indigo/sky/…) are kept and remapped
        // to SachVins hues so every existing screen reskins without touching call
        // sites. New onboarding/joyride components use the full scales below.
        ink: "#1c1610",
        "ink-light": "#4a3d30",
        "ink-muted": "#7c6a52",
        "warm-white": "#fbf6ee", // page background (cream-50)
        cream: "#f6efe1", // warm sunken tint (cream-100)
        parchment: "#ece0cd", // hairline borders / tracks (sand-200)
        gold: "#e08e1a", // brand amber accent (amber-500, legible on cream)
        "gold-light": "#f5bb4c",
        sage: "#f0a830",
        indigo: {
          DEFAULT: "#00a855", // brand primary — Healing Green
          dark: "#00883f",
        },
        sunshine: {
          DEFAULT: "#ffd848", // gold tip (petal highlight)
          light: "#fff0b8",
          dark: "#e08e1a",
        },
        sky: {
          DEFAULT: "#6b1a6b", // Vinita / depth (plum-500)
          light: "#f3e8f3",
        },

        // ── Full brand scales ──
        green: {
          50: "#e6faef", 100: "#c2f2d7", 200: "#8ce6b1", 300: "#4fd58a",
          400: "#17c069", 500: "#00a855", 600: "#00883f", 700: "#036c34",
          800: "#0a5029", 900: "#0c3a20",
        },
        amber: {
          50: "#fdf4e0", 100: "#fbe6b8", 200: "#f9d27e", 300: "#f5bb4c",
          400: "#f0a830", 500: "#e08e1a", 600: "#bd7112", 700: "#94570e",
        },
        berry: {
          50: "#fbe7f1", 100: "#f6c2dc", 200: "#ef8fbf", 300: "#e85aa1",
          400: "#dd2f84", 500: "#c21a6f", 600: "#a0125b", 700: "#7a0e46",
        },
        plum: {
          50: "#f3e8f3", 100: "#e2c6e2", 200: "#c795c7", 300: "#a262a2",
          400: "#833d83", 500: "#6b1a6b", 600: "#551254", 700: "#3d0c3d",
        },
        sand: { 200: "#ece0cd", 300: "#ddcbb0", 400: "#c9b596" },
        stone: { 500: "#a08d72", 600: "#7c6a52" },
        gold_tip: "#ffd848",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
        accent: ["var(--font-nunito)", "var(--font-mulish)", "sans-serif"],
      },
      backgroundImage: {
        petal: "linear-gradient(125deg, #6b1a6b 0%, #dd2f84 34%, #f0a830 68%, #ffd848 100%)",
        "petal-soft": "linear-gradient(125deg, #6b1a6b, #c21a6f 48%, #f0a830 95%)",
      },
    },
  },
  plugins: [],
};

export default config;
