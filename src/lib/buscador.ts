import type { Delegacion, Maquina, Resultado, Servicio } from "@tipos";
import { FAMILIAS } from "@datos/taxonomias";
import { normalizar } from "./texto";

/**
 * Buscador global: máquinas, servicios, delegaciones y secciones en una lista.
 *
 * Todo se normaliza a la misma forma antes de puntuar, de modo que añadir un
 * origen nuevo (por ejemplo, los cursos) es escribir un `map`, no tocar la
 * lógica de búsqueda.
 */

/** Secciones fijas de la página, para poder saltar a ellas escribiendo. */
const SECCIONES: Resultado[] = [
  { tipo: "seccion", id: "catalogo", titulo: "Catálogo de maquinaria", detalle: "35 familias", icono: "i-search", href: "#catalogo" },
  { tipo: "seccion", id: "delegaciones", titulo: "Delegaciones en España", detalle: "54 sedes", icono: "i-pin", href: "#delegaciones" },
  { tipo: "seccion", id: "mantenimiento", titulo: "Mantenimiento", detalle: "Contratos y revisiones", icono: "v-mantenimiento", href: "#mantenimiento" },
  { tipo: "seccion", id: "formacion", titulo: "Formación homologada", detalle: "Cursos con carnet oficial", icono: "v-formacion", href: "#formacion" },
  { tipo: "seccion", id: "contacto", titulo: "Contacto y presupuesto", detalle: "Formulario y teléfono", icono: "i-mail", href: "#contacto" },
  { tipo: "seccion", id: "faq", titulo: "Preguntas frecuentes", detalle: "Plazos, carnets y coberturas", icono: "i-info", href: "#faq" },
];

export interface Fuentes {
  catalogo: readonly Maquina[];
  servicios: readonly Servicio[];
  delegaciones: readonly Delegacion[];
}

/** Aplana los cuatro orígenes a una lista homogénea con su texto de búsqueda. */
export function construirIndice(fuentes: Fuentes): [Resultado, string][] {
  const entradas: [Resultado, string][] = [];

  for (const m of fuentes.catalogo) {
    entradas.push([
      {
        tipo: "maquina",
        id: m.id,
        titulo: m.nombre,
        detalle: FAMILIAS[m.familia].nombre,
        icono: m.icono,
        href: "#catalogo",
      },
      normalizar(`${m.nombre} ${m.etiquetas} ${FAMILIAS[m.familia].nombre} ${m.descripcion}`),
    ]);
  }

  for (const s of fuentes.servicios) {
    entradas.push([
      { tipo: "servicio", id: s.id, titulo: s.nombre, detalle: s.resumen, icono: s.icono, href: "#servicios" },
      normalizar(`${s.nombre} ${s.resumen} ${s.descripcion}`),
    ]);
  }

  for (const d of fuentes.delegaciones) {
    entradas.push([
      {
        tipo: "delegacion",
        id: d.id,
        titulo: d.nombre,
        detalle: `${d.comunidad} · ${d.telefono}`,
        icono: "i-pin",
        href: "#delegaciones",
      },
      normalizar(`${d.nombre} ${d.ciudad} ${d.comunidad} ${d.cp}`),
    ]);
  }

  for (const seccion of SECCIONES) {
    entradas.push([seccion, normalizar(`${seccion.titulo} ${seccion.detalle}`)]);
  }

  return entradas;
}

/**
 * Puntúa una coincidencia.
 *
 * Lo que empieza por lo tecleado va antes que lo que sólo lo contiene, porque
 * quien escribe "carre" está buscando "carretilla" y no "kit para carretilla".
 * A igualdad, mandan las máquinas: son lo que más se busca en este sitio.
 */
const PESO_TIPO: Record<Resultado["tipo"], number> = {
  maquina: 3,
  seccion: 2,
  servicio: 1,
  delegacion: 0,
};

function puntuar(texto: string, aguja: string, tipo: Resultado["tipo"]): number {
  const posicion = texto.indexOf(aguja);
  if (posicion === -1) return -1;
  const proximidad = posicion === 0 ? 100 : Math.max(0, 40 - posicion);
  return proximidad + PESO_TIPO[tipo];
}

export function buscar(
  indice: readonly [Resultado, string][],
  consulta: string,
  limite = 12,
): Resultado[] {
  const aguja = normalizar(consulta.trim());
  if (aguja.length < 2) return [];

  return indice
    .map(([resultado, texto]) => ({ resultado, punto: puntuar(texto, aguja, resultado.tipo) }))
    .filter((x) => x.punto >= 0)
    .sort((a, b) => b.punto - a.punto)
    .slice(0, limite)
    .map((x) => x.resultado);
}
