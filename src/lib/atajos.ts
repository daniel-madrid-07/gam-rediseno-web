import { filtros } from "./estado/filtros";
import { dialogoAbierto } from "./estado/interfaz";
import type { ClaveFamilia } from "@datos/taxonomias";

/**
 * Atajos declarativos repartidos por el HTML estático.
 *
 * Los enlaces del carrusel y del megamenú llevan un `href` real con el filtro
 * en la URL, así que funcionan sin JavaScript: recargan y la página aparece
 * filtrada. Este módulo los intercepta cuando sí hay JavaScript para aplicar el
 * filtro en el sitio, sin recarga. Es mejora progresiva de verdad, no un
 * `href="#"` con un manejador encima.
 *
 * Un solo escuchador en el documento cubre todos los casos, incluidos los
 * elementos que las islas pinten después.
 */

type Manejador = (elemento: HTMLElement, evento: MouseEvent) => void;

const ATAJOS: [string, Manejador][] = [
  [
    "[data-fam]",
    (elemento, evento) => {
      const familia = elemento.dataset["fam"] as ClaveFamilia | undefined;
      if (!familia) return;
      evento.preventDefault();
      filtros.setKey("familias", [familia]);
      irA("#catalogo");
    },
  ],
  [
    "[data-goto]",
    (elemento, evento) => {
      const id = elemento.dataset["goto"];
      if (!id) return;
      evento.preventDefault();
      irA("#catalogo");
      // Tras el desplazamiento, se marca la ficha para que se vea cuál es
      window.setTimeout(() => destacarFicha(id), 320);
    },
  ],
  [
    "[data-open-wizard]",
    (_, evento) => {
      evento.preventDefault();
      dialogoAbierto.set("asistente");
    },
  ],
  [
    // Botones estáticos que sólo abren un diálogo: no merecen ser una isla
    "[data-abre]",
    (elemento, evento) => {
      const nombre = elemento.dataset["abre"];
      if (!nombre) return;
      evento.preventDefault();
      dialogoAbierto.set(nombre);
    },
  ],
  [
    "[data-service]",
    (elemento, evento) => {
      const id = elemento.dataset["service"];
      if (!id) return;
      evento.preventDefault();
      dialogoAbierto.set(`servicio:${id}`);
    },
  ],
];

function irA(selector: string): void {
  document.querySelector(selector)?.scrollIntoView({ block: "start" });
}

/** Lleva el foco a una ficha del catálogo y la deja visible. */
function destacarFicha(id: string): void {
  const ficha = document.getElementById(`maq-${id}`);
  if (!ficha) return;
  ficha.scrollIntoView({ block: "center" });
  ficha.focus();
}

export function iniciarAtajos(): () => void {
  const alPulsar = (evento: MouseEvent): void => {
    // Se respetan las combinaciones que abren en otra pestaña
    if (evento.defaultPrevented || evento.metaKey || evento.ctrlKey || evento.shiftKey) return;
    const destino = evento.target;
    if (!(destino instanceof Element)) return;

    for (const [selector, manejador] of ATAJOS) {
      const elemento = destino.closest<HTMLElement>(selector);
      if (elemento) {
        manejador(elemento, evento);
        return;
      }
    }
  };

  document.addEventListener("click", alPulsar);
  return () => document.removeEventListener("click", alPulsar);
}
