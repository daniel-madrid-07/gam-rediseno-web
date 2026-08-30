import { atom } from "nanostores";

/**
 * Estado efímero de la interfaz: avisos y diálogo abierto.
 *
 * No persiste y no va a la URL. Vive en un átomo porque cualquier isla necesita
 * poder lanzar un aviso ("Añadido a tu selección") sin conocer al componente
 * que lo pinta.
 */

export interface Aviso {
  id: number;
  texto: string;
  tono: "neutro" | "ok" | "error";
}

export const aviso = atom<Aviso | null>(null);

let contador = 0;
let temporizador: ReturnType<typeof setTimeout> | undefined;

/** Muestra un aviso durante unos segundos. Uno nuevo reemplaza al anterior. */
export function avisar(texto: string, tono: Aviso["tono"] = "neutro"): void {
  contador += 1;
  aviso.set({ id: contador, texto, tono });
  clearTimeout(temporizador);
  // Suficiente para leer una frase corta sin quedarse estorbando en pantalla
  temporizador = setTimeout(() => aviso.set(null), 4200);
}

/** Identificador del diálogo abierto, o null. Sólo puede haber uno a la vez. */
export const dialogoAbierto = atom<string | null>(null);
