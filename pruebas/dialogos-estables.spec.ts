import { expect, test } from "@playwright/test";
import { activarDialogos } from "./ayudas";

/**
 * Regresión: los diálogos no deben mover la página de detrás.
 *
 * Se reportó que los botones de «Mi selección» y «Accesibilidad» «rebotaban»
 * al pulsarlos. El motivo era una combinación de cuatro cosas, y cada una se
 * fija aquí para que no vuelva ninguna:
 *
 *  1. Los paneles encadenaban su scroll con el de la página al llegar al final.
 *  2. Al cerrar, devolver el foco al botón desplazaba la página, y con
 *     `scroll-behavior: smooth` ese regreso se veía como un salto.
 *  3. Sin `scrollbar-gutter`, aparecer y desaparecer la barra movía el
 *     maquetado unos 13 px en horizontal.
 *  4. Dos diálogos podían quedar abiertos a la vez y parpadeaban uno sobre otro.
 *  5. `content-visibility` recalculaba las secciones detrás del modal; se
 *     retiró por completo (ver `estilos/base/estados.css`).
 */

const BOTONES = [
  { id: "#btn-tray", nombre: "Mi selección" },
  { id: "#btn-a11y", nombre: "Accesibilidad" },
];

test.describe("estabilidad al abrir y cerrar", () => {
  for (const boton of BOTONES) {
    test(`${boton.nombre}: la página no se mueve al abrir ni al cerrar`, async ({ page }) => {
      await page.goto("/");
      await activarDialogos(page);

      /* Se baja a ritmo de rueda de ratón, no de un salto. Con
         `content-visibility` la altura del documento es una estimación hasta
         que cada sección se renderiza, así que un `scrollTo` a mitad de página
         se recorta y luego se corrige solo: eso pasa con diálogos y sin ellos,
         y mediría algo que no es lo reportado. */
      await page.evaluate(async () => {
        for (let y = 0; y < 3000; y += 120) {
          window.scrollTo(0, y);
          // 80 ms es lo que tarda una rueda de ratón en avanzar un paso, y da
          // tiempo a que cada sección se renderice y fije su altura real
          await new Promise((listo) => setTimeout(listo, 80));
        }
      });
      await page.waitForTimeout(700);
      const antes = await page.evaluate(() => Math.round(window.scrollY));

      /* `dispatchEvent` y no `click()`: Playwright desplaza el elemento a la
         vista antes de pulsarlo, y con la cabecera fija eso mueve la página
         por su cuenta y contamina justo lo que se quiere medir. */
      await page.locator(boton.id).dispatchEvent("click");
      await expect(page.getByRole("dialog")).toBeVisible();
      const abierto = await page.evaluate(() => Math.round(window.scrollY));

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      await page.waitForTimeout(500); // margen por si hubiera un scroll animado
      const despues = await page.evaluate(() => Math.round(window.scrollY));

      expect(abierto).toBe(antes);
      expect(despues).toBe(antes);
    });

  }

  test("abrir y cerrar diez veces seguidas no acumula desplazamiento", async ({ page }) => {
    await page.goto("/");
    await activarDialogos(page);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    const inicial = await page.evaluate(() => Math.round(window.scrollY));

    for (let vuelta = 0; vuelta < 10; vuelta += 1) {
      await page.locator("#btn-a11y").dispatchEvent("click");
      await page.keyboard.press("Escape");
    }
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(inicial);
  });

  test("el scroll de los paneles no arrastra la página", async ({ page }) => {
    await page.goto("/");
    await activarDialogos(page);
    await page.locator("#btn-a11y").click();

    const contencion = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector("dialog[open] .side__panel")!)
          .overscrollBehaviorY,
    );
    expect(contencion).toBe("contain");
  });

  test("el carril de la barra de desplazamiento está reservado siempre", async ({ page }) => {
    await page.goto("/");
    const carril = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollbarGutter,
    );
    expect(carril).toBe("stable");
  });

  test("nunca hay dos diálogos abiertos a la vez", async ({ page }) => {
    await page.goto("/");
    await activarDialogos(page);

    await page.locator("#btn-a11y").click();
    await expect(page.getByRole("dialog")).toHaveCount(1);

    /* Se fuerza la apertura del otro sin cerrar el primero, que es lo que
       pasaba al enlazar diálogos entre sí desde dentro. */
    await page.evaluate(() => document.getElementById("btn-tray")?.click());
    await page.waitForTimeout(300);

    const abiertos = await page.evaluate(
      () => document.querySelectorAll("dialog[open]").length,
    );
    expect(abiertos).toBe(1);
  });
});
