/**
 * Configuración de despliegue y datos de la empresa.
 *
 * `origen` y `base` cambian según dónde se publique: GitHub Pages sirve el
 * sitio bajo un subdirectorio, un dominio propio lo sirve en la raíz. Todo lo
 * demás del proyecto lee de aquí para no repartir URLs por el código.
 */

const enPaginasGitHub = process.env["DESPLIEGUE"] === "github";

export const SITIO = {
  origen: enPaginasGitHub
    ? "https://daniel-madrid-07.github.io"
    : "https://gamrentals.com",
  base: enPaginasGitHub ? "/gam-rediseno-web" : "/",

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
