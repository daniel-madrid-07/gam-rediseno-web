import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

/**
 * La bandeja de equipos que la persona va reuniendo para pedir presupuesto.
 *
 * Se comparte entre islas que no se conocen: el contador vive en la cabecera,
 * los botones "Añadir" en las fichas del catálogo y la lista en su diálogo.
 * Con props habría que atravesar toda la página; con un átomo compartido cada
 * isla se suscribe a lo que necesita.
 *
 * Persiste en localStorage porque quien está comparando maquinaria vuelve más
 * tarde, y perder la selección al recargar es la forma más rápida de que
 * abandone.
 */

const CLAVE = "gam:seleccion";

export const seleccion = persistentAtom<string[]>(CLAVE, [], {
  encode: JSON.stringify,
  decode: (bruto) => {
    // Un localStorage manipulado o de una versión anterior no debe tumbar la página
    try {
      const valor: unknown = JSON.parse(bruto);
      return Array.isArray(valor) ? valor.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  },
});

export const totalSeleccion = computed(seleccion, (ids) => ids.length);

export const estaSeleccionada = (id: string): boolean => seleccion.get().includes(id);

/** Añade o quita, y devuelve el estado resultante para poder avisar al usuario. */
export function alternar(id: string): boolean {
  const actual = seleccion.get();
  const dentro = actual.includes(id);
  seleccion.set(dentro ? actual.filter((x) => x !== id) : [...actual, id]);
  return !dentro;
}

export function quitar(id: string): void {
  seleccion.set(seleccion.get().filter((x) => x !== id));
}

export function vaciar(): void {
  seleccion.set([]);
}
