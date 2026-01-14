// tailwind.config.js
import { borderRadius, colors, spacing, typography } from "@syncstuff/ui";
import type { Config } from "tailwindcss";

const extendsConfig: Config = {
  darkMode: "class",
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius,
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
      fontSize: {
        h1: typography.h1.fontSize,
        h2: typography.h2.fontSize,
        h3: typography.h3.fontSize,
        body1: typography.body1.fontSize,
        body2: typography.body2.fontSize,
        caption: typography.caption.fontSize,
      },
      fontWeight: {
        h1: typography.h1.fontWeight,
        h2: typography.h2.fontWeight,
        h3: typography.h3.fontWeight,
        body1: typography.body1.fontWeight,
        body2: typography.body2.fontWeight,
        caption: typography.caption.fontWeight,
      },
      lineHeight: {
        h1: typography.h1.lineHeight,
        h2: typography.h2.lineHeight,
        h3: typography.h3.lineHeight,
        body1: typography.body1.lineHeight,
        body2: typography.body2.lineHeight,
        caption: typography.caption.lineHeight,
      },
      animation: {
        progress: "progress 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        slideDown: "slideDown 0.3s ease-out",
      },
      keyframes: {
        progress: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
};

export default extendsConfig;
