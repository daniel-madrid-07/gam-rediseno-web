/**
 * Animación de las cifras corporativas.
 *
 * Sólo arranca cuando la cifra entra en pantalla, y respeta la preferencia de
 * movimiento reducido saltando directamente al valor final. El HTML ya trae el
 * número correcto escrito, así que si algo de esto falla la página se queda con
 * la cifra buena en vez de con un cero, que es lo que le pasaba a la web
 * anterior cuando el script no llegaba a ejecutarse.
 */

const UMBRAL_VISIBLE = 0.4;
const DURACION_MS = 1100;

/** ¿Ha pedido esta persona que no se mueva nada? */
export function prefiereQuietud(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.getAttribute("data-motion") === "off"
  );
}

const formateador = new Intl.NumberFormat("es-ES");

function formatear(elemento: HTMLElement, valor: number): string {
  const prefijo = elemento.dataset["prefix"] ?? "";
  const sufijo = elemento.dataset["suffix"];
  const cuerpo = formateador.format(Math.round(valor));
  return `${prefijo}${cuerpo}${sufijo ? ` ${sufijo}` : ""}`;
}

function contar(elemento: HTMLElement): void {
  const meta = Number(elemento.dataset["count"]);
  if (!Number.isFinite(meta)) return;

  if (prefiereQuietud()) {
    elemento.textContent = formatear(elemento, meta);
    return;
  }

  const inicio = performance.now();
  const paso = (ahora: number): void => {
    const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
    // Cúbica de salida: arranca rápido y frena al final, como un cuentakilómetros
    const suavizado = 1 - Math.pow(1 - avance, 3);
    elemento.textContent = formatear(elemento, meta * suavizado);
    if (avance < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

export function animarCifras(): void {
  const cifras = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
  if (cifras.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    cifras.forEach((cifra) => contar(cifra));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        contar(entrada.target as HTMLElement);
        observador.unobserve(entrada.target);
      }
    },
    { threshold: UMBRAL_VISIBLE },
  );

  cifras.forEach((cifra) => observador.observe(cifra));
}

/**
 * Aparición escalonada de una lista de elementos al entrar en pantalla.
 * El retardo entre uno y otro es corto: lo justo para que se lea como una
 * secuencia y no como una lista que tarda en cargar.
 */
export function revelarEnCascada(selectorContenedor: string, selectorHijos: string): void {
  const contenedores = document.querySelectorAll<HTMLElement>(selectorContenedor);
  if (contenedores.length === 0 || !("IntersectionObserver" in window)) return;

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      const hijos = entrada.target.querySelectorAll<HTMLElement>(selectorHijos);
      const quieto = prefiereQuietud();
      hijos.forEach((hijo, indice) => {
        hijo.classList.add("reveal");
        setTimeout(() => hijo.setAttribute("data-in", "true"), quieto ? 0 : indice * 55);
      });
      observador.unobserve(entrada.target);
    }
  });

  contenedores.forEach((contenedor) => observador.observe(contenedor));
}
