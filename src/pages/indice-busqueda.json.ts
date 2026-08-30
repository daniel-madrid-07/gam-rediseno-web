import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { construirIndice } from "@lib/buscador";
import type { Delegacion, Maquina, Servicio } from "@tipos";

/**
 * Índice del buscador global, servido como archivo aparte.
 *
 * Iba dentro del HTML como props de la isla y pesaba 44 KB: la quinta parte de
 * la página, para algo que sólo hace falta cuando alguien abre el buscador.
 * Ahora se descarga la primera vez que se abre, y la primera pintura no lo
 * paga. El archivo se genera en build, así que sigue sin haber servidor detrás.
 */
export const GET: APIRoute = async () => {
  const catalogo = (await getCollection("catalogo")).map((e) => e.data as Maquina);
  const servicios = (await getCollection("servicios")).map((e) => e.data as Servicio);
  const delegaciones = (await getCollection("delegaciones")).map((e) => e.data as Delegacion);

  return new Response(JSON.stringify(construirIndice({ catalogo, servicios, delegaciones })), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Se genera en cada build con nombre fijo, así que no puede cachearse
      // para siempre; una hora es suficiente para no repetir la descarga.
      "Cache-Control": "public, max-age=3600",
    },
  });
};
