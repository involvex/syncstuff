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
          // Primary color palette
          primary: {
            DEFAULT: "#002C5B",
            foreground: "#FFFFFF",
            container: "#00488F",
            onContainer: "#FFFFFF",
            fixed: "#00488F",
            onFixed: "#FFFFFF",
            light: "#4A6BFF",
            dark: "#001A3A",
          },
          // Secondary color palette
          secondary: {
            DEFAULT: "#122C50",
            foreground: "#FFFFFF",
            container: "#324A6F",
            onContainer: "#FFFFFF",
            fixed: "#324A6F",
            onFixed: "#FFFFFF",
            light: "#5A7B9F",
            dark: "#0A1A30",
          },
          // Tertiary color palette
          tertiary: {
            DEFAULT: "#08303B",
            foreground: "#FFFFFF",
            container: "#2B4E59",
            onContainer: "#FFFFFF",
            fixed: "#2B4E59",
            onFixed: "#FFFFFF",
            light: "#3A6E7B",
            dark: "#041A20",
          },
          // Error color palette
          error: {
            DEFAULT: "#600004",
            foreground: "#FFFFFF",
            container: "#98000A",
            onContainer: "#FFFFFF",
            light: "#FF5449",
            dark: "#3A0002",
          },
          // Success color palette
          success: {
            DEFAULT: "#006D3A",
            foreground: "#FFFFFF",
            container: "#00A859",
            onContainer: "#FFFFFF",
            light: "#4AFF8E",
            dark: "#003A1E",
          },
          // Warning color palette
          warning: {
            DEFAULT: "#6D4A00",
            foreground: "#FFFFFF",
            container: "#A87A00",
            onContainer: "#FFFFFF",
            light: "#FFD24A",
            dark: "#3A2A00",
          },
          // Info color palette
          info: {
            DEFAULT: "#004A6D",
            foreground: "#FFFFFF",
            container: "#007AFF",
            onContainer: "#FFFFFF",
            light: "#4A9AFF",
            dark: "#002A3A",
          },
          // Background colors
          background: {
            DEFAULT: "var(--background-color)",
            hover: "var(--background-hover-color)",
            focus: "var(--background-focus-color)",
            subtle: "var(--background-subtle-color)",
          },
          // Surface colors
          surface: {
            DEFAULT: "var(--surface-color)",
            container: "var(--surface-container-color)",
            variant: "var(--surface-variant-color)",
            hover: "var(--surface-hover-color)",
            active: "var(--surface-active-color)",
          },
          // Text colors
          onBackground: "var(--on-background-color)",
          onSurface: "var(--on-surface-color)",
          onSurfaceVariant: "var(--on-surface-variant-color)",
          color: {
            primary: "var(--color-primary)",
            secondary: "var(--color-secondary)",
            tertiary: "var(--color-tertiary)",
            subtitle: "var(--color-subtitle)",
            disabled: "var(--color-disabled)",
          },
          // Border and outline colors
          outline: "#272C37",
          outlineVariant: "var(--outline-variant-color)",
          border: {
            DEFAULT: "var(--border-color)",
            focus: "var(--border-focus-color)",
            error: "var(--border-error-color)",
          },
          ...colors, // Spread original colors *after* custom ones to prevent conflicts
        },
        // Background color utilities
        backgroundColor: {
          background: "var(--background-color)",
          surface: "var(--surface-color)",
          surfaceContainer: "var(--surface-container-color)",
          surfaceVariant: "var(--surface-variant-color)",
        },
        // Text color utilities
        textColor: {
          onBackground: "var(--on-background-color)",
          onSurface: "var(--on-surface-color)",
          onSurfaceVariant: "var(--on-surface-variant-color)",
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          tertiary: "var(--color-tertiary)",
          subtitle: "var(--color-subtitle)",
          disabled: "var(--color-disabled)",
        },
        // Border color utilities
        borderColor: {
          DEFAULT: "var(--border-color)",
          focus: "var(--border-focus-color)",
          error: "var(--border-error-color)",
        },
        // Ring color utilities
        ringColor: {
          primary: "var(--color-primary)",
          focus: "var(--border-focus-color)",
        },
        // Animation utilities
        animation: {
          progress: "progress 2s ease-in-out infinite",
          fadeIn: "fadeIn 0.3s ease-out",
          slideDown: "slideDown 0.3s ease-out",
        },
        // Keyframes for animations
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
