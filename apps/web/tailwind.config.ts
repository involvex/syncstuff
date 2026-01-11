// tailwind.config.js
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const extendsConfig: Config = {
  darkMode: "class",
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
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
    extend: {
      // Use extend to add to existing Tailwind utilities
      colors: {
        // These are for general color usage, like text-primary, bg-primary
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
        // These can be used directly as text-background, bg-background etc.
        // Tailwind creates these utilities automatically when defined here.
        background: "var(--background-color)",
        onBackground: "var(--on-background-color)",
        surface: "var(--surface-color)",
        onSurface: "var(--on-surface-color)",
        surfaceVariant: "var(--surface-variant-color)", // Ensure this var is defined in CSS
        onSurfaceVariant: "var(--on-surface-variant-color)",
        outline: "#272C37",
        outlineVariant: "var(--outline-variant-color)",
        ...colors, // Spread original colors *after* custom ones to prevent conflicts if you name a custom color "blue"
      },
      // You can also explicitly define them here if you want to ensure they are available as bg- and text-
      // But typically, defining them in `colors` under `extend` handles this for simple cases.
      // If you had complex colors or wanted to override default color names, you might do this:
      // backgroundColor: {
      //   background: "#F9F9FF",
      //   surface: "#F9F9FF",
      //   // ...
      // },
      // textColor: {
      //   onBackground: "#191C22",
      //   onSurface: "#000000",
      //   // ...
      // },
    },
  },
};

export default extendsConfig;
