import js from "@eslint/js";
import globals from "globals";
export default [{
  ignores: ["node_modules/**", "dist/**", "build/**", ".next/**", ".expo/**", "android/**", "ios/**", "**/.gradle/**", "packages/shared/dist/**", "apps/mobileapp/node_modules/**", "packages/ui/dist/**", "packages/ui/*/**"]
}, {
  files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node
    }
  },
  rules: {
    ...js.configs.recommended.rules,
    "no-console": ["warn", {
      allow: ["warn", "error"]
    }],
    "no-unused-vars": "off",
    "prefer-const": "warn"
  }
}];