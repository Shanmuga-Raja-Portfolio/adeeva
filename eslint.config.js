import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "test-results", "playwright-report"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: "Use the seeded RNG in core.",
        },
      ],
    },
  },
  {
    files: ["src/core/**/*.ts", "src/content/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: ["react", "react-dom", "../ui/*", "../app/*"] }],
      "no-restricted-globals": ["error", "window", "document", "localStorage", "Date"],
    },
  },
);
