/**
 * Menús desplegables de la cabecera, con el patrón «disclosure» de la WAI.
 *
 * No es un menubar: los paneles contienen enlaces normales agrupados, y el
 * patrón de menú de aplicación (con navegación por flechas dentro y foco
 * atrapado) confundiría a quien use lector de pantalla, porque promete un menú
 * de comandos donde hay una lista de enlaces. Botón que expande, Escape que
 * cierra, y flechas sólo para moverse entre los botones de la barra.
 */

const ABIERTO = "true";

export function iniciarMegaMenus(): () => void {
  const botones = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".nav__item[data-mega]"),
  );
  if (botones.length === 0) return () => {};

  const panelDe = (boton: HTMLButtonElement): HTMLElement | null =>
    document.getElementById(boton.dataset["mega"] ?? "");

  function cerrarTodos(salvo?: HTMLButtonElement): void {
    for (const boton of botones) {
      if (boton === salvo) continue;
      boton.setAttribute("aria-expanded", "false");
      const panel = panelDe(boton);
      if (panel) panel.hidden = true;
    }
  }

  const limpiezas: Array<() => void> = [];
  const escuchar = <T extends Event>(
    destino: EventTarget,
    tipo: string,
    manejador: (evento: T) => void,
  ): void => {
    const envoltorio = manejador as EventListener;
    destino.addEventListener(tipo, envoltorio);
    limpiezas.push(() => destino.removeEventListener(tipo, envoltorio));
  };

  botones.forEach((boton, indice) => {
    const panel = panelDe(boton);
    if (!panel) return;

    escuchar(boton, "click", () => {
      const estaba = boton.getAttribute("aria-expanded") === ABIERTO;
      cerrarTodos(boton);
      boton.setAttribute("aria-expanded", String(!estaba));
      panel.hidden = estaba;
    });

    escuchar<KeyboardEvent>(boton, "keydown", (evento) => {
      const total = botones.length;
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        botones[(indice + 1) % total]?.focus();
      }
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        botones[(indice - 1 + total) % total]?.focus();
      }
      // Bajar al panel sólo tiene sentido si está desplegado
      if (evento.key === "ArrowDown" && boton.getAttribute("aria-expanded") === ABIERTO) {
        evento.preventDefault();
        panel.querySelector<HTMLElement>("a, button")?.focus();
      }
    });

    escuchar<KeyboardEvent>(panel, "keydown", (evento) => {
      if (evento.key !== "Escape") return;
      // Que no lo capture también el cierre global y se pierda el foco
      evento.stopPropagation();
      cerrarTodos();
      boton.focus();
    });
  });

  escuchar<KeyboardEvent>(document, "keydown", (evento) => {
    if (evento.key === "Escape") cerrarTodos();
  });

  // El menú se cierra al salir de él, tanto con el ratón como con el tabulador
  const fuera = (evento: Event): boolean => {
    const destino = evento.target;
    if (!(destino instanceof Element)) return true;
    return !destino.closest(".nav") && !destino.closest(".mega");
  };
  escuchar(document, "click", (evento: Event) => {
    if (fuera(evento)) cerrarTodos();
  });
  escuchar(document, "focusin", (evento: Event) => {
    if (fuera(evento)) cerrarTodos();
  });

  return () => limpiezas.forEach((limpiar) => limpiar());
}
