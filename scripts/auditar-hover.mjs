/**
 * Auditoría de contraste en los estados de interacción.
 *
 * La auditoría normal mide la página en reposo, y eso deja fuera un agujero
 * entero: las reglas `:hover` y `:focus-visible` cambian fondo y texto por
 * separado, así que es fácil cambiar uno y olvidar el otro. Pasó de verdad:
 * `.shelf__card .btn--gam:hover` oscurecía el fondo pero dejaba el texto en
 * `--paper`, que en tema oscuro es casi negro. El botón se volvía ilegible al
 * pasar el ratón, y sólo en tema oscuro.
 *
 * Se fuerza el pseudoestado con el protocolo de depuración de Chrome, que es
 * la única forma de medirlo de verdad: mover el ratón por encima no sirve
 * porque hay elementos que se tapan entre sí.
 *
 * Uso:  node scripts/auditar-hover.mjs [url]
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const auditor = readFileSync(join(aqui, "audita-contraste.js"), "utf8");
const URL_BASE = process.argv[2] ?? "http://localhost:4321/";

/** Todo lo que responde al ratón o al teclado. */
const INTERACTIVOS = "a, button, summary, label.check, label.switch, label.consent, [role='option']";

const ESCENARIOS = [
  { nombre: "claro", tema: "light" },
  { nombre: "oscuro", tema: "dark" },
  { nombre: "contraste reforzado", tema: "light", contraste: "high" },
  { nombre: "contraste reforzado oscuro", tema: "dark", contraste: "high" },
];

const ESTADOS = ["hover", "focus-visible"];

const navegador = await chromium.launch();
let fallos = 0;

for (const escenario of ESCENARIOS) {
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await pagina.context().newCDPSession(pagina);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");

  await pagina.goto(URL_BASE, { waitUntil: "networkidle" });
  await pagina.evaluate(
    ({ tema, contraste }) => {
      document.documentElement.setAttribute("data-theme", tema);
      if (contraste) document.documentElement.setAttribute("data-contrast", contraste);
    },
    { tema: escenario.tema, contraste: escenario.contraste ?? null },
  );

  await pagina.evaluate((selector) => {
    /* Las transiciones se apagan antes de medir. Los botones animan color y
       fondo durante 200 ms, así que `getComputedStyle` justo después de forzar
       `:hover` devuelve todavía el valor de reposo y la auditoría da un OK
       falso. Así se escapó el botón «Buscar», que en tema oscuro quedaba a
       1,06:1 con el ratón encima. Apagarlas es además mucho más rápido que
       esperar a que terminen elemento por elemento. */
    const sinMovimiento = document.createElement("style");
    sinMovimiento.textContent =
      "*,*::before,*::after{transition:none !important;animation:none !important}";
    document.head.append(sinMovimiento);

    // Se marca cada interactivo para poder recorrerlos por índice desde CDP
    document.querySelectorAll(selector).forEach((el, i) => el.setAttribute("data-auditoria", String(i)));
  }, INTERACTIVOS);
  await pagina.waitForTimeout(400);

  const total = await pagina.evaluate(() => document.querySelectorAll("[data-auditoria]").length);
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });

  for (const estado of ESTADOS) {
    const encontrados = [];

    for (let i = 0; i < total; i += 1) {
      const { nodeId } = await cdp.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: `[data-auditoria="${i}"]`,
      });
      if (!nodeId) continue;

      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [estado] });
      const malos = await pagina.evaluate(
        ({ codigo, indice }) => {
          // El auditor se redefine en cada pasada; devuelve sólo lo de este nodo
          eval(codigo);
          const todos = window.__auditaContraste();
          const el = document.querySelector(`[data-auditoria="${indice}"]`);
          const texto = (el?.textContent ?? "").trim().slice(0, 30);
          return todos.filter((f) => texto.includes(f.texto.slice(0, 12)) || f.texto.includes(texto.slice(0, 12)));
        },
        { codigo: auditor, indice: i },
      );
      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });

      for (const malo of malos) {
        const clave = `${malo.sel}|${malo.texto}`;
        if (!encontrados.some((e) => e.clave === clave)) encontrados.push({ clave, ...malo });
      }
    }

    fallos += encontrados.length;
    const marca = encontrados.length === 0 ? "OK   " : "FALLA";
    console.log(`${marca} ${escenario.nombre.padEnd(26)} :${estado.padEnd(14)} ${encontrados.length}`);
    for (const f of encontrados.slice(0, 6)) {
      console.log(`        ${String(f.contraste).padStart(5)}:1  ${f.sel}  «${f.texto}»  ${f.color} sobre ${f.fondo}`);
    }
  }

  await pagina.close();
}

await navegador.close();
console.log(`\n${fallos} incumplimientos AA en estados de interacción`);
process.exit(fallos === 0 ? 0 : 1);
