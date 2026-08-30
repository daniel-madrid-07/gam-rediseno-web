import { describe, expect, it } from "vitest";
import type { Filtros, Maquina } from "@tipos";
import {
  activos,
  alternarValor,
  consultar,
  encaja,
  FILTROS_VACIOS,
  ordenar,
  recuentos,
} from "./catalogo";

/**
 * Los casos de aquí son los que fallaban a mano en la versión anterior: el
 * conteo de facetas con dos filtros puestos, y la búsqueda de varias palabras.
 */

const maquina = (parcial: Partial<Maquina> & Pick<Maquina, "id">): Maquina => ({
  nombre: "Máquina de prueba",
  familia: "elevacion",
  icono: "m-articulada",
  descripcion: "Descripción larga de la familia para el buscador del catálogo.",
  alturaMax: 10,
  cargaMax: 200,
  entornos: ["ext"],
  motores: ["die"],
  cero: false,
  canales: ["alq"],
  ficha: [["Altura", "10 m"]],
  etiquetas: "",
  ...parcial,
});

const TIJERA = maquina({
  id: "tijera",
  nombre: "Plataformas elevadoras de tijera",
  entornos: ["int", "ext"],
  motores: ["ele", "die"],
  cero: true,
  alturaMax: 32,
  cargaMax: 1000,
  etiquetas: "scissor almacen",
});

const TELESCOPICA = maquina({
  id: "telescopica",
  nombre: "Plataformas elevadoras telescópicas",
  entornos: ["ext"],
  motores: ["die", "hib"],
  alturaMax: 58,
  cargaMax: 450,
});

const CARRETILLA = maquina({
  id: "carretilla",
  nombre: "Carretillas elevadoras",
  familia: "manutencion",
  entornos: ["int"],
  motores: ["ele", "glp"],
  cero: true,
  alturaMax: 7,
  cargaMax: 16000,
  canales: ["alq", "nue"],
});

const CATALOGO = [TIJERA, TELESCOPICA, CARRETILLA];
const con = (parcial: Partial<Filtros>): Filtros => ({ ...FILTROS_VACIOS, ...parcial });

describe("encaja", () => {
  it("no filtra nada cuando no hay filtros puestos", () => {
    expect(CATALOGO.every((m) => encaja(m, FILTROS_VACIOS))).toBe(true);
  });

  it("suma dentro de una faceta y restringe entre facetas distintas", () => {
    // Eléctrico O glp, pero además de interior: sólo la carretilla cumple ambas
    const filtros = con({ motores: ["ele", "glp"], entornos: ["int"] });
    const resultado = consultar(CATALOGO, filtros);
    expect(resultado.map((m) => m.id)).toEqual(["tijera", "carretilla"]);
  });

  it("exige todas las palabras de la búsqueda, no sólo una", () => {
    expect(encaja(TIJERA, con({ busqueda: "tijera almacen" }))).toBe(true);
    // "carretilla" no aparece en la ficha de la tijera: la búsqueda debe fallar
    expect(encaja(TIJERA, con({ busqueda: "tijera carretilla" }))).toBe(false);
  });

  it("busca sin distinguir tildes ni mayúsculas", () => {
    expect(encaja(TELESCOPICA, con({ busqueda: "TELESCOPICAS" }))).toBe(true);
    expect(encaja(TELESCOPICA, con({ busqueda: "telescópica" }))).toBe(true);
  });

  it("ignora la faceta indicada, que es de lo que viven los recuentos", () => {
    const filtros = con({ motores: ["ele"] });
    expect(encaja(TELESCOPICA, filtros)).toBe(false);
    expect(encaja(TELESCOPICA, filtros, "motores")).toBe(true);
  });
});

describe("recuentos", () => {
  it("cuenta cada opción como si sólo faltara marcarla ella", () => {
    // Con "interior" ya puesto, el recuento de motorizaciones debe reflejar
    // el interior aplicado pero no las motorizaciones ya marcadas.
    const filtros = con({ entornos: ["int"], motores: ["ele"] });
    const cuentas = recuentos(CATALOGO, filtros, "motores", ["ele", "die", "glp"] as const, (m, v) =>
      m.motores.includes(v),
    );
    expect(cuentas.ele).toBe(2); // tijera y carretilla son de interior
    expect(cuentas.die).toBe(1); // sólo la tijera es de interior y diésel
    expect(cuentas.glp).toBe(1); // sólo la carretilla
  });

  it("da cero a las opciones que dejarían la lista vacía", () => {
    const filtros = con({ familias: ["robotica"] });
    const cuentas = recuentos(CATALOGO, filtros, "entornos", ["int", "ext"] as const, (m, v) =>
      m.entornos.includes(v),
    );
    expect(cuentas.int).toBe(0);
    expect(cuentas.ext).toBe(0);
  });
});

describe("ordenar", () => {
  it("deja el orden del catálogo cuando el criterio es relevancia", () => {
    expect(ordenar(CATALOGO, "rel").map((m) => m.id)).toEqual(["tijera", "telescopica", "carretilla"]);
  });

  it("ordena por altura y por carga de mayor a menor", () => {
    expect(ordenar(CATALOGO, "altura")[0]?.id).toBe("telescopica");
    expect(ordenar(CATALOGO, "carga")[0]?.id).toBe("carretilla");
  });

  it("no altera la lista que recibe", () => {
    const original = [...CATALOGO];
    ordenar(CATALOGO, "az");
    expect(CATALOGO).toEqual(original);
  });
});

describe("activos", () => {
  it("cuenta cada valor marcado, no cada faceta", () => {
    expect(activos(FILTROS_VACIOS)).toBe(0);
    expect(activos(con({ motores: ["ele", "die"], cero: true }))).toBe(3);
  });

  it("no cuenta una búsqueda que sólo tiene espacios", () => {
    expect(activos(con({ busqueda: "   " }))).toBe(0);
  });
});

describe("alternarValor", () => {
  it("añade lo que falta y quita lo que sobra", () => {
    expect(alternarValor(["a"], "b")).toEqual(["a", "b"]);
    expect(alternarValor(["a", "b"], "a")).toEqual(["b"]);
  });
});
