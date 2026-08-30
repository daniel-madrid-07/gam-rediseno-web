import { EMPRESA } from "@/config/sitio";

/**
 * Estructura de los menús desplegables de la cabecera.
 *
 * Antes esto eran 150 líneas de HTML casi idéntico, donde cambiar el orden de
 * un enlace obligaba a mover un bloque de cuatro líneas con su `<svg><use>`
 * dentro. Como dato, un enlace es una línea y la plantilla se escribe una vez.
 */

export interface EnlaceNav {
  texto: string;
  /** Ancla o URL de destino. */
  href: string;
  icono: string;
  /** Id de familia del catálogo que debe abrirse al pulsar. */
  abre?: string;
  externo?: boolean;
}

export interface ColumnaNav {
  titulo: string;
  enlaces: EnlaceNav[];
}

export interface PanelLateral {
  antetitulo: string;
  texto: string;
  boton?: { texto: string; icono: string; accion: "asistente" };
  enlace?: { texto: string; href: string };
  etiquetas?: string[];
}

export interface MenuNav {
  id: string;
  texto: string;
  columnas: ColumnaNav[];
  lateral: PanelLateral;
}

const maquinaria: MenuNav = {
  id: "mp-maq",
  texto: "Maquinaria",
  columnas: [
    {
      titulo: "Elevación",
      enlaces: [
        { texto: "Plataformas articuladas", href: "#catalogo", icono: "m-articulada", abre: "plat-articulada" },
        { texto: "Plataformas de tijera", href: "#catalogo", icono: "m-tijera", abre: "plat-tijera" },
        { texto: "Plataformas telescópicas", href: "#catalogo", icono: "m-telescopica", abre: "plat-telescopica" },
        { texto: "Plataformas unipersonales", href: "#catalogo", icono: "m-unipersonal", abre: "plat-unipersonal" },
        { texto: "Plataformas sobre camión", href: "#catalogo", icono: "m-camion", abre: "plat-camion" },
        { texto: "Plataformas sobre oruga", href: "#catalogo", icono: "m-articulada", abre: "plat-oruga" },
      ],
    },
    {
      titulo: "Manipulación",
      enlaces: [
        { texto: "Manipuladores telescópicos", href: "#catalogo", icono: "m-telehandler", abre: "telehandler" },
        { texto: "Carretillas todoterreno 4x4", href: "#catalogo", icono: "m-carretilla", abre: "carretilla-4x4" },
        { texto: "Miniexcavadoras", href: "#catalogo", icono: "m-excavadora", abre: "miniexcavadora" },
        { texto: "Minicargadoras", href: "#catalogo", icono: "m-excavadora", abre: "minicargadora" },
        { texto: "Retroexcavadoras", href: "#catalogo", icono: "m-excavadora", abre: "retroexcavadora" },
        { texto: "Palas cargadoras", href: "#catalogo", icono: "m-excavadora", abre: "pala-cargadora" },
        { texto: "Grúas hidráulicas", href: "#catalogo", icono: "m-telehandler", abre: "grua-hidraulica" },
      ],
    },
    {
      titulo: "Manutención",
      enlaces: [
        { texto: "Carretillas elevadoras", href: "#catalogo", icono: "m-carretilla", abre: "carretilla-elevadora" },
        { texto: "Retráctiles y trilaterales", href: "#catalogo", icono: "m-carretilla", abre: "retractil" },
        { texto: "Apiladores", href: "#catalogo", icono: "m-transpaleta", abre: "apilador" },
        { texto: "Transpaletas", href: "#catalogo", icono: "m-transpaleta", abre: "transpaleta" },
        { texto: "Preparapedidos", href: "#catalogo", icono: "m-transpaleta", abre: "preparapedidos" },
        { texto: "Tractores de arrastre", href: "#catalogo", icono: "m-agv", abre: "tractor-arrastre" },
      ],
    },
    {
      titulo: "Energía, limpieza y espacios",
      enlaces: [
        { texto: "Grupos electrógenos", href: "#catalogo", icono: "m-grupo", abre: "grupo-pequeno" },
        { texto: "Compresores de aire", href: "#catalogo", icono: "m-compresor", abre: "compresor" },
        { texto: "Cañones de calor", href: "#catalogo", icono: "m-compresor", abre: "canon-calor" },
        { texto: "Climatización industrial", href: "#catalogo", icono: "m-compresor", abre: "clima" },
        { texto: "Limpieza industrial", href: "#catalogo", icono: "m-limpieza", abre: "fregadora" },
        { texto: "Módulos prefabricados", href: "#catalogo", icono: "m-modulo", abre: "caseta-obra" },
        { texto: "AGV y robótica móvil", href: "#catalogo", icono: "m-agv", abre: "agv-palet" },
      ],
    },
  ],
  lateral: {
    antetitulo: "Atajo",
    texto:
      "¿No sabes qué máquina necesitas? Responde tres preguntas y te decimos la familia adecuada.",
    boton: { texto: "Abrir el asistente", icono: "i-sliders", accion: "asistente" },
    enlace: { texto: "Ver las 35 familias", href: "#catalogo" },
  },
};

