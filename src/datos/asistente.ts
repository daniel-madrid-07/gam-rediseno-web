/**
 * Guion del asistente de selección.
 *
 * Tres preguntas, en el orden en que las hace un comercial al teléfono: qué
 * trabajo hay que hacer, dónde, y si hay restricción de emisiones. Cada opción
 * escribe en la misma faceta del catálogo que existe en los filtros, así que el
 * asistente no es una lógica aparte: es otra forma de rellenar los filtros.
 */

export interface OpcionPaso {
  /** Valor de la faceta. La cadena vacía significa «me da igual». */
  valor: string;
  icono: string;
  titulo: string;
  detalle: string;
}

export interface PasoAsistente {
  pregunta: string;
  ayuda: string;
  /** Faceta del catálogo que responde este paso. */
  faceta: "familias" | "entornos" | "cero";
  opciones: OpcionPaso[];
}

export const PASOS: readonly PasoAsistente[] = [
  {
    pregunta: "¿Qué tienes que hacer?",
    ayuda: "Elige la tarea principal del trabajo.",
    faceta: "familias",
    opciones: [
      {
        valor: "elevacion",
        icono: "m-articulada",
        titulo: "Subir a trabajar en altura",
        detalle: "Fachadas, techos, mantenimiento en alto",
      },
      {
        valor: "manutencion",
        icono: "m-carretilla",
        titulo: "Mover carga en almacén",
        detalle: "Palés, estanterías, picking",
      },
      {
        valor: "manipulacion",
        icono: "m-telehandler",
        titulo: "Mover material en obra",
        detalle: "Tierras, áridos, carga en exterior",
      },
      {
        valor: "energia",
        icono: "m-grupo",
        titulo: "Dar energía, calor o frío",
        detalle: "Generación, aire, climatización",
      },
      {
        valor: "limpieza",
        icono: "m-limpieza",
        titulo: "Limpiar suelo industrial",
        detalle: "Fregado, barrido, aspiración",
      },
      {
        valor: "modular",
        icono: "m-modulo",
        titulo: "Montar un espacio",
        detalle: "Oficina, vestuario, almacén",
      },
      {
        valor: "robotica",
        icono: "m-agv",
        titulo: "Automatizar el transporte",
        detalle: "AGV, AMR, sorting",
      },
    ],
  },
  {
    pregunta: "¿Dónde va a trabajar?",
    ayuda: "Condiciona la motorización, el neumático y las dimensiones.",
    faceta: "entornos",
    opciones: [
      {
        valor: "int",
        icono: "v-fabrica",
        titulo: "En interior",
        detalle: "Nave, almacén, planta",
      },
      {
        valor: "ext",
        icono: "s-mineria",
        titulo: "En exterior",
        detalle: "Obra, patio, terreno irregular",
      },
      {
        valor: "",
        icono: "i-globe",
        titulo: "En los dos",
        detalle: "Que valga para ambos entornos",
      },
    ],
  },
  {
    pregunta: "¿Prioridad de motorización?",
    ayuda: "En interior y en ciudad, cero emisiones suele ser obligatorio.",
    faceta: "cero",
    opciones: [
      {
        valor: "1",
        icono: "i-leaf",
        titulo: "Cero emisiones",
        detalle: "Eléctrico o batería, sin humos ni ruido",
      },
      {
        valor: "",
        icono: "i-bolt",
        titulo: "Me da igual",
        detalle: "Enséñame todas las opciones",
      },
    ],
  },
];

/** Cuántas familias se proponen como resultado. */
export const MAXIMO_PROPUESTAS = 4;
