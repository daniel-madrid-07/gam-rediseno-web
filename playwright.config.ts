import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo contra el sitio compilado, no contra el
 * servidor de desarrollo: lo que se verifica tiene que ser lo que se publica,
 * con su CSS minificado, sus islas troceadas y su hidratación real.
 */
export default defineConfig({
  testDir: "./pruebas",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? "github" : "list",

  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    locale: "es-ES",
  },

  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],

  webServer: {
    command: "npm run build:fast && npx astro preview --port 4321",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  },
});
