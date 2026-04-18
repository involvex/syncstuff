import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default tseslint.config(
  {
    ignores: [
      "dist",
      "android",
      "ios",
      "**/build/**",
      "**/node_modules/**",
      "capacitor.config.ts",
      "cypress.config.ts",
      "cypress/**", // Ignore Cypress tests from main linting
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Disable the strict set-state-in-effect rule - many of these patterns are intentional
      // for initialization scenarios where the effect is the appropriate place
      "react-hooks/set-state-in-effect": "off",
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Disable explicit any check temporarily if needed, but fixing types is better
      "@typescript-eslint/no-explicit-any": "warn",
      // Disable no-useless-assignment - the 'body' variable IS passed to showNotification
      // This is a false positive from the linter
      "no-useless-assignment": "off",
    },
  },
);
