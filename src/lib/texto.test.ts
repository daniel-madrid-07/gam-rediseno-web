import { describe, expect, it } from "vitest";
import { enumerar, identificador, normalizar, numero, plural, resaltar } from "./texto";

describe("normalizar", () => {
  it("quita tildes y baja a minúsculas", () => {
    expect(normalizar("Alcalá de Henares")).toBe("alcala de henares");
    expect(normalizar("TELESCÓPICA")).toBe("telescopica");
  });

  it("también reduce la eñe, para que 'canon' encuentre 'cañón'", () => {
    // Es deliberado: en un buscador la tolerancia gana a la corrección
    // ortográfica, y casi nadie escribe la eñe al teclear deprisa.
    expect(normalizar("Cañón de calor")).toBe("canon de calor");
  });

  it("trata null y undefined como cadena vacía", () => {
    expect(normalizar(null)).toBe("");
    expect(normalizar(undefined)).toBe("");
  });
});

describe("identificador", () => {
  it("produce algo válido para una URL", () => {
    expect(identificador("Alcalá de Henares")).toBe("alcala-de-henares");
    expect(identificador("Papel, cartón y reciclaje")).toBe("papel-carton-y-reciclaje");
    expect(identificador("Cañón de calor")).toBe("canon-de-calor");
  });

  it("no deja guiones sueltos en los extremos", () => {
    expect(identificador("  ¡Energía!  ")).toBe("energia");
  });
});

describe("enumerar", () => {
  it("une con comas y una ye final", () => {
    expect(enumerar(["Hyster", "Yale", "XCMG"])).toBe("Hyster, Yale y XCMG");
    expect(enumerar(["Hyster", "Yale"])).toBe("Hyster y Yale");
    expect(enumerar(["Hyster"])).toBe("Hyster");
    expect(enumerar([])).toBe("");
  });
});

describe("plural", () => {
  it("elige según la cantidad", () => {
    expect(plural(1, "familia", "familias")).toBe("familia");
    expect(plural(0, "familia", "familias")).toBe("familias");
    expect(plural(35, "familia", "familias")).toBe("familias");
  });
});

describe("numero", () => {
  it("usa el punto como separador de miles", () => {
    expect(numero(40000)).toBe("40.000");
  });
});

describe("resaltar", () => {
  it("devuelve el texto entero sin marcar cuando no hay consulta", () => {
    expect(resaltar("Carretilla elevadora", "")).toEqual([
      { texto: "Carretilla elevadora", marcado: false },
    ]);
  });

  it("marca la coincidencia conservando las tildes del original", () => {
    expect(resaltar("Plataforma telescópica", "telescopica")).toEqual([
      { texto: "Plataforma ", marcado: false },
      { texto: "telescópica", marcado: true },
    ]);
  });

  it("marca todas las apariciones", () => {
    const tramos = resaltar("grúa y grúa", "grua");
    expect(tramos.filter((t) => t.marcado)).toHaveLength(2);
  });

  it("recompone el texto original al concatenar los tramos", () => {
    const original = "Manipuladores telescópicos y plataformas";
    const recompuesto = resaltar(original, "telescopicos").map((t) => t.texto).join("");
    expect(recompuesto).toBe(original);
  });
});
