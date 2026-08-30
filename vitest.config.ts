import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const enRaiz = (ruta: string): string => fileURLToPath(new URL(ruta, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@datos": enRaiz("./src/datos"),
      "@lib": enRaiz("./src/lib"),
      "@componentes": enRaiz("./src/componentes"),
      "@islas": enRaiz("./src/islas"),
      "@tipos": enRaiz("./src/tipos/index.ts"),
      "@": enRaiz("./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
