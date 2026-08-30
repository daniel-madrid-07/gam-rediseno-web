/**
 * Auditoría de contraste sobre el sitio ya compilado.
 *
 * Recorre la página en los dos temas, con contraste reforzado y con cada
 * diálogo abierto, porque los fallos de contraste casi nunca están en el estado
 * por defecto: aparecen en el tema que menos se mira y dentro de los paneles
 * que sólo se ven al abrirlos.
 *
 * Antes de medir desactiva `content-visibility`. Chrome no recalcula los
 * estilos de un subárbol que está fuera de pantalla, así que sin esto
 * `getComputedStyle` devuelve los valores del tema anterior y la auditoría
 * inventa fallos que en pantalla no existen.
 *
 * Uso:  node scripts/auditar.mjs [url]
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const auditor = readFileSync(join(aqui, "audita-contraste.js"), "utf8");
const URL_BASE = process.argv[2] ?? "http://localhost:4321/";

const ESCRITORIO = { width: 1440, height: 900 };
const MOVIL = { width: 390, height: 844 };

/** Cada escenario deja la página en un estado concreto y le pone nombre. */
const ESCENARIOS = [
  { nombre: "claro", tema: "light" },
  { nombre: "oscuro", tema: "dark" },
  { nombre: "contraste reforzado", tema: "light", contraste: "high" },
  { nombre: "contraste reforzado oscuro", tema: "dark", contraste: "high" },
  { nombre: "movil claro", tema: "light", pantalla: MOVIL },
  { nombre: "movil oscuro", tema: "dark", pantalla: MOVIL },
  { nombre: "buscador", tema: "dark", abre: "#btn-search" },
  { nombre: "bandeja", tema: "dark", abre: "#btn-tray" },
  { nombre: "accesibilidad", tema: "dark", abre: "#btn-a11y" },
  { nombre: "asistente", tema: "dark", abre: "#catalogo [data-open-wizard]" },
  { nombre: "detalle de servicio", tema: "light", abre: "[data-service='energia']" },
  { nombre: "menu movil", tema: "dark", pantalla: MOVIL, abre: "#btn-drawer" },
];

const navegador = await chromium.launch();
let fallosTotales = 0;

for (const escenario of ESCENARIOS) {
  const pagina = await navegador.newPage({ viewport: escenario.pantalla ?? ESCRITORIO });
  await pagina.goto(URL_BASE, { waitUntil: "networkidle" });

  await pagina.evaluate(
    ({ tema, contraste }) => {
      const raiz = document.documentElement;
      raiz.setAttribute("data-theme", tema);
      if (contraste) raiz.setAttribute("data-contrast", contraste);
      else raiz.removeAttribute("data-contrast");
    },
    { tema: escenario.tema, contraste: escenario.contraste ?? null },
  );

  if (escenario.abre) {
    // Los diálogos se hidratan con client:idle: hay que darles su tiempo
    await pagina.waitForTimeout(900);
    await pagina.locator(escenario.abre).first().click({ force: true });
    await pagina.waitForTimeout(500);
  }

  // Sin esto, todo lo que esté fuera de pantalla se mide con estilos rancios
  await pagina.evaluate(() => {
    document.querySelectorAll(".cv").forEach((el) => {
      el.style.contentVisibility = "visible";
    });
  });
  await pagina.waitForTimeout(400);

  await pagina.evaluate(auditor);
  const fallos = await pagina.evaluate(() => window.__auditaContraste());
  fallosTotales += fallos.length;

  const marca = fallos.length === 0 ? "OK   " : "FALLA";
  console.log(`${marca} ${escenario.nombre.padEnd(26)} ${fallos.length} incumplimientos AA`);
  for (const fallo of fallos.slice(0, 8)) {
    console.log(
      `        ${String(fallo.contraste).padStart(5)}:1 (min ${fallo.minimo}) ` +
        `${fallo.sel}  «${fallo.texto}»  ${fallo.color} sobre ${fallo.fondo}`,
    );
  }

  await pagina.close();
}

await navegador.close();

console.log(`\n${fallosTotales} incumplimientos AA en total`);
process.exit(fallosTotales === 0 ? 0 : 1);
