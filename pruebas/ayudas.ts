import type { Page } from "@playwright/test";

/**
 * Ayudas compartidas por las pruebas.
 *
 * Astro sirve las islas ya renderizadas como HTML y las hidrata después. Entre
 * los dos momentos los controles existen, se ven y se pueden pulsar, pero no
 * responden. Cualquier prueba que interactúe con una isla tiene que esperar a
 * que esté viva, o comprueba HTML inerte y falla por el motivo equivocado.
 *
 * Astro marca las islas sin hidratar con el atributo `ssr` en su elemento
 * `<astro-island>` y lo retira al hidratarlas: eso es lo que se espera aquí.
 */

/** Lleva la sección a pantalla y espera a que sus islas estén hidratadas. */
export async function activarSeccion(pagina: Page, ancla: string): Promise<void> {
  await pagina.locator(ancla).scrollIntoViewIfNeeded();
  await pagina.waitForFunction(
    (selector) => {
      const seccion = document.querySelector(selector);
      if (!seccion) return false;
      const islas = seccion.querySelectorAll("astro-island[ssr]");
      return islas.length === 0;
    },
    ancla,
    { timeout: 15_000 },
  );
}

/** Espera a las islas del final del documento (diálogos y avisos). */
export async function activarDialogos(pagina: Page): Promise<void> {
  await pagina.waitForFunction(
    () => document.querySelectorAll("body > astro-island[ssr]").length === 0,
    undefined,
    { timeout: 15_000 },
  );
}

/** Abre la página y deja el catálogo listo para interactuar. */
export async function irAlCatalogo(pagina: Page, ruta = "/"): Promise<void> {
  await pagina.goto(ruta);
  await activarSeccion(pagina, "#catalogo");
}

/**
 * En móvil el panel de filtros arranca plegado para no comerse el scroll, así
 * que hay que abrirlo antes de poder tocar ninguna casilla.
 */
export async function abrirFiltros(pagina: Page): Promise<void> {
  const plegado = pagina.locator("details.filtros-movil");
  if ((await plegado.count()) === 0) return;
  if (await plegado.evaluate((el: HTMLDetailsElement) => el.open)) return;
  // Solo el resumen propio: dentro hay un <summary> por cada faceta
  await plegado.locator("> summary").click();
}

/**
 * Cuántas fichas entran en una página del catálogo.
 * En pantalla estrecha son menos, para que el scroll no se dispare.
 */
export const porPagina = (esMovil: boolean): number => (esMovil ? 6 : 9);

/**
 * Abre el buscador global desde donde toque.
 * En móvil el icono de la cabecera se retira y la acción vive en la barra
 * inferior, al alcance del pulgar.
 */
export async function abrirBuscador(pagina: Page, esMovil: boolean): Promise<void> {
  const boton = esMovil
    ? pagina.locator(".thumbbar").getByRole("button", { name: "Buscar" })
    : pagina.locator("#btn-search");
  await boton.click();
}
