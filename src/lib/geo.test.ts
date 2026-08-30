import { describe, expect, it } from "vitest";
import type { Delegacion } from "@tipos";
import { distanciaKm, formatearDistancia, masCercanas } from "./geo";

const delegacion = (nombre: string, lat: number | null, lng: number | null): Delegacion => ({
  id: nombre.toLowerCase(),
  nombre,
  direccion: "Polígono industrial",
  cp: "00000",
  ciudad: nombre,
  comunidad: "Comunidad",
  telefono: "900 230 022",
  lat,
  lng,
});

/* Coordenadas reales de la red, para poder contrastar con distancias conocidas. */
const MADRID = { lat: 40.4168, lng: -3.7038 };
const ALCALA = delegacion("Alcalá de Henares", 40.48151, -3.38635);
const ALBACETE = delegacion("Albacete", 39.02008, -1.85679);
const ALGECIRAS = delegacion("Algeciras", 36.11428, -5.47437);
const REMOTA = delegacion("Cobertura sin sede", null, null);

describe("distanciaKm", () => {
  it("da cero para el mismo punto", () => {
    expect(distanciaKm(MADRID, MADRID)).toBe(0);
  });

  it("es simétrica", () => {
    const ida = distanciaKm(MADRID, { lat: ALBACETE.lat!, lng: ALBACETE.lng! });
    const vuelta = distanciaKm({ lat: ALBACETE.lat!, lng: ALBACETE.lng! }, MADRID);
    expect(ida).toBeCloseTo(vuelta, 9);
  });

  it("acierta una distancia conocida: Madrid a Alcalá son unos 27 km", () => {
    const km = distanciaKm(MADRID, { lat: ALCALA.lat!, lng: ALCALA.lng! });
    expect(km).toBeGreaterThan(25);
    expect(km).toBeLessThan(30);
  });
});

describe("masCercanas", () => {
  it("ordena de menor a mayor distancia", () => {
    const cercanas = masCercanas([ALGECIRAS, ALBACETE, ALCALA], MADRID);
    expect(cercanas.map((d) => d.nombre)).toEqual([
      "Alcalá de Henares",
      "Albacete",
      "Algeciras",
    ]);
  });

  it("descarta las entradas que sólo son cobertura, sin coordenadas", () => {
    const cercanas = masCercanas([REMOTA, ALCALA], MADRID);
    expect(cercanas).toHaveLength(1);
    expect(cercanas[0]?.nombre).toBe("Alcalá de Henares");
  });

  it("respeta el límite pedido", () => {
    expect(masCercanas([ALGECIRAS, ALBACETE, ALCALA], MADRID, 2)).toHaveLength(2);
  });

  it("no revienta con la lista vacía", () => {
    expect(masCercanas([], MADRID)).toEqual([]);
  });
});

describe("formatearDistancia", () => {
  it("usa metros por debajo del kilómetro", () => {
    expect(formatearDistancia(0.42)).toBe("420 m");
  });

  it("conserva un decimal con coma hasta los 10 km", () => {
    expect(formatearDistancia(3.47)).toBe("3,5 km");
  });

  it("redondea a entero por encima de 10 km", () => {
    expect(formatearDistancia(27.31)).toBe("27 km");
  });
});
