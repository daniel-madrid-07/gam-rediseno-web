import type { Coordenadas, Delegacion, DelegacionCercana } from "@tipos";

/**
 * Cálculo de distancias sobre la red de delegaciones.
 *
 * Las 54 delegaciones traen latitud y longitud, así que la pregunta "¿cuál me
 * pilla más cerca?" se responde en el navegador sin llamar a ningún servicio de
 * mapas: ni clave de API, ni coste por consulta, ni la posición del cliente
 * saliendo del dispositivo.
 */

const RADIO_TIERRA_KM = 6371;
const aRadianes = (grados: number): number => (grados * Math.PI) / 180;

/**
 * Distancia del círculo máximo entre dos puntos, en kilómetros.
 *
 * Haversine trata la Tierra como una esfera. Sobre distancias peninsulares el
 * error frente al elipsoide real es de unas décimas de porcentaje, y aquí sólo
 * se usa para ordenar delegaciones y dar una cifra orientativa.
 */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const senoLat = Math.sin(dLat / 2);
  const senoLng = Math.sin(dLng / 2);

  const h =
    senoLat * senoLat +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * senoLng * senoLng;

  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Se descartan las que no tienen coordenadas: hay entradas de sola cobertura. */
const conCoordenadas = (
  d: Delegacion,
): d is Delegacion & { lat: number; lng: number } => d.lat !== null && d.lng !== null;

/** Las `limite` delegaciones más cercanas a un punto, de menor a mayor distancia. */
export function masCercanas(
  delegaciones: readonly Delegacion[],
  desde: Coordenadas,
  limite = 3,
): DelegacionCercana[] {
  return delegaciones
    .filter(conCoordenadas)
    .map((d) => ({ ...d, distanciaKm: distanciaKm(desde, { lat: d.lat, lng: d.lng }) }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, limite);
}

/** Redondeo pensado para leerse: bajo 10 km importa el decimal, por encima no. */
export function formatearDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

/**
 * Posición del navegador, envuelta en promesa y con un motivo legible cuando
 * falla. El navegador distingue entre "he dicho que no" y "no he podido", y esa
 * diferencia hay que contarla: una se arregla y la otra no.
 */
export type FalloGeo = "denegado" | "no-disponible" | "tiempo-agotado" | "sin-soporte";

export function posicionActual(tiempoMaximoMs = 8000): Promise<Coordenadas> {
  return new Promise((resolver, rechazar) => {
    if (!("geolocation" in navigator)) {
      rechazar("sin-soporte" satisfies FalloGeo);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolver({ lat: coords.latitude, lng: coords.longitude }),
      (error) => {
        const motivo: FalloGeo =
          error.code === error.PERMISSION_DENIED
            ? "denegado"
            : error.code === error.TIMEOUT
              ? "tiempo-agotado"
              : "no-disponible";
        rechazar(motivo);
      },
      { enableHighAccuracy: false, timeout: tiempoMaximoMs, maximumAge: 300_000 },
    );
  });
}
