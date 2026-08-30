import { EMPRESA } from "@/config/sitio";

/**
 * Columnas del pie de página.
 *
 * Mismo criterio que el megamenú: como dato, reordenar una columna es mover una
 * línea. Los atributos `abre` y `servicio` los recoge el módulo de atajos para
 * abrir el catálogo o el panel del servicio sin recargar la página.
 */

export interface EnlacePie {
  texto: string;
  href: string;
  /** Familia del catálogo que debe abrirse al pulsar. */
  abre?: string;
  /** Servicio cuyo panel de detalle debe abrirse. */
  servicio?: string;
  externo?: boolean;
  /** Se pinta con tipografía monoespaciada: teléfonos y referencias. */
  mono?: boolean;
}

export interface ColumnaPie {
  titulo: string;
  enlaces: EnlacePie[];
  /** Texto suelto al final de la columna. */
  nota?: string;
}

export const COLUMNAS_PIE: readonly ColumnaPie[] = [
  {
    titulo: "Alquiler",
    enlaces: [
      { texto: "Plataformas elevadoras", href: "#catalogo", abre: "plat-articulada" },
      { texto: "Maquinaria de manipulación", href: "#catalogo", abre: "telehandler" },
      { texto: "Maquinaria de manutención", href: "#catalogo", abre: "carretilla-elevadora" },
      { texto: "Maquinaria de energía", href: "#catalogo", abre: "grupo-pequeno" },
      { texto: "Limpieza industrial", href: "#catalogo", abre: "fregadora" },
      { texto: "Módulos prefabricados", href: "#catalogo", abre: "caseta-obra" },
    ],
  },
  {
    titulo: "Comprar",
    enlaces: [
      { texto: "Maquinaria nueva", href: "#catalogo", abre: "plat-tijera" },
      { texto: "Maquinaria de ocasión", href: "#catalogo", abre: "carretilla-elevadora" },
      { texto: "Comprar por marcas", href: "#marcas" },
      { texto: "Subastas online", href: EMPRESA.filiales.online, externo: true },
      { texto: "Repuestos", href: EMPRESA.filiales.online, externo: true },
      { texto: "Vender o tasar mi flota", href: "#contacto" },
    ],
  },
  {
    titulo: "Servicios",
    enlaces: [
      { texto: "Energía", href: "#servicios", servicio: "energia" },
      { texto: "Mantenimiento", href: "#mantenimiento" },
      { texto: "Construcción modular", href: "#servicios", servicio: "modular" },
      { texto: "Robótica móvil y AGV", href: "#servicios", servicio: "robotica" },
      { texto: "Movilidad sostenible", href: "#servicios", servicio: "movilidad" },
      { texto: "Audiovisuales", href: "#servicios", servicio: "audiovisuales" },
      { texto: "Formación", href: "#formacion" },
    ],
  },
  {
    titulo: "Empresa",
    enlaces: [
      { texto: "GAM en cifras", href: "#cifras" },
      { texto: "Delegaciones", href: "#delegaciones" },
      { texto: "Sectores", href: "#sectores" },
      { texto: "Sostenibilidad", href: "#sostenibilidad" },
      { texto: "Personas y cultura", href: "#sostenibilidad" },
      { texto: "Canal de denuncias", href: "#contacto" },
    ],
  },
  {
    titulo: "Inversores",
    enlaces: [
      { texto: "Información económico-financiera", href: "#contacto" },
      { texto: "Gobierno corporativo", href: "#contacto" },
      { texto: "Agenda del accionista", href: "#contacto" },
      { texto: "Informe anual", href: "#contacto" },
      { texto: "Kit de prensa", href: "#contacto" },
    ],
  },
  {
    titulo: "Atención a cliente",
    enlaces: [
      { texto: EMPRESA.telefono, href: `tel:${EMPRESA.telefonoE164}`, mono: true },
      { texto: "clientes@gamrentals.com", href: "mailto:clientes@gamrentals.com" },
      { texto: "Solicitar soporte técnico", href: "#contacto" },
      { texto: "Preguntas frecuentes", href: "#faq" },
    ],
    nota: "España · Portugal · Chile · México · Perú · República Dominicana · Marruecos · Arabia Saudí",
  },
];

export interface RedSocial {
  nombre: string;
  href: string;
  icono: string;
}

export const REDES: readonly RedSocial[] = [
  { nombre: "Facebook", href: "https://www.facebook.com/GAM.Soluciones", icono: "so-facebook" },
  { nombre: "Instagram", href: "https://www.instagram.com/gam.soluciones", icono: "so-instagram" },
  {
    nombre: "LinkedIn",
    href: "https://www.linkedin.com/company/gam-soluciones",
    icono: "so-linkedin",
  },
  {
    nombre: "YouTube",
    href: "https://www.youtube.com/channel/UCTmd5-4_yh4xOGwdIJemuCw",
    icono: "so-youtube",
  },
];

export const ENLACES_LEGALES = [
  { texto: "Aviso legal", href: "#contacto" },
  { texto: "Política de privacidad", href: "#contacto" },
  { texto: "Política de cookies", href: "#contacto" },
  { texto: "Accesibilidad", href: "#contacto" },
] as const;
