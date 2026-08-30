/* Generado por scripts/migrar-datos.mjs a partir de los datos de GAM. */

export interface Sector {
  nombre: string;
  icono: string;
}

export const SECTORES: readonly Sector[] = [
  {
    "nombre": "Industria metalúrgica",
    "icono": "s-metal"
  },
  {
    "nombre": "Automoción y aeronáutica",
    "icono": "s-auto"
  },
  {
    "nombre": "Puertos",
    "icono": "s-puerto"
  },
  {
    "nombre": "Minería y extractivas",
    "icono": "s-mineria"
  },
  {
    "nombre": "Papel, cartón, madera y reciclaje",
    "icono": "s-madera"
  },
  {
    "nombre": "Industria química",
    "icono": "s-quimica"
  },
  {
    "nombre": "Energías renovables",
    "icono": "s-renovables"
  },
  {
    "nombre": "Logística",
    "icono": "s-logistica"
  },
  {
    "nombre": "Industria alimentaria",
    "icono": "s-alimentaria"
  },
  {
    "nombre": "Facilities",
    "icono": "s-facilities"
  }
] as const;
