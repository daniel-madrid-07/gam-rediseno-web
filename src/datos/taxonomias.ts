/**
 * Vocabulario cerrado del catálogo.
 *
 * Estas claves son las que viajan en los datos y en la URL de los filtros, así
 * que son cortas y estables: cambiar una rompe los enlaces que haya publicados.
 * La etiqueta visible se cambia libremente sin tocar nada más.
 */

export const FAMILIAS = {
  elevacion: {
    nombre: "Elevación",
    icono: "m-articulada",
    claim: "Trabajos en altura con plataforma",
  },
  manipulacion: {
    nombre: "Manipulación",
    icono: "m-telehandler",
    claim: "Movimiento de cargas y tierras en obra",
  },
  manutencion: {
    nombre: "Manutención",
    icono: "m-carretilla",
    claim: "Carga y almacén en interior",
  },
  energia: {
    nombre: "Energía",
    icono: "m-grupo",
    claim: "Generación, aire y clima temporales",
  },
  limpieza: {
    nombre: "Limpieza",
    icono: "m-limpieza",
    claim: "Higiene industrial de superficies",
  },
  modular: {
    nombre: "Modular",
    icono: "m-modulo",
    claim: "Espacios prefabricados y a medida",
  },
  robotica: {
    nombre: "Robótica",
    icono: "m-agv",
    claim: "Automatización del transporte interno",
  },
} as const;

export const MOTORES = {
  ele: "Eléctrico",
  die: "Diésel",
  glp: "GLP / gasolina",
  hib: "Híbrido",
  man: "Manual",
  na: "Sin motorización",
} as const;

export const ENTORNOS = {
  int: "Interior",
  ext: "Exterior",
} as const;

export const CANALES = {
  alq: "Alquiler",
  nue: "Compra nueva",
  oca: "Ocasión",
} as const;

export type ClaveFamilia = keyof typeof FAMILIAS;
export type ClaveMotor = keyof typeof MOTORES;
export type ClaveEntorno = keyof typeof ENTORNOS;
export type ClaveCanal = keyof typeof CANALES;

export const CLAVES_FAMILIA = Object.keys(FAMILIAS) as ClaveFamilia[];
export const CLAVES_MOTOR = Object.keys(MOTORES) as ClaveMotor[];
export const CLAVES_ENTORNO = Object.keys(ENTORNOS) as ClaveEntorno[];
export const CLAVES_CANAL = Object.keys(CANALES) as ClaveCanal[];

export const etiquetaFamilia = (k: ClaveFamilia): string => FAMILIAS[k].nombre;
export const etiquetaMotor = (k: ClaveMotor): string => MOTORES[k];
export const etiquetaEntorno = (k: ClaveEntorno): string => ENTORNOS[k];
export const etiquetaCanal = (k: ClaveCanal): string => CANALES[k];
