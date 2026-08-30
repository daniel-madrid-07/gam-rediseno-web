import { expect, test } from "@playwright/test";
import { abrirFiltros, irAlCatalogo, porPagina } from "./ayudas";

/**
 * El catálogo es la pieza con más estado de la página, y la que más se rompió
 * en la versión anterior: contadores que se quedaban a cero, filtros que no
 * limpiaban y resultados que no cuadraban con lo que decía la cabecera.
 */

test.beforeEach(async ({ page }) => {
  await irAlCatalogo(page);
  await abrirFiltros(page);
});

test("muestra las 35 familias del parque", async ({ page }) => {
  await expect(page.getByRole("status").filter({ hasText: "familias" }).first()).toContainText("35");
});

test("filtrar reduce los resultados y lo refleja en la URL", async ({ page }) => {
  await page.getByRole("checkbox", { name: /Elevación/ }).check();
  await expect(page).toHaveURL(/fam=elevacion/);
  await expect(page.locator("#cat-results .card")).toHaveCount(6);
});

test("el contador de cada faceta cuenta con el resto de filtros puestos", async ({ page }) => {
  await page.getByRole("checkbox", { name: /Elevación/ }).check();
  // "Solo cero emisiones" debe contar unicamente dentro de elevacion
  const cero = page.locator(".check").filter({ hasText: "Solo cero emisiones" });
  await expect(cero.locator(".n")).toHaveText("4");
});

test("deshabilita las opciones que dejarían la lista vacía", async ({ page }) => {
  await page.getByRole("checkbox", { name: /Robótica/ }).check();
  // Motorizacion arranca plegado: hay que desplegarlo para ver sus casillas
  await page.locator("summary", { hasText: "Motorización" }).click();
  await expect(page.getByRole("checkbox", { name: /Diésel/ })).toBeDisabled();
});

test("el botón atrás deshace el último filtro", async ({ page, isMobile }) => {
  await page.getByRole("checkbox", { name: /Elevación/ }).check();
  await expect(page.locator("#cat-results .card")).toHaveCount(6);

  await page.goBack();
  await expect(page.locator("#cat-results .card")).toHaveCount(porPagina(isMobile));
  await expect(page.getByRole("checkbox", { name: /Elevación/ })).not.toBeChecked();
});

test("una URL con filtros abre la página ya filtrada", async ({ page }) => {
  await irAlCatalogo(page, "/?fam=limpieza");
  await abrirFiltros(page);
  await expect(page.locator("#cat-results .card")).toHaveCount(3);
  await expect(page.getByRole("checkbox", { name: /Limpieza/ })).toBeChecked();
});

test("sin resultados ofrece una salida, no un callejón", async ({ page, isMobile }) => {
  await irAlCatalogo(page, "/?fam=robotica&mot=die");
  await expect(page.getByText("Sin resultados con esos filtros")).toBeVisible();

  await page.getByRole("button", { name: "Quitar todos los filtros" }).click();
  await expect(page.locator("#cat-results .card")).toHaveCount(porPagina(isMobile));
});

test("ordenar por altura pone la de mayor alcance la primera", async ({ page }) => {
  await page.getByLabel("Ordenar").selectOption("altura");
  // La de camion llega a 72 m, por encima de la telescopica de 58 m
  await expect(page.locator("#cat-results .card h3").first()).toHaveText(
    "Plataformas elevadoras sobre camión",
  );
});
