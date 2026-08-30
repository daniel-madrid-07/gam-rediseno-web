/**
 * Manipulación de texto para búsqueda y presentación.
 *
 * Todo lo que se compara con lo que teclea una persona pasa por `normalizar`:
 * quien busca "plataforma articulada" no escribe la tilde de "artículada" ni le
 * importan las mayúsculas, y quien busca "Alcalá" espera encontrarla escribiendo
 * "alcala". Comparar sin normalizar es la causa clásica de "no hay resultados"
 * cuando el resultado está delante.
 */

/** Minúsculas y sin diacríticos, para comparar de forma tolerante. */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Convierte un texto libre en un identificador válido para URL. */
export function identificador(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Une elementos en lenguaje natural: "a, b y c". */
export function enumerar(partes: readonly string[]): string {
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0]!;
  return `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}`;
}

/** Singular o plural según la cantidad, sin repetir el ternario por todas partes. */
export function plural(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

/** Formatea un número con el separador de miles español. */
const formateador = new Intl.NumberFormat("es-ES");
export const numero = (n: number): string => formateador.format(n);

/**
 * Trocea un texto marcando las coincidencias con la consulta.
 * Devuelve tramos en vez de HTML para que quien pinte decida cómo resaltar,
 * y de paso no haya que inyectar HTML sin escapar en ningún sitio.
 */
export interface Tramo {
  texto: string;
  marcado: boolean;
}

export function resaltar(texto: string, consulta: string): Tramo[] {
  const aguja = normalizar(consulta);
  if (!aguja) return [{ texto, marcado: false }];

  const pajar = normalizar(texto);
  const tramos: Tramo[] = [];
  let cursor = 0;

  for (;;) {
    const encontrado = pajar.indexOf(aguja, cursor);
    if (encontrado === -1) break;
    if (encontrado > cursor) {
      tramos.push({ texto: texto.slice(cursor, encontrado), marcado: false });
    }
    tramos.push({
      texto: texto.slice(encontrado, encontrado + aguja.length),
      marcado: true,
    });
    cursor = encontrado + aguja.length;
  }

  if (cursor < texto.length) {
    tramos.push({ texto: texto.slice(cursor), marcado: false });
  }
  return tramos;
}
