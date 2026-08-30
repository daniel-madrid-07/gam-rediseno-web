/**
 * Mide la altura real de cada sección diferida.
 *
 * `content-visibility: auto` necesita una altura estimada para reservar sitio
 * mientras la sección está sin renderizar. Si la estimación se pasa, la página
 * encoge al renderizarse de verdad y el desplazamiento se recorta; si se queda
 * corta, crece y da un tirón. Las dos cosas se ven como saltos al desplazarse,
 * y fueron la causa del «rebote» al abrir los diálogos: un modal cubre el
 * viewport entero, todas las secciones se contraen a la vez y el salto se
 * multiplica.
 *
 * Este script imprime las reglas CSS listas para pegar en
 * `src/estilos/base/estados.css`. Conviene volver a pasarlo cuando se añada o
 * se quite contenido de alguna sección.
 *
 * Uso:  node scripts/medir-secciones.mjs [url]
 */
import { chromium } from "@playwright/test";

const URL_BASE = process.argv[2] ?? "http://localhost:4321/";

const ANCHOS = [
  { nombre: "escritorio", viewport: { width: 1280, height: 900 }, media: null },
  { nombre: "movil", viewport: { width: 390, height: 844 }, media: "(width < 48rem)" },
];

const navegador = await chromium.launch();
const salida = [];

for (const perfil of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: perfil.viewport });
  await pagina.goto(URL_BASE, { waitUntil: "networkidle" });

  /* Con el diferido desactivado, cada sección ocupa su altura verdadera */
  const medidas = await pagina.evaluate(async () => {
    document.querySelectorAll(".cv").forEach((seccion) => {
      seccion.style.contentVisibility = "visible";
    });
    await new Promise((listo) => setTimeout(listo, 900));

    const alturas = {};
    document.querySelectorAll(".cv").forEach((seccion) => {
      if (seccion.id) alturas[seccion.id] = Math.round(seccion.getBoundingClientRect().height);
    });
    return alturas;
  });

  const reglas = Object.entries(medidas)
    .map(([id, alto]) => `#${id} {\n  --alto-estimado: ${alto}px;\n}`)
    .join("\n\n");

  salida.push(
    perfil.media
      ? `@media ${perfil.media} {\n${reglas.replace(/^/gm, "  ")}\n}`
      : reglas,
  );

  console.error(`${perfil.nombre}: ${Object.keys(medidas).length} secciones medidas`);
  await pagina.close();
}

await navegador.close();
console.log(salida.join("\n\n"));
