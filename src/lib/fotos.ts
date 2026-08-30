import ALTERNATIVOS from "@datos/fotos.json";
import { SITIO } from "@/config/sitio";

/**
 * Rutas y textos alternativos de las fotografías del parque.
 *
 * Lo usan tanto las plantillas de Astro como las islas de Svelte, así que vive
 * en `lib` y no en un componente. El texto alternativo sale siempre de aquí:
 * una misma máquina se describe igual en la ficha, en la bandeja y en el
 * carrusel, que es lo que espera quien navega con lector de pantalla.
 */

const CATALOGO = ALTERNATIVOS as Record<string, string>;
const BASE = SITIO.base.replace(/\/$/, "");

export const hayFoto = (id: string): boolean => id in CATALOGO;

export const textoAlternativo = (id: string, respaldo = ""): string =>
  CATALOGO[id] ?? respaldo;

export interface Fuente {
  src: string;
  srcset: string;
}

/** Los archivos existen en dos anchos: 420 px (`-s`) y 800 px (`-m`). */
export function fuente(id: string): Fuente {
  return {
    src: `${BASE}/img/${id}-m.webp`,
    srcset: `${BASE}/img/${id}-s.webp 420w, ${BASE}/img/${id}-m.webp 800w`,
  };
}

/** Foto que representa a una familia entera en el carrusel de portada. */
export const FOTO_DE_FAMILIA: Record<string, string> = {
  elevacion: "plat-tijera",
  manipulacion: "telehandler",
  manutencion: "carretilla-elevadora",
  energia: "grupo-pequeno",
  limpieza: "fregadora",
  modular: "caseta-obra",
  robotica: "agv-palet",
};
