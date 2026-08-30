// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

import { SITIO } from "./src/config/sitio.ts";

/**
 * Salida estática: el sitio se sirve desde cualquier CDN o desde GitHub Pages
 * sin proceso Node detrás. Las islas de Svelte se hidratan en cliente sólo
 * donde hay interacción real; el resto de la página viaja como HTML.
 */
export default defineConfig({
  site: SITIO.origen,
  base: SITIO.base,
  output: "static",
  trailingSlash: "ignore",

  integrations: [
    svelte(),
    sitemap({
      filter: (pagina) => !pagina.includes("/404"),
      changefreq: "weekly",
      lastmod: new Date(),
    }),
  ],

  image: {
    // Las fotos del parque ya vienen normalizadas a WebP en public/img
    responsiveStyles: true,
    layout: "constrained",
  },

  build: {
    // Un único CSS crítico evita la cascada de peticiones en la primera carga
    inlineStylesheets: "auto",
    assets: "_recursos",
  },

  vite: {
    build: {
      cssMinify: "lightningcss",
      rollupOptions: {
        output: {
          manualChunks: {
            estado: ["nanostores", "@nanostores/persistent"],
          },
        },
      },
    },
  },
});
