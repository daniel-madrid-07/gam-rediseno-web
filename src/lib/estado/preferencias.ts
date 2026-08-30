import { persistentMap } from "@nanostores/persistent";

/**
 * Preferencias de visualización y accesibilidad.
 *
 * Cada una se refleja como atributo `data-*` en el <html>, que es donde el CSS
 * las lee. El JavaScript no toca ni un color: sólo cambia el atributo y deja
 * que la cascada haga su trabajo. Eso mantiene los temas enteramente en CSS,
 * donde se pueden auditar de un vistazo.
 *
 * El valor "auto" del tema significa "lo que diga el sistema operativo", y se
 * representa quitando el atributo para que actúe `prefers-color-scheme`.
 */

export type Tema = "auto" | "light" | "dark";
/** Porcentaje de ampliación del texto, tal como se ofrece en el panel. */
export type Escala = "100" | "115" | "130" | "150";
export type Contraste = "normal" | "high";
export type Interruptor = "on" | "off";

export interface Preferencias extends Record<string, string> {
  tema: Tema;
  escala: Escala;
  contraste: Contraste;
  movimiento: Interruptor;
  enlaces: "auto" | "always";
  espaciado: "normal" | "wide";
}

export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  tema: "auto",
  escala: "100",
  contraste: "normal",
  movimiento: "on",
  enlaces: "auto",
  espaciado: "normal",
};

export const preferencias = persistentMap<Preferencias>(
  "gam:pref:",
  PREFERENCIAS_POR_DEFECTO,
);

/** Factor por el que se multiplica el tamaño raíz. */
const FACTOR: Record<Escala, string> = {
  "100": "1",
  "115": "1.15",
  "130": "1.3",
  "150": "1.5",
};

/**
 * A partir del 130 % la cabecera ya no cabe en una fila en pantallas medianas
 * y el CSS cambia a la versión con menú desplegable. El umbral vive aquí y no
 * en la hoja de estilos porque depende del factor, no del ancho.
 */
const ESCALA_GRANDE = 1.3;

/**
 * Vuelca las preferencias al <html>. Se llama al arrancar y en cada cambio.
 * Un atributo ausente es significativo: es lo que devuelve el control al
 * sistema operativo en vez de forzar un valor.
 */
export function aplicar(valores: Preferencias = preferencias.get()): void {
  const raiz = document.documentElement;

  if (valores.tema === "auto") raiz.removeAttribute("data-theme");
  else raiz.setAttribute("data-theme", valores.tema);

  if (valores.contraste === "high") raiz.setAttribute("data-contrast", "high");
  else raiz.removeAttribute("data-contrast");

  const factor = FACTOR[valores.escala] ?? "1";
  raiz.style.setProperty("--ui-scale", factor);
  // Al 100 % el atributo se retira, no se pone a "md": el CSS lo usa para
  // decidir cuándo la cabecera ya no cabe y pasa al menú en cajón, y dejarlo
  // puesto siempre haría desaparecer la navegación en pantallas medianas.
  if (factor === "1") raiz.removeAttribute("data-scale");
  else raiz.setAttribute("data-scale", Number(factor) >= ESCALA_GRANDE ? "lg" : "md");

  if (valores.movimiento === "off") raiz.setAttribute("data-motion", "off");
  else raiz.removeAttribute("data-motion");

  if (valores.enlaces === "always") raiz.setAttribute("data-links", "always");
  else raiz.removeAttribute("data-links");

  if (valores.espaciado === "wide") raiz.setAttribute("data-spacing", "wide");
  else raiz.removeAttribute("data-spacing");
}

export function restablecer(): void {
  preferencias.set({ ...PREFERENCIAS_POR_DEFECTO });
}

/** Suscribe el documento a los cambios. Devuelve la función para desuscribir. */
export function sincronizarDocumento(): () => void {
  aplicar();
  return preferencias.subscribe((valores) => aplicar(valores));
}
