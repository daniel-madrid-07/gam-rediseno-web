import { expect, test } from "@playwright/test";
import { activarSeccion, irAlCatalogo } from "./ayudas";

/**
 * Comprobaciones estructurales de accesibilidad.
 *
 * No sustituyen a probar con un lector de pantalla de verdad, pero sí atrapan
 * las regresiones que se cuelan al refactorizar: un id duplicado, un `alt` que
 * desaparece, un encabezado que se salta un nivel.
 */

test("no hay identificadores duplicados", async ({ page }) => {
  await irAlCatalogo(page);

  const repetidos = await page.evaluate(() => {
    const vistos = new Map<string, number>();
    for (const el of document.querySelectorAll("[id]")) {
      vistos.set(el.id, (vistos.get(el.id) ?? 0) + 1);
    }
    return [...vistos].filter(([, n]) => n > 1).map(([id]) => id);
  });

  expect(repetidos).toEqual([]);
});

test("todas las imágenes llevan texto alternativo", async ({ page }) => {
  await page.goto("/");
  await page.locator("#cat-results .card img").first().waitFor();

  const sinAlt = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((img) => !img.hasAttribute("alt"))
      .map((img) => img.getAttribute("src")),
  );

  expect(sinAlt).toEqual([]);
});

test("la jerarquía de encabezados no se salta niveles", async ({ page }) => {
  await irAlCatalogo(page);

  const saltos = await page.evaluate(() => {
    const niveles = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
      .filter((h) => !h.closest("dialog"))
      .map((h) => Number(h.tagName[1]));
    const fallos: string[] = [];
    for (let i = 1; i < niveles.length; i += 1) {
      const anterior = niveles[i - 1]!;
      const actual = niveles[i]!;
      if (actual > anterior + 1) fallos.push(`h${anterior} → h${actual}`);
    }
    return fallos;
  });

  expect(saltos).toEqual([]);
});

test("hay un solo h1 y describe la página", async ({ page }) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("maquinaria industrial");
});

test("se puede llegar al contenido con el enlace de salto", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Ir al contenido" })).toBeFocused();
});

test("los desplegables de la cabecera anuncian si están abiertos", async ({ page, isMobile }) => {
  test.skip(isMobile, "En móvil la navegación es el cajón lateral, no el megamenú");

  await page.goto("/");
  const boton = page.locator(".nav").getByRole("button", { name: "Maquinaria" });
  await expect(boton).toHaveAttribute("aria-expanded", "false");

  await boton.click();
  await expect(boton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mp-maq")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(boton).toHaveAttribute("aria-expanded", "false");
});

test("los campos obligatorios del formulario se marcan al enviarlo vacío", async ({ page }) => {
  await page.goto("/#contacto");
  await activarSeccion(page, "#contacto");
  await page.getByRole("button", { name: "Enviar solicitud" }).click();

  await expect(page.locator("#f-nombre")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#f-nombre")).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: /Faltan \d+ campos/ })).toBeVisible();
});

test("el formulario no finge que ha enviado nada", async ({ page }) => {
  await page.goto("/#contacto");
  await activarSeccion(page, "#contacto");
  await page.locator("#f-nombre").fill("Ana García");
  await page.locator("#f-email").fill("ana@example.com");
  await page.locator("#f-tel").fill("600123456");
  await page.locator("#f-servicio").selectOption({ index: 1 });
  await page.locator("#f-consent").check();
  await page.getByRole("button", { name: "Enviar solicitud" }).click();

  // Sin endpoint configurado tiene que decirlo, no dar un falso "enviado"
  await expect(page.getByText(/demostración y el envío no está conectado/)).toBeVisible();
});
