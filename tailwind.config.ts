import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#f9fbfc",
        deep: "#080D16",
        ink: {
          DEFAULT: "#1b2c38",
          soft: "#3b5669",
          mute: "#536775",
          faint: "#6c8292",
        },
        line: "#d1dde5",
        sky: {
          DEFAULT: "#84C3FF",
          deep: "#223A66",
        },
        brand: {
          DEFAULT: "#1b6578",
          soft: "#80afc2",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dim: "#edf3f6",
          dark: "#0D1825",
        },
      },
      fontFamily: {
        display: ["var(--font-space)", "var(--font-noto)", "sans-serif"],
        sans: ["var(--font-noto)", "var(--font-space)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "56rem",
      },
    },
  },
  plugins: [],
};
export default config;
