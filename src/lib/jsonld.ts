import type { Delegacion, Maquina, Servicio } from "@tipos";
import { FAMILIAS } from "@datos/taxonomias";
import { PREGUNTAS } from "@datos/faq";
import { EMPRESA, SITIO } from "@/config/sitio";

/**
 * Datos estructurados para buscadores.
 *
 * Se generan a partir de las mismas colecciones que pinta la página. En la web
 * anterior el JSON-LD era un bloque escrito a mano, y bastaba con corregir un
 * texto en pantalla para que dejara de coincidir con lo que leía Google
 * (schema.org lo considera contenido oculto engañoso y puede penalizarlo).
 * Aquí no puede pasar: si diverge, es que alguien ha tocado esto a propósito.
 */

const ORIGEN = "https://gamrentals.com";
const url = (ancla: string): string => `${ORIGEN}/es${ancla}`;

interface Nodo {
  "@type": string;
  [clave: string]: unknown;
}

function organizacion(): Nodo {
  return {
    "@type": "Organization",
    "@id": `${ORIGEN}/#organizacion`,
    name: SITIO.nombre,
    legalName: SITIO.nombreLargo,
    url: ORIGEN,
    description: SITIO.descripcion,
    telephone: EMPRESA.telefonoE164,
    email: "clientes@gamrentals.com",
    areaServed: [
      "ES", "PT", "CL", "MX", "PE", "DO", "MA", "SA",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: EMPRESA.telefonoE164,
      contactType: "customer service",
      availableLanguage: ["es", "en", "pt"],
    },
  };
}

function sitioWeb(): Nodo {
  return {
    "@type": "WebSite",
    "@id": `${ORIGEN}/#sitio`,
    url: ORIGEN,
    name: SITIO.nombre,
    inLanguage: SITIO.idioma,
    publisher: { "@id": `${ORIGEN}/#organizacion` },
  };
}

/** Cada familia del catálogo, como servicio ofertado. */
function catalogoOfertado(catalogo: readonly Maquina[]): Nodo {
  return {
    "@type": "OfferCatalog",
    "@id": `${ORIGEN}/#catalogo`,
    name: "Catálogo de maquinaria en alquiler",
    numberOfItems: catalogo.length,
    itemListElement: catalogo.map((maquina, indice) => ({
      "@type": "Offer",
      position: indice + 1,
      itemOffered: {
        "@type": "Product",
        name: maquina.nombre,
        description: maquina.descripcion,
        category: FAMILIAS[maquina.familia].nombre,
        brand: { "@type": "Brand", name: SITIO.nombre },
        additionalProperty: maquina.ficha.map(([nombre, valor]) => ({
          "@type": "PropertyValue",
          name: nombre,
          value: valor,
        })),
      },
      availableAtOrFrom: { "@id": `${ORIGEN}/#organizacion` },
      url: url("#catalogo"),
    })),
  };
}

function serviciosOfertados(servicios: readonly Servicio[]): Nodo[] {
  return servicios.map((servicio) => ({
    "@type": "Service",
    "@id": `${ORIGEN}/#servicio-${servicio.id}`,
    name: servicio.nombre,
    description: servicio.detalle,
    provider: { "@id": `${ORIGEN}/#organizacion` },
    areaServed: "ES",
  }));
}

/**
 * Las delegaciones sí son `LocalBusiness`: tienen dirección postal, teléfono
 * propio y coordenadas, que es exactamente lo que necesita una búsqueda local
 * del tipo «alquiler de maquinaria cerca de mí».
 */
function delegacionesLocales(delegaciones: readonly Delegacion[]): Nodo[] {
  return delegaciones
    .filter((d) => d.cp !== "-")
    .map((delegacion) => ({
      "@type": "LocalBusiness",
      "@id": `${ORIGEN}/#delegacion-${delegacion.id}`,
      name: `GAM ${delegacion.nombre}`,
      parentOrganization: { "@id": `${ORIGEN}/#organizacion` },
      telephone: `+34${delegacion.telefono.replace(/\s/g, "")}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: delegacion.direccion,
        postalCode: delegacion.cp,
        addressLocality: delegacion.ciudad,
        addressRegion: delegacion.comunidad,
        addressCountry: "ES",
      },
      ...(delegacion.lat !== null && delegacion.lng !== null
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: delegacion.lat,
              longitude: delegacion.lng,
            },
          }
        : {}),
    }));
}

function preguntasFrecuentes(): Nodo {
  return {
    "@type": "FAQPage",
    "@id": `${ORIGEN}/#faq`,
    inLanguage: SITIO.idioma,
    mainEntity: PREGUNTAS.map((entrada) => ({
      "@type": "Question",
      name: entrada.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        // Sin etiquetas: schema.org espera texto, no HTML
        text: entrada.respuesta.join(" ").replace(/<[^>]+>/g, ""),
      },
    })),
  };
}

export interface FuentesSeo {
  catalogo: readonly Maquina[];
  servicios: readonly Servicio[];
  delegaciones: readonly Delegacion[];
}

/** Grafo completo de la portada, listo para serializar. */
export function grafoDePortada(fuentes: FuentesSeo): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizacion(),
      sitioWeb(),
      catalogoOfertado(fuentes.catalogo),
      ...serviciosOfertados(fuentes.servicios),
      ...delegacionesLocales(fuentes.delegaciones),
      preguntasFrecuentes(),
    ],
  };
}
