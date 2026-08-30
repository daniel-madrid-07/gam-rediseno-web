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

/**
 * Marca el <html> mientras hay un diálogo abierto.
 *
 * Lo consume el CSS para que las secciones no recalculen su altura detrás del
 * modal (ver `estilos/base/estados.css`). Se hace con un atributo y no tocando
 * estilos desde JavaScript por la misma razón que las preferencias: la
 * decisión visual vive en la hoja de estilos, donde se puede auditar.
 *
 * Devuelve la función para desuscribirse.
 */
export function sincronizarMarcaDeDialogo(): () => void {
  return dialogoAbierto.subscribe((abierto) => {
    const raiz = document.documentElement;
    if (abierto) raiz.setAttribute("data-dialogo", abierto);
    else raiz.removeAttribute("data-dialogo");
  });
}
