/**
 * Auditoría de Lighthouse sobre el sitio compilado.
 *
 * Mide la variante de producción, no la de vista previa: la de GitHub Pages
 * lleva `noindex` a propósito para no competir con gamrentals.com, y eso
 * hunde la puntuación de SEO por un motivo que no es un defecto.
 *
 * Uso:  node scripts/medir.mjs [url] [--detalle]
 */
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const URL_BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:4321/";
const conDetalle = process.argv.includes("--detalle");

/**
 * Móvil primero porque es como Google indexa desde 2019 y como llega la mayor
 * parte del tráfico de este sector: alguien consultando una máquina en obra.
 */
const PERFILES = [
  {
    nombre: "movil",
    opciones: { formFactor: "mobile", screenEmulation: { disabled: false } },
  },
  {
    nombre: "escritorio",
    opciones: {
      formFactor: "desktop",
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
    },
  },
];

const CATEGORIAS = ["performance", "accessibility", "best-practices", "seo"];
const ETIQUETAS = {
  performance: "Rendimiento",
  accessibility: "Accesibilidad",
  "best-practices": "Buenas prácticas",
  seo: "SEO",
};

const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
let minimo = 100;

for (const perfil of PERFILES) {
  const { lhr } = await lighthouse(
    URL_BASE,
    { port: chrome.port, output: "json", logLevel: "error" },
    { extends: "lighthouse:default", settings: perfil.opciones },
  );

  console.log(`\n── ${perfil.nombre.toUpperCase()} ${"─".repeat(46 - perfil.nombre.length)}`);
  for (const clave of CATEGORIAS) {
    const nota = Math.round((lhr.categories[clave]?.score ?? 0) * 100);
    minimo = Math.min(minimo, nota);
    const marca = nota >= 100 ? "✓" : nota >= 90 ? "·" : "✗";
    console.log(`  ${marca} ${ETIQUETAS[clave].padEnd(18)} ${String(nota).padStart(3)}`);
  }

  /* Métricas de Core Web Vitals, que es lo que Google usa para posicionar */
  const metricas = ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"];
  console.log("    " + metricas.map((m) => `${lhr.audits[m]?.title?.split(" ")[0]}: ${lhr.audits[m]?.displayValue ?? "-"}`).join("  ·  "));

  /* Lo que no llega al máximo, ordenado por lo que más resta */
  const fallos = Object.values(lhr.audits)
    .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== "informative")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  if (fallos.length) {
    console.log(`  Pendientes (${fallos.length}):`);
    for (const fallo of fallos.slice(0, conDetalle ? 30 : 10)) {
      const ahorro = fallo.details?.overallSavingsMs
        ? ` — ahorra ${Math.round(fallo.details.overallSavingsMs)} ms`
        : fallo.displayValue
          ? ` — ${fallo.displayValue}`
          : "";
      console.log(`    · ${fallo.title}${ahorro}`);
    }
  }
}

// En Windows el borrado del perfil temporal falla a veces y no importa
try {
  await chrome.kill();
} catch {
  /* el proceso ya está muerto; el temporal lo limpia el sistema */
}
console.log(`\nPeor puntuación: ${minimo}`);
