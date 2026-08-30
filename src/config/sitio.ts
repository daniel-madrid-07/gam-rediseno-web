/**
 * Configuración de despliegue y datos de la empresa.
 *
 * IMPORTANTE: aquí NO se puede leer `process.env`. Este módulo lo importan
 * las islas de Svelte, que se compilan también para el navegador, y allí
 * `process` no existe: la comprobación salía siempre falsa, la base quedaba
 * en "/" y todas las imágenes que pinta una isla pedían `/img/...` en lugar
 * de `/gam-rediseno-web/img/...`. En local no se notaba, porque allí la base
 * es "/" de todas formas; en producción se veían las tarjetas en gris.
 *
 * `import.meta.env` sí lo sustituye Vite en los dos paquetes, y `BASE_URL` lo
 * rellena Astro con la base configurada, así que no puede desincronizarse.
 */

/** Astro garantiza que coincide con `base` de astro.config.mjs. */
const BASE = import.meta.env.BASE_URL || "/";

/** Las variables con prefijo PUBLIC_ son las que Astro expone al cliente. */
const enPaginasGitHub = import.meta.env["PUBLIC_DESPLIEGUE"] === "github";

export const SITIO = {
  origen: enPaginasGitHub
    ? "https://daniel-madrid-07.github.io"
    : "https://gamrentals.com",
  base: BASE,

  /** La vista previa no debe competir en buscadores con el sitio oficial. */
  indexable: !enPaginasGitHub,

  idioma: "es-ES",
  nombre: "GAM",
  nombreLargo: "General de Alquiler de Maquinaria",
  titulo: "Alquiler de maquinaria industrial en España · GAM Soluciones",
  descripcion:
    "Alquiler, venta y mantenimiento de maquinaria de elevación, manutención, manipulación y energía. Más de 40.000 equipos y 54 delegaciones en España.",
} as const;

export const EMPRESA = {
  telefono: "900 230 022",
  telefonoE164: "+34900230022",
  sitioOficial: "https://gamrentals.com",
  equipos: 40000,
  delegaciones: 54,
  tecnicos: 600,
  talleresMoviles: 300,

  filiales: {
    online: "https://online.gamrentals.com",
    inquieto: "https://soyinquieto.com",
    audiovisuales: "https://gamaudiovisuales.com",
  },
} as const;

/** Une la base de despliegue con una ruta interna sin duplicar barras. */
export function ruta(camino: string): string {
  const base = SITIO.base.replace(/\/$/, "");
  const limpio = camino.startsWith("/") ? camino : `/${camino}`;
  return `${base}${limpio}` || "/";
}
