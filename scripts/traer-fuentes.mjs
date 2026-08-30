/**
 * Descarga las fuentes de Google y las deja autoalojadas.
 *
 * Motivo: la hoja de estilos de fonts.googleapis.com bloquea el renderizado.
 * Antes de pintar una letra, el navegador tiene que resolver dos dominios,
 * negociar dos conexiones TLS, descargar un CSS y sólo entonces empezar a
 * pedir los .woff2. En móvil con red lenta eso medía 2,3 segundos de bloqueo.
 *
 * Sirviéndolas desde el mismo origen desaparecen las dos conexiones y los
 * archivos entran en la misma conexión que ya está abierta. De paso, ningún
 * dato de quien visita la web sale hacia Google.
 *
 * Se descargan sólo los subconjuntos latinos: el sitio está en español y las
 * caras cirílicas y vietnamitas nunca se llegarían a usar.
 *
 * Uso:  node scripts/traer-fuentes.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Se piden rangos, no pesos sueltos, siempre que la familia sea variable:
 * `Instrument+Sans:wght@400..700` devuelve UN archivo de 35 KB en lugar de
 * cuatro estáticos de 29 KB cada uno. IBM Plex Mono no tiene versión variable
 * en Google Fonts, así que ahí sí hay que enumerar los pesos.
 */
const CONSULTA =
  "family=Archivo:wdth,wght@62..125,500..900" +
  "&family=IBM+Plex+Mono:wght@400;500;600" +
  "&family=Instrument+Sans:wght@400..700" +
  "&display=swap";

/** Chrome moderno, para que Google devuelva woff2 y no formatos antiguos. */
const NAVEGADOR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** El español entra entero en `latin`; `latin-ext` cubre marcas extranjeras. */
const SUBCONJUNTOS = new Set(["latin", "latin-ext"]);

/**
 * Los .woff2 van dentro de src/ y no de public/ a propósito: así los procesa
 * Vite, que reescribe la `url()` con la base de despliegue configurada y les
 * pone un hash de contenido. Con `public/` habría que escribir rutas absolutas,
 * y esas se rompen al publicar bajo un subdirectorio.
 */
const DESTINO_ARCHIVOS = "src/estilos/fuentes";
const DESTINO_CSS = "src/estilos/base/fuentes.css";

const css = await (
  await fetch(`https://fonts.googleapis.com/css2?${CONSULTA}`, {
    headers: { "User-Agent": NAVEGADOR },
  })
).text();

await mkdir(DESTINO_ARCHIVOS, { recursive: true });

/* El CSS de Google marca cada bloque con un comentario que nombra el subconjunto */
const bloques = css.split(/\/\* ([a-z-]+) \*\//).slice(1);
const caras = [];

for (let i = 0; i < bloques.length; i += 2) {
  const subconjunto = bloques[i];
  const cuerpo = bloques[i + 1];
  if (!SUBCONJUNTOS.has(subconjunto)) continue;

  const familia = /font-family: '([^']+)'/.exec(cuerpo)?.[1];
  const estilo = /font-style: ([^;]+);/.exec(cuerpo)?.[1] ?? "normal";
  const peso = /font-weight: ([^;]+);/.exec(cuerpo)?.[1] ?? "400";
  const estiramiento = /font-stretch: ([^;]+);/.exec(cuerpo)?.[1];
  const rango = /unicode-range: ([^;]+);/.exec(cuerpo)?.[1];
  const url = /src: url\(([^)]+)\)/.exec(cuerpo)?.[1];
  if (!familia || !url) continue;

  const nombre = `${familia.toLowerCase().replace(/\s+/g, "-")}-${peso.replace(/\s+/g, "")}-${subconjunto}.woff2`;
  const datos = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(join(DESTINO_ARCHIVOS, nombre), datos);

  caras.push({ familia, estilo, peso, estiramiento, rango, nombre, bytes: datos.length });
  console.log(`  ${nombre.padEnd(46)} ${String(Math.round(datos.length / 1024)).padStart(3)} KB`);
}

/* ---- Hoja local ---- */
const reglas = caras
  .map((c) =>
    [
      "@font-face {",
      `  font-family: "${c.familia}";`,
      `  font-style: ${c.estilo};`,
      `  font-weight: ${c.peso};`,
      c.estiramiento ? `  font-stretch: ${c.estiramiento};` : null,
      // `swap` enseña el texto en la tipografía de respaldo y lo cambia al
      // llegar la buena: se lee desde el primer instante, nunca en blanco.
      "  font-display: swap;",
      `  src: url("../fuentes/${c.nombre}") format("woff2");`,
      c.rango ? `  unicode-range: ${c.rango};` : null,
      "}",
    ]
      .filter(Boolean)
      .join("\n"),
  )
  .join("\n\n");

const cabecera = `/**
 * Fuentes autoalojadas.
 *
 * Generado por scripts/traer-fuentes.mjs. No se edita a mano.
 *
 * Se sirven desde el mismo origen para que no bloqueen el renderizado: pedirlas
 * a fonts.googleapis.com obliga a resolver dos dominios y abrir dos conexiones
 * TLS antes de poder pintar la primera letra.
 *
 * Sólo van los subconjuntos ${[...SUBCONJUNTOS].join(" y ")}: el sitio está en español.
 *
 * Las rutas son relativas para que Vite las reescriba con la base de despliegue
 * y les añada el hash de contenido. Suben un nivel porque esta hoja vive en
 * estilos/base/ y los archivos en estilos/fuentes/.
 */

`;

await writeFile(DESTINO_CSS, cabecera + reglas + "\n", "utf8");

const total = caras.reduce((suma, c) => suma + c.bytes, 0);
console.log(`\n${caras.length} caras · ${Math.round(total / 1024)} KB en total`);
console.log(`Hoja escrita en ${DESTINO_CSS}`);
