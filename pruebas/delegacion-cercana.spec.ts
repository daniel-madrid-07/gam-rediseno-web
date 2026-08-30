import { expect, test } from "@playwright/test";
import { activarSeccion } from "./ayudas";

/**
 * «¿Cuál es mi delegación?».
 *
 * Se prueban los dos caminos, porque el segundo es el que ocurre de verdad la
 * mitad de las veces: mucha gente deniega el permiso de ubicación, y lo que
 * pase entonces importa tanto como el camino feliz.
 */

/* Puerta del Sol. La delegación más cercana es la de Mercamadrid, a 7,4 km. */
const MADRID = { latitude: 40.4168, longitude: -3.7038 };

test.describe("con permiso de ubicación", () => {
  test.use({ geolocation: MADRID, permissions: ["geolocation"] });

  test("propone las tres más cercanas ordenadas por distancia", async ({ page }) => {
    await page.goto("/");
    await activarSeccion(page, "#delegaciones");

    await page.getByRole("button", { name: "Usar mi ubicación" }).click();

    const lista = page.locator(".cercanas__lista li");
    await expect(lista).toHaveCount(3);
    await expect(lista.first()).toContainText("Mercamadrid");

    /* Las distancias tienen que ir de menor a mayor */
    const kms = await page.locator(".cercanas__km").allTextContents();
    const numeros = kms.map((t) => Number(t.replace(/[^\d,]/g, "").replace(",", ".")));
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b));
  });

  test("cada propuesta ofrece llamar a esa delegación concreta", async ({ page }) => {
    await page.goto("/");
    await activarSeccion(page, "#delegaciones");
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();

    const primera = page.locator(".cercanas__lista li").first();
    await expect(primera.getByRole("link")).toHaveAttribute("href", /^tel:\+34\d{9}$/);
  });

  test("el resultado se anuncia a los lectores de pantalla", async ({ page }) => {
    await page.goto("/");
    await activarSeccion(page, "#delegaciones");
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();

    const region = page.locator(".cercanas [role=status]");
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region).toContainText("Mercamadrid");
  });
});

test.describe("sin permiso de ubicación", () => {
  test("explica qué hacer en lugar de fallar en silencio", async ({ page, context }) => {
    await context.clearPermissions();
    await context.grantPermissions([]);
    await page.goto("/");
    await activarSeccion(page, "#delegaciones");

    await page.getByRole("button", { name: "Usar mi ubicación" }).click();

    // Denegado o no disponible: en ambos casos hay que ofrecer la alternativa
    await expect(page.locator(".cercanas__aviso")).toContainText(/provincia aquí abajo/);
    // Y el buscador por nombre tiene que seguir ahí y funcionando
    await page.locator("#del-q").fill("Albacete");
    await expect(page.locator(".deleg h3").first()).toHaveText("Albacete");
  });
});

test("el bloque no pide la ubicación hasta que alguien lo pulsa", async ({ page }) => {
  let pedida = false;
  await page.addInitScript(() => {
    const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    // @ts-expect-error se marca en window para poder comprobarlo desde el test
    window.__pidioUbicacion = false;
    navigator.geolocation.getCurrentPosition = (...args) => {
      // @ts-expect-error idem
      window.__pidioUbicacion = true;
      return original(...args);
    };
  });

  await page.goto("/");
  await activarSeccion(page, "#delegaciones");
  await page.waitForTimeout(600);

  pedida = await page.evaluate(() => (window as unknown as { __pidioUbicacion: boolean }).__pidioUbicacion);
  expect(pedida).toBe(false);
});
