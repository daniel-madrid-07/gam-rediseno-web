import type { ClaveFaceta, Filtros, Maquina, Orden } from "@tipos";
import { FAMILIAS } from "@datos/taxonomias";
import { normalizar } from "./texto";

/**
 * Filtrado y ordenación del catálogo.
 *
 * Funciones puras a propósito: reciben la lista y los filtros, devuelven una
 * lista nueva. El mismo código sirve para pintar en el navegador, para generar
 * páginas en build y para los tests, sin que haya tres versiones de la misma
 * regla acabando por divergir.
 */

export const FILTROS_VACIOS: Filtros = {
  familias: [],
  entornos: [],
  motores: [],
  canales: [],
  cero: false,
  busqueda: "",
  orden: "rel",
};

/** Texto contra el que busca el catálogo, incluyendo el nombre de la familia. */
const indiceDe = (m: Maquina): string =>
  normalizar(`${m.nombre} ${m.descripcion} ${m.etiquetas} ${FAMILIAS[m.familia].nombre}`);

/**
 * Todas las palabras tienen que aparecer, no basta con una.
 *
 * Quien escribe "tijera electrica" quiere las dos cosas a la vez; si bastara
 * con que apareciera cualquiera de las dos, saldría medio catálogo y la
 * búsqueda dejaría de servir en cuanto se afina.
 */
function coincideTexto(maquina: Maquina, consulta: string): boolean {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;
  const heno = indiceDe(maquina);
  return palabras.every((palabra) => heno.includes(palabra));
}

/** Una faceta vacía no filtra; con valores, basta con que coincida uno. */
const algunoDe = <T>(seleccion: readonly T[], tiene: readonly T[]): boolean =>
  seleccion.length === 0 || tiene.some((valor) => seleccion.includes(valor));

/**
 * ¿Pasa esta máquina los filtros?
 *
 * `ignorar` deja fuera una faceta concreta del examen. Lo necesitan los
 * recuentos: para saber cuántos resultados daría marcar "Diésel" hay que contar
 * aplicando todo lo demás pero no la motorización, que es justo lo que se está
 * evaluando. Sin esto los contadores mienten en cuanto hay dos filtros puestos.
 */
export function encaja(maquina: Maquina, filtros: Filtros, ignorar?: ClaveFaceta): boolean {
  if (!coincideTexto(maquina, filtros.busqueda)) return false;

  if (ignorar !== "familias" && !algunoDe(filtros.familias, [maquina.familia])) return false;
  if (ignorar !== "entornos" && !algunoDe(filtros.entornos, maquina.entornos)) return false;
  if (ignorar !== "motores" && !algunoDe(filtros.motores, maquina.motores)) return false;
  if (ignorar !== "canales" && !algunoDe(filtros.canales, maquina.canales)) return false;
  if (ignorar !== "cero" && filtros.cero && !maquina.cero) return false;

  return true;
}

const COMPARADORES: Record<Orden, (a: Maquina, b: Maquina) => number> = {
  // "Relevancia" es el orden del catálogo, agrupado por familia. No se ordena.
  rel: () => 0,
  az: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  altura: (a, b) => b.alturaMax - a.alturaMax,
  carga: (a, b) => b.cargaMax - a.cargaMax,
  cero: (a, b) => Number(b.cero) - Number(a.cero),
};

export function ordenar(lista: readonly Maquina[], orden: Orden): Maquina[] {
  return [...lista].sort(COMPARADORES[orden]);
}

/** Filtra y ordena en un paso, que es como lo consume la interfaz. */
export function consultar(catalogo: readonly Maquina[], filtros: Filtros): Maquina[] {
  return ordenar(
    catalogo.filter((m) => encaja(m, filtros)),
    filtros.orden,
  );
}

/**
 * Cuántos resultados daría cada valor de una faceta con el resto de filtros
 * aplicados. Es lo que permite deshabilitar las opciones que no llevan a
 * ningún sitio, en vez de dejar que alguien llegue a una lista vacía.
 */
export function recuentos<T extends string>(
  catalogo: readonly Maquina[],
  filtros: Filtros,
  faceta: ClaveFaceta,
  valores: readonly T[],
  pertenece: (m: Maquina, valor: T) => boolean,
): Record<T, number> {
  const base = catalogo.filter((m) => encaja(m, filtros, faceta));
  const salida = {} as Record<T, number>;
  for (const valor of valores) {
    salida[valor] = base.filter((m) => pertenece(m, valor)).length;
  }
  return salida;
}

/** Cuántas facetas hay puestas. Alimenta el contador de "filtros activos". */
export function activos(filtros: Filtros): number {
  return (
    filtros.familias.length +
    filtros.entornos.length +
    filtros.motores.length +
    filtros.canales.length +
    (filtros.cero ? 1 : 0) +
    (filtros.busqueda.trim() ? 1 : 0)
  );
}

/** Añade o quita un valor de una faceta, devolviendo una lista nueva. */
export function alternarValor<T>(lista: readonly T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];
}