const comprar: MenuNav = {
  id: "mp-comprar",
  texto: "Comprar",
  columnas: [
    {
      titulo: "Maquinaria nueva",
      enlaces: [
        { texto: "Plataformas elevadoras", href: "#catalogo", icono: "m-tijera", abre: "plat-tijera" },
        { texto: "Carretillas elevadoras", href: "#catalogo", icono: "m-carretilla", abre: "carretilla-elevadora" },
        { texto: "Limpieza industrial", href: "#catalogo", icono: "m-limpieza", abre: "fregadora" },
        { texto: "Apiladores", href: "#catalogo", icono: "m-transpaleta", abre: "apilador" },
        { texto: "Comprar por marcas", href: "#marcas", icono: "i-star" },
      ],
    },
    {
      titulo: "Maquinaria de ocasión",
      enlaces: [
        { texto: "Elevación", href: "#catalogo", icono: "m-articulada", abre: "plat-articulada" },
        { texto: "Manutención", href: "#catalogo", icono: "m-carretilla", abre: "carretilla-elevadora" },
        { texto: "Manipulación", href: "#catalogo", icono: "m-telehandler", abre: "telehandler" },
        { texto: "Energía", href: "#catalogo", icono: "m-grupo", abre: "grupo-pequeno" },
        { texto: "Otros equipos", href: "#catalogo", icono: "m-modulo", abre: "contenedor" },
      ],
    },
    {
      titulo: "Portal GAM Online",
      enlaces: [
        { texto: "Comprar de ocasión", href: EMPRESA.filiales.online, icono: "i-external", externo: true },
        { texto: "Subastas online", href: EMPRESA.filiales.online, icono: "i-external", externo: true },
        { texto: "Repuestos", href: EMPRESA.filiales.online, icono: "i-external", externo: true },
        { texto: "Tasar y vender mi flota", href: "#contacto", icono: "i-scale" },
      ],
    },
  ],
  lateral: {
    antetitulo: "Reviver",
    texto:
      "Reacondicionamiento de máquinas: les damos una segunda vida y volvemos a lanzarlas al mercado a través del portal de ocasión.",
    etiquetas: ["+5.000 subastadas", "+14.000 usuarios"],
  },
};

const empresa: MenuNav = {
  id: "mp-emp",
  texto: "Empresa",
  columnas: [
    {
      titulo: "Quiénes somos",
      enlaces: [
        { texto: "GAM en cifras", href: "#cifras", icono: "i-info" },
        { texto: "Sectores", href: "#sectores", icono: "v-fabrica" },
        { texto: "Marcas GAM", href: "#marcas", icono: "i-star" },
        { texto: "Delegaciones y sedes", href: "#delegaciones", icono: "i-pin" },
        { texto: "Preguntas frecuentes", href: "#faq", icono: "i-info" },
      ],
    },
    {
      titulo: "Compromiso",
      enlaces: [
        { texto: "Sostenibilidad", href: "#sostenibilidad", icono: "i-leaf" },
        { texto: "Nuestro compromiso", href: "#sostenibilidad", icono: "i-shield" },
        { texto: "Personas y cultura", href: "#sostenibilidad", icono: "i-users" },
        { texto: "Canal de denuncias", href: "#contacto", icono: "i-alert" },
      ],
    },
    {
      titulo: "Inversores",
      enlaces: [
        { texto: "Información económico-financiera", href: "#contacto", icono: "i-download" },
        { texto: "Gobierno corporativo", href: "#contacto", icono: "i-shield" },
        { texto: "Agenda del accionista", href: "#contacto", icono: "i-calendar" },
        { texto: "Informe anual", href: "#contacto", icono: "i-download" },
        { texto: "Kit de prensa", href: "#contacto", icono: "i-download" },
      ],
    },
  ],
  lateral: {
    antetitulo: "Presencia",
    texto:
      "España, Portugal, Chile, México, Perú, República Dominicana, Marruecos y Arabia Saudí.",
    enlace: { texto: "Buscar mi delegación", href: "#delegaciones" },
  },
};

/** Menús con contenido fijo. El de Servicios se arma desde la colección. */
export const MENUS: readonly MenuNav[] = [maquinaria, comprar, empresa];

/** Enlace suelto de la barra, sin desplegable. */
export const ENLACE_DELEGACIONES = { texto: "Delegaciones", href: "#delegaciones" };
