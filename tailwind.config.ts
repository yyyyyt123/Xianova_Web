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
        page: "var(--background)",
        deep: "#080D16",
        ink: {
          DEFAULT: "#1b2c38",
          soft: "#3b5669",
          mute: "var(--text-secondary)",
          faint: "var(--text-tertiary)",
        },
        line: "var(--line)",
        sky: {
          DEFAULT: "#84C3FF",
          deep: "#223A66",
        },
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          soft: "#9aadb9",
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
