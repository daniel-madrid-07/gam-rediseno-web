import type { Delegacion, Maquina, Servicio } from "@tipos";
import type { ClaveEntorno, ClaveFamilia } from "@datos/taxonomias";

/**
 * Recortes del catálogo a medida de cada isla.
 *
 * Astro serializa las props de cada isla dentro del HTML, así que pasar el
 * catálogo entero a las cinco islas que lo tocan significa mandar cinco copias
 * de los mismos 33 KB al navegador. Aquí cada consumidor recibe sólo los campos
 * que de verdad lee: el HTML baja de 433 KB a poco más de 200 sin perder nada.
 *
 * Si una isla necesita un campo nuevo, se añade aquí y el tipo hace que falle
 * la compilación donde haga falta, en lugar de llegar `undefined` al navegador.
 */

/** Lo mínimo para nombrar una familia en una lista. */
export interface MaquinaBreve {
  id: string;
  nombre: string;
  familia: ClaveFamilia;
  icono: string;
}

export const aBreve = (m: Maquina): MaquinaBreve => ({
  id: m.id,
  nombre: m.nombre,
  familia: m.familia,
  icono: m.icono,
});

export const catalogoBreve = (catalogo: readonly Maquina[]): MaquinaBreve[] =>
  catalogo.map(aBreve);

/** Lo que necesita el asistente: filtrar por tres criterios y enseñar un dato. */
export interface MaquinaSugerible extends MaquinaBreve {
  entornos: ClaveEntorno[];
  cero: boolean;
  /** Sólo la primera fila de la ficha técnica, que es la que se muestra. */
  dato: [string, string] | null;
}

export const catalogoSugerible = (catalogo: readonly Maquina[]): MaquinaSugerible[] =>
  catalogo.map((m) => ({
    ...aBreve(m),
    entornos: m.entornos,
    cero: m.cero,
    dato: m.ficha[0] ?? null,
  }));

/**
 * Filtra las sugerencias del asistente.
 *
 * Función aparte y no `consultar()` del catálogo: el asistente trabaja con
 * máquinas recortadas, que no llevan motorización ni canal ni descripción.
 * Pasárselas a la función general compilaría por los pelos y se apoyaría en
 * que esos filtros vienen vacíos, que es justo el tipo de suposición que se
 * rompe el día que alguien añada un cuarto paso.
 */
export function sugerir(
  catalogo: readonly MaquinaSugerible[],
  criterios: { familia: string; entorno: string; cero: boolean },
): MaquinaSugerible[] {
  return catalogo.filter((m) => {
    if (criterios.familia && m.familia !== criterios.familia) return false;
    if (criterios.entorno && !(m.entornos as string[]).includes(criterios.entorno)) return false;
    if (criterios.cero && !m.cero) return false;
    return true;
  });
}

/** Sólo el nombre: para componer el mensaje del formulario. */
export interface MaquinaNombrada {
  id: string;
  nombre: string;
}

export const catalogoNombrado = (catalogo: readonly Maquina[]): MaquinaNombrada[] =>
  catalogo.map((m) => ({ id: m.id, nombre: m.nombre }));

/** Sólo lo que pinta la lista de delegaciones; se descarta nada más. */
export const delegacionesVisibles = (delegaciones: readonly Delegacion[]): Delegacion[] => [
  ...delegaciones,
];

/** El servicio sin sus textos largos, que el buscador no muestra. */
export interface ServicioBreve {
  id: string;
  nombre: string;
  icono: string;
  resumen: string;
}

export const serviciosBreves = (servicios: readonly Servicio[]): ServicioBreve[] =>
  servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    icono: s.icono,
    resumen: s.resumen,
  }));
