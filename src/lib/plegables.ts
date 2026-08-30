/**
 * Plegado de secciones según el ancho de pantalla.
 *
 * En escritorio los bloques largos están abiertos porque hay sitio de sobra;
 * en móvil se cierran para que el scroll de la página no se dispare. `open` es
 * un atributo del elemento, no algo que el CSS pueda cambiar, así que este
 * ajuste tiene que hacerse desde JavaScript.
 *
 * Sólo se ajusta al cruzar el umbral, nunca en cada `resize`: si alguien abre
 * un bloque a mano y luego gira el móvil, se respeta lo que abrió.
 */

const MOVIL = "(max-width: 47.99rem)";

export function iniciarPlegables(): () => void {
  const consulta = window.matchMedia(MOVIL);

  const aplicar = (esMovil: boolean): void => {
    const bloques = document.querySelectorAll<HTMLDetailsElement>(
      "details.mcol[data-plegable-movil]",
    );
    bloques.forEach((bloque) => {
      bloque.open = !esMovil;
    });
  };

  aplicar(consulta.matches);

  const alCruzarUmbral = (evento: MediaQueryListEvent): void => aplicar(evento.matches);
  consulta.addEventListener("change", alCruzarUmbral);

  return () => consulta.removeEventListener("change", alCruzarUmbral);
}
