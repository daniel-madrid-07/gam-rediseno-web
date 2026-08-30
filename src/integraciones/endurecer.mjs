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

export default function endurecer({ base = "/" } = {}) {
  return {
    name: "gam-endurecer",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);

        /* ---- 1. Limpiar el HTML ---- */
        let ahorro = 0;
        let paginas = 0;
        const htmls = [];
        for await (const ruta of archivos(raiz, [".html"])) {
          const original = await readFile(ruta, "utf8");
          const limpio = quitarGenerador(limpiarComentarios(original));
          if (limpio !== original) {
            await writeFile(ruta, limpio, "utf8");
            ahorro += original.length - limpio.length;
          }
          paginas += 1;
          htmls.push(ruta);
        }

        /* Sobre el CSS crítico: se probó a extraerlo con Beasties y salió
         * peor (con la página entera en el marcado considera crítico 50 de los
         * 61 KB, y encima sigue cargando la hoja completa: la primera pintura
         * pasaba de 1,8 s a 2,6 s). Meter la hoja entera en línea era aún peor,
         * 3,0 s. Gana dejarla como hoja externa. */

        /* ---- 2. Precargar las tipografías del primer pantallazo ----
         *
         * Sin esto, una fuente no empieza a bajar hasta que el navegador ha
         * descargado el CSS, lo ha analizado, ha maquetado y ha descubierto que
         * hay texto que la necesita. Son tres pasos en serie antes de pedir un
         * archivo que ya se sabe que hace falta.
         *
         * El nombre lleva un hash que pone Vite, así que no se puede escribir a
         * mano en la plantilla: se busca en el CSS ya compilado.
         *
         * Sólo van las dos de la primera pantalla. Precargar todas competiría
         * por el ancho de banda con la imagen del héroe, que es el LCP.
         */
        const CRITICAS = [/archivo-[^"')]*-latin\.[\w-]+\.woff2/, /instrument-sans-[^"')]*-latin\.[\w-]+\.woff2/];
        const urlsFuentes = new Set();
        for await (const hoja of archivos(raiz, [".css"])) {
          const contenido = await readFile(hoja, "utf8");
          for (const patron of CRITICAS) {
            const encontrado = patron.exec(contenido);
            if (encontrado) urlsFuentes.add(`${base.replace(/\/$/, "")}/a/${encontrado[0]}`);
          }
        }

        const precargas = [...urlsFuentes]
          .map((url) => `<link rel="preload" as="font" type="font/woff2" href="${url}" crossorigin>`)
          .join("");

        if (precargas) {
          for (const ruta of htmls) {
            const html = await readFile(ruta, "utf8");
            if (html.includes('as="font"')) continue;
            // Delante del primer <link>, que es donde antes empieza la descarga
            await writeFile(ruta, html.replace(/<link /, `${precargas}<link `), "utf8");
          }
          logger.info(`Tipografías precargadas: ${urlsFuentes.size}`);
        }

        /* ---- 3. Comprobar que no se publica nada que delate el origen ---- */
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

        /* ---- Ninguna página se publica sin estilos ----
         *
         * Pasó dos veces durante el desarrollo: compilar mientras el servidor
         * de vista previa aún tenía tomado `dist/` dejaba el HTML sin la hoja
         * y sin ningún error. La página se sirve en Times New Roman y sin
         * maquetar, y no hay forma de enterarse hasta abrirla.
         */
        for (const ruta of htmls) {
          const html = await readFile(ruta, "utf8");
          const enlazada = /<link[^>]+rel="stylesheet"/.test(html);
          const enLinea = /<style>[\s\S]{500,}?<\/style>/.test(html);
          if (!enlazada && !enLinea) {
            throw new Error(
              `${relative(raiz, ruta)} se ha generado sin hoja de estilos. ` +
                "Suele pasar al compilar con el servidor de vista previa abierto: " +
                "ciérralo, borra dist/ y vuelve a compilar.",
            );
          }
        }

        /* ---- Todas las rutas llevan la base de despliegue ----
         *
         * Las islas se compilan también para el navegador, donde `process.env`
         * no existe. Si la base se calcula con `process.env`, en el paquete de
         * cliente sale "/" y cada imagen que pinta una isla pide `/img/...` en
         * lugar de `/base/img/...`. En local no se ve, porque allí la base ya
         * es "/", así que sólo aparece una vez publicado. De ahí esta guarda.
         */
        const prefijo = base.replace(/\/$/, "");
        if (prefijo) {
          const sinBase = [];
          for await (const recurso of archivos(raiz, [".js", ".html"])) {
            const contenido = await readFile(recurso, "utf8");
            if (/["'`]\/(img|fuentes)\//.test(contenido)) sinBase.push(relative(raiz, recurso));
          }
          if (sinBase.length > 0) {
            throw new Error(
              `${sinBase.length} archivo(s) apuntan a /img/ sin la base "${prefijo}": ` +
                `${sinBase.slice(0, 3).join(", ")}. ` +
                "Suele venir de leer process.env en código que llega al navegador.",
            );
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
