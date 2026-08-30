import { map } from "nanostores";
import type { Filtros, Orden } from "@tipos";
import { FILTROS_VACIOS } from "@lib/catalogo";
import {
  CLAVES_CANAL,
  CLAVES_ENTORNO,
  CLAVES_FAMILIA,
  CLAVES_MOTOR,
} from "@datos/taxonomias";

/**
 * Filtros del catálogo, sincronizados con la barra de direcciones.
 *
 * Que el estado viva en la URL no es un adorno: es lo que hace que se pueda
 * mandar por WhatsApp «las tijeras eléctricas de interior» en vez de explicar
 * qué botones hay que pulsar, y lo que hace que el botón atrás del móvil
 * deshaga un filtro en lugar de sacarte de la web.
 */

export const filtros = map<Filtros>({ ...FILTROS_VACIOS });

/** Nombres cortos en la URL: se ven, así que conviene que no sean feos. */
const PARAMETROS = {
  familias: "fam",
  entornos: "ent",
  motores: "mot",
  canales: "can",
  cero: "cero",
  busqueda: "q",
  orden: "orden",
} as const satisfies Record<keyof Filtros, string>;

const ORDENES: readonly Orden[] = ["rel", "az", "altura", "carga", "cero"];

const LISTAS = {
  familias: CLAVES_FAMILIA as readonly string[],
  entornos: CLAVES_ENTORNO as readonly string[],
  motores: CLAVES_MOTOR as readonly string[],
  canales: CLAVES_CANAL as readonly string[],
} as const;

type ClaveLista = keyof typeof LISTAS;

/** Lee los filtros de una query string, descartando lo que no reconoce. */
export function desdeUrl(busqueda: string): Filtros {
  const p = new URLSearchParams(busqueda);

  const leerLista = <K extends ClaveLista>(clave: K): Filtros[K] => {
    const bruto = p.get(PARAMETROS[clave]);
    if (!bruto) return [] as Filtros[K];
    const validos = LISTAS[clave];
    return bruto.split(",").filter((v) => validos.includes(v)) as Filtros[K];
  };

  const orden = p.get(PARAMETROS.orden);

  return {
    familias: leerLista("familias"),
    entornos: leerLista("entornos"),
    motores: leerLista("motores"),
    canales: leerLista("canales"),
    cero: p.get(PARAMETROS.cero) === "1",
    busqueda: p.get(PARAMETROS.busqueda) ?? "",
    orden: ORDENES.includes(orden as Orden) ? (orden as Orden) : "rel",
  };
}

/** Serializa sólo lo que está puesto: una URL sin ruido se comparte mejor. */
export function aUrl(valores: Filtros): string {
  const p = new URLSearchParams();
  if (valores.familias.length) p.set(PARAMETROS.familias, valores.familias.join(","));
  if (valores.entornos.length) p.set(PARAMETROS.entornos, valores.entornos.join(","));
  if (valores.motores.length) p.set(PARAMETROS.motores, valores.motores.join(","));
  if (valores.canales.length) p.set(PARAMETROS.canales, valores.canales.join(","));
  if (valores.cero) p.set(PARAMETROS.cero, "1");
  if (valores.busqueda.trim()) p.set(PARAMETROS.busqueda, valores.busqueda.trim());
  if (valores.orden !== "rel") p.set(PARAMETROS.orden, valores.orden);
  const texto = p.toString();
  return texto ? `?${texto}` : "";
}

export function limpiar(): void {
  filtros.set({ ...FILTROS_VACIOS });
}

/**
 * Enlaza el átomo con la barra de direcciones en ambos sentidos.
 * Devuelve la función de desuscripción, que la isla llama al desmontarse.
 */
export function sincronizarUrl(): () => void {
  let aplicandoDesdeUrl = false;
  let ultimaBusqueda = "";

  const inicial = desdeUrl(window.location.search);
  filtros.set(inicial);
  ultimaBusqueda = inicial.busqueda;

  const alCambiar = (valores: Filtros): void => {
    if (aplicandoDesdeUrl) return;

    const actual = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const destino = `${window.location.pathname}${aUrl(valores)}${window.location.hash}`;
    if (destino === actual) return;

    // Teclear no debe llenar el historial; tocar una faceta sí deja rastro
    const soloCambioElTexto = valores.busqueda !== ultimaBusqueda;
    ultimaBusqueda = valores.busqueda;
    window.history[soloCambioElTexto ? "replaceState" : "pushState"](null, "", destino);
  };

  const alNavegar = (): void => {
    aplicandoDesdeUrl = true;
    const valores = desdeUrl(window.location.search);
    filtros.set(valores);
    ultimaBusqueda = valores.busqueda;
    aplicandoDesdeUrl = false;
  };

  const desuscribir = filtros.listen(alCambiar);
  window.addEventListener("popstate", alNavegar);

  return () => {
    desuscribir();
    window.removeEventListener("popstate", alNavegar);
  };
}
