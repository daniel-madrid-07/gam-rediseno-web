import { expect, test } from "@playwright/test";
import { abrirBuscador, activarDialogos, irAlCatalogo } from "./ayudas";

/**
 * La bandeja atraviesa tres islas que no se conocen entre sí: el botón de la
 * ficha, el contador de la cabecera y el diálogo. Si el estado compartido se
 * rompe, es aquí donde se nota primero.
 */

test("añadir una familia actualiza el contador de la cabecera", async ({ page }) => {
  await irAlCatalogo(page);
  const ficha = page.locator("#cat-results .card").first();

  await ficha.getByRole("button", { name: /Añadir/ }).click();

  await expect(page.locator("#btn-tray")).toHaveAttribute("aria-label", /1 equipo/);
  await expect(ficha.getByRole("button", { name: /Quitar/ })).toBeVisible();
});

test("la selección sobrevive a recargar la página", async ({ page }) => {
  await irAlCatalogo(page);
  await page.locator("#cat-results .card").first().getByRole("button", { name: /Añadir/ }).click();
  await expect(page.locator("#btn-tray")).toHaveAttribute("aria-label", /1 equipo/);

  await page.reload();
  await expect(page.locator("#btn-tray")).toHaveAttribute("aria-label", /1 equipo/);
});

test("la bandeja vacía explica qué hacer en lugar de quedarse en blanco", async ({ page }) => {
  await page.goto("/");
  await activarDialogos(page);
  await page.locator("#btn-tray").click();
  await expect(page.getByText("Todavía no has elegido nada")).toBeVisible();
});

test("el buscador global encuentra máquinas y delegaciones", async ({ page, isMobile }) => {
  await page.goto("/");
  await activarDialogos(page);
  await abrirBuscador(page, isMobile);

  const campo = page.locator("#pal-q");
  await campo.fill("tijera");
  const resultados = page.locator("#pal-out [role=option]");
  await expect(resultados.first()).toContainText("tijera");

  await campo.fill("albacete");
  await expect(resultados.first()).toContainText("Albacete");
});

test("Escape cierra el diálogo y devuelve el foco a quien lo abrió", async ({ page }) => {
  await page.goto("/");
  await activarDialogos(page);
  await page.locator("#btn-a11y").click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("#btn-a11y")).toBeFocused();
});

test("el panel de accesibilidad cambia el tema y lo recuerda", async ({ page }) => {
  await page.goto("/");
  await activarDialogos(page);
  await page.locator("#btn-a11y").click();
  // El radio real esta oculto (control segmentado): se pulsa su etiqueta
  await page.getByRole("dialog").getByText("Oscuro", { exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("el asistente propone familias y las aplica al catálogo", async ({ page }) => {
  await irAlCatalogo(page);
  await activarDialogos(page);
  await page.locator("#catalogo [data-open-wizard]").click();

  await page.getByRole("button", { name: /Subir a trabajar en altura/ }).click();
  await page.getByRole("button", { name: /En interior/ }).click();
  await page.getByRole("button", { name: /Cero emisiones/ }).click();

  await expect(page.getByRole("dialog")).toContainText("encajan con lo que necesitas");

  await page.getByRole("button", { name: /Filtrar el catálogo/ }).click();
  await expect(page).toHaveURL(/fam=elevacion/);
});
