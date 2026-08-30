import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

/**
 * Reglas de estilo de código.
 *
 * La lista es corta a propósito. Las que están sirven para cazar errores que
 * el compilador no ve (una promesa sin await, una comparación laxa); las de
 * formato las decide Prettier, que no discute.
 */
export default tseslint.config(
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "_legacy/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,

  {
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Los datos de las colecciones llegan tipados por Zod; el `any` puntual
      // al cruzar la frontera con Astro se marca, no se prohíbe.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  {
    // El navegador es el entorno por defecto: casi todo el codigo corre alli
    languageOptions: { globals: globals.browser },
  },

  {
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,ts}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { "no-console": "off" },
  },

  {
    // El auditor se inyecta en la pagina, no se importa: usa globales del DOM
    files: ["scripts/audita-contraste.js"],
    languageOptions: { globals: globals.browser },
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
);
