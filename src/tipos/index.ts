import type {
  ClaveCanal,
  ClaveEntorno,
  ClaveFamilia,
  ClaveMotor,
} from "@datos/taxonomias";

/**
 * Tipos del dominio.
 *
 * Son el contrato entre las páginas de Astro (que leen las colecciones en
 * build) y las islas de Svelte (que reciben los datos ya serializados como
 * props). Ambos lados compilan contra esto, así que un cambio en el esquema
 * rompe la compilación en los dos sitios a la vez, que es lo que se busca.
 */

/** Una familia de máquinas del catálogo, no una unidad concreta del parque. */
export interface Maquina {
  id: string;
  nombre: string;
  familia: ClaveFamilia;
  icono: string;
  descripcion: string;
  alturaMax: number;
  cargaMax: number;
  entornos: ClaveEntorno[];
  motores: ClaveMotor[];
  cero: boolean;
  canales: ClaveCanal[];
  ficha: [string, string][];
  etiquetas: string;
}

export interface Delegacion {
  id: string;
  nombre: string;
  direccion: string;
  cp: string;
  ciudad: string;
  comunidad: string;
  telefono: string;
  lat: number | null;
  lng: number | null;
}

/** Delegación con la distancia calculada desde un punto de referencia. */
export interface DelegacionCercana extends Delegacion {
  distanciaKm: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  icono: string;
  resumen: string;
  descripcion: string;
  detalle: string;
  puntos: string[];
  enlace: { texto: string; href: string; externo: boolean };
}

/** Criterios de ordenación de los resultados del catálogo. */
export type Orden = "rel" | "az" | "altura" | "carga" | "cero";

/**
 * Estado de los filtros del catálogo, que es también lo que viaja en la URL.
 *
 * Cada faceta es una lista porque se pueden marcar varias a la vez: "diésel o
 * híbrido" es una consulta legítima, y con un solo valor por faceta habría que
 * elegir. Dentro de una faceta las opciones suman (O lógico); entre facetas
 * distintas se restringen (Y lógico).
 */
export interface Filtros {
  familias: ClaveFamilia[];
  entornos: ClaveEntorno[];
  motores: ClaveMotor[];
  canales: ClaveCanal[];
  cero: boolean;
  busqueda: string;
  orden: Orden;
}

/** Facetas que se pueden excluir del examen al calcular recuentos. */
export type ClaveFaceta = "familias" | "entornos" | "motores" | "canales" | "cero";

/** Un resultado del buscador global, ya normalizado sea cual sea su origen. */
export interface Resultado {
  tipo: "maquina" | "delegacion" | "servicio" | "seccion";
  id: string;
  titulo: string;
  detalle: string;
  icono: string;
  href: string;
}

export interface Coordenadas {
  lat: number;
  lng: number;
}
