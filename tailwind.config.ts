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
        page: "#F7F8FA",
        deep: "#080D16",
        ink: {
          DEFAULT: "#13213C",
          soft: "#2B4160",
          mute: "#546478",
          faint: "#9CAABB",
        },
        line: "#D8E0E9",
        sky: {
          DEFAULT: "#84C3FF",
          deep: "#223A66",
        },
        brand: {
          DEFAULT: "#0F7D76",
          soft: "#49CEBA",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dim: "#F0F2F4",
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
