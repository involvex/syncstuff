import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        primary: {
          DEFAULT: "#002C5B",
          foreground: "#FFFFFF",
          container: "#00488F",
          onContainer: "#FFFFFF",
          fixed: "#00488F",
          onFixed: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#122C50",
          foreground: "#FFFFFF",
          container: "#324A6F",
          onContainer: "#FFFFFF",
          fixed: "#324A6F",
          onFixed: "#FFFFFF",
        },
        tertiary: {
          DEFAULT: "#08303B",
          foreground: "#FFFFFF",
          container: "#2B4E59",
          onContainer: "#FFFFFF",
          fixed: "#2B4E59",
          onFixed: "#FFFFFF",
        },
        error: {
          DEFAULT: "#600004",
          foreground: "#FFFFFF",
          container: "#98000A",
          onContainer: "#FFFFFF",
        },
        background: "#F9F9FF",
        onBackground: "#191C22",
        surface: "#F9F9FF",
        onSurface: "#000000",
        surfaceVariant: "#DDE2F1",
        onSurfaceVariant: "#000000",
        outline: "#272C37",
        outlineVariant: "#444955",
      },
    },
  },
  plugins: [],
} satisfies Config;
