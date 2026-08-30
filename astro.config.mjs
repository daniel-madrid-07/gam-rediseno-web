// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import endurecer from "./src/integraciones/endurecer.mjs";

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
    endurecer(),
  ],

  image: {
    // Las fotos del parque ya vienen normalizadas a WebP en public/img
    responsiveStyles: true,
    layout: "constrained",
  },

  build: {
    // Un único CSS crítico evita la cascada de peticiones en la primera carga
    inlineStylesheets: "auto",
    // Nombre neutro: `_recursos` o `_astro` ya dicen con qué está hecha la web
    assets: "a",
  },

  vite: {
    build: {
      cssMinify: "lightningcss",
      // Sin mapas de fuente en producción: son el código original entero
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            estado: ["nanostores", "@nanostores/persistent"],
          },
        },
      },
    },
    plugins: [nombresOpacos()],
  },
});

/**
 * Nombres de archivo sin significado, sólo para el build de cliente.
 *
 * Con el nombre del componente por delante, el listado de `dist/` es un índice
 * del proyecto: Asistente, Bandeja, PanelAccesibilidad, client.svelte…
 *
 * El `isSsrBuild` no es un detalle: Astro compila dos veces, y aplicar esto
 * también al build de servidor arrastra su bundle dentro de `dist/`, donde
 * acabaría publicado. Ese bundle lleva las rutas absolutas de la máquina donde
 * se compiló y el árbol completo de componentes.
 */
function nombresOpacos() {
  return {
    name: "gam-nombres-opacos",
    config(_config, { isSsrBuild }) {
      if (isSsrBuild) return undefined;
      return {
        build: {
          rollupOptions: {
            output: {
              entryFileNames: "a/[hash].js",
              chunkFileNames: "a/[hash].js",
              assetFileNames: "a/[hash][extname]",
            },
          },
        },
      };
    },
  };
}
