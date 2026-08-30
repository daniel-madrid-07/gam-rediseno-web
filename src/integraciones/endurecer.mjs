import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

/**
 * Endurecido del HTML publicado, con salvaguarda.
 *
 * Reduce lo que se lee de un vistazo al inspeccionar la página: comentarios
 * escritos por personas y metadatos que anuncian con qué está hecha la web.
 *
 * Conviene ser claro sobre el alcance: esto NO protege el código. El navegador
 * tiene que poder descargar y ejecutar el JavaScript y el CSS, así que quien
 * quiera leerlos los va a leer. Lo que se consigue es que la primera mirada no
 * regale la estructura del proyecto ni el nombre de cada componente.
 *
 * Los comentarios de hidratación (`<!--[-->`, `<!--]-->`, `<!---->`) NO se
 * tocan: Svelte los usa para saber dónde empieza y acaba cada bloque, y
 * quitarlos rompe la hidratación en silencio.
 */

/** Comentarios que el navegador o el framework necesitan. */
const TECNICOS = /^(\s*\[|\s*\]|\s*$|astro:|\/?\$|\[!)/;

/**
 * Rastros que nunca deben salir publicados.
 *
 * Ya pasó una vez: una personalización de los nombres de archivo arrastró el
 * bundle de servidor dentro de `dist/`, y ese bundle lleva la ruta absoluta de
 * la máquina donde se compiló. Como no estaba referenciado desde el HTML, no
 * daba ningún error: simplemente se publicaba. De ahí esta comprobación.
 */
const RASTROS = [
  { patron: /[A-Za-z]:[\\/](Users|ALL|home)[\\/]/, motivo: "ruta absoluta de la máquina de compilación" },
  { patron: /\/(?:home|Users)\/[a-z]/i, motivo: "ruta absoluta de la máquina de compilación" },
  { patron: /node_modules\//, motivo: "ruta de dependencias" },
];

const limpiarComentarios = (html) =>
  html.replace(/<!--([\s\S]*?)-->/g, (completo, contenido) =>
    TECNICOS.test(contenido) ? completo : "",
  );

/** El `<meta name="generator">` anuncia framework y versión exacta. */
const quitarGenerador = (html) => html.replace(/<meta\s+name="generator"[^>]*>/gi, "");

async function* archivos(directorio, extensiones) {
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) yield* archivos(ruta, extensiones);
    else if (extensiones.some((ext) => entrada.name.endsWith(ext))) yield ruta;
  }
}

export default function endurecer() {
  return {
    name: "gam-endurecer",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);

        /* ---- 1. Limpiar el HTML ---- */
        let ahorro = 0;
        let paginas = 0;
        for await (const ruta of archivos(raiz, [".html"])) {
          const original = await readFile(ruta, "utf8");
          const limpio = quitarGenerador(limpiarComentarios(original));
          if (limpio !== original) {
            await writeFile(ruta, limpio, "utf8");
            ahorro += original.length - limpio.length;
          }
          paginas += 1;
        }

        /* ---- 2. Comprobar que no se publica nada que delate el origen ---- */
        const sospechosos = [];
        for await (const ruta of archivos(raiz, [".js", ".css", ".html", ".json"])) {
          const contenido = await readFile(ruta, "utf8");
          for (const { patron, motivo } of RASTROS) {
            if (patron.test(contenido)) {
              sospechosos.push({ archivo: relative(raiz, ruta), motivo });
              break;
            }
          }
        }

        if (sospechosos.length > 0) {
          for (const { archivo, motivo } of sospechosos) {
            logger.error(`  ${archivo}: ${motivo}`);
          }
          throw new Error(
            `${sospechosos.length} archivo(s) del build filtran rutas del entorno de compilación. ` +
              "Revisa la configuración de nombres de salida antes de publicar.",
          );
        }

        logger.info(
          `HTML endurecido: ${paginas} página(s), ${(ahorro / 1024).toFixed(1)} KB fuera. ` +
            "Sin rastros del entorno de compilación.",
        );
      },
    },
  };
}
