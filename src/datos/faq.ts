/* Generado a partir del contenido de la web anterior. */

export interface Pregunta {
  pregunta: string;
  /** Cada elemento es un párrafo de la respuesta. */
  respuesta: string[];
}

/**
 * Preguntas frecuentes.
 *
 * Alimentan a la vez el acordeón de la página y el bloque FAQPage de datos
 * estructurados, así que lo que se lee y lo que indexa Google no pueden
 * divergir: son el mismo dato.
 */
export const PREGUNTAS: readonly Pregunta[] = [
  {
    "pregunta": "¿Cuánto tarda en llegar la máquina?",
    "respuesta": [
      "El plazo depende de la familia de máquina y de la delegación que te atiende. GAM cuenta con 54 delegaciones en España y un parque de más de 40.000 equipos, y las familias estándar se sirven desde la delegación más cercana.",
      "Los equipos de gran altura, los grupos electrógenos de más de 600 kVA y los proyectos de construcción modular requieren planificación previa: incluyen transporte especial y, en el caso de energía, legalización de la instalación. Para una fecha concreta, consulta con tu delegación en el 900 230 022."
    ]
  },
  {
    "pregunta": "¿Hace falta carnet para manejar la máquina?",
    "respuesta": [
      "Sí. Carretillas elevadoras y plataformas elevadoras móviles de personal exigen formación específica del operario según la norma UNE correspondiente, y la empresa usuaria debe poder acreditarla. Lo mismo aplica a grúas puente, trabajos en altura y espacios confinados dentro del marco de prevención de riesgos laborales.",
      "Impartimos esa formación con carnet y certificado oficial, en cursos abiertos, a medida o <i lang=\"en\">in company</i>, y tramitamos la bonificación FUNDAE. Puedes contratarla junto con la máquina."
    ]
  },
  {
    "pregunta": "¿Qué incluye el alquiler además de la máquina?",
    "respuesta": [
      "El asesoramiento técnico previo, el mantenimiento del equipo durante el alquiler y la asistencia técnica de la red de 300 talleres móviles. En los proyectos de energía se incluyen además accesorios, combustible, legalización de la instalación, mantenimiento y gestión de residuos.",
      "El transporte, los implementos y los seguros se cotizan según el proyecto y figuran detallados en el presupuesto de la delegación."
    ]
  },
  {
    "pregunta": "¿Y si la máquina se avería en obra?",
    "respuesta": [
      "GAM dispone de asistencia técnica 24 horas y servicio de guardia. Un taller móvil se desplaza a las instalaciones del cliente y, cuando la reparación no puede resolverse en el momento, se facilita maquinaria de sustitución."
    ]
  },
  {
    "pregunta": "¿Mantenéis máquinas que no son vuestras?",
    "respuesta": [
      "Sí. El servicio de mantenimiento cubre flotas de terceros y trabajamos con todas las marcas del mercado. Puedes contratar solo el preventivo, el Full Service básico con averías hasta un importe pactado, o el Full Service integral con la cobertura que definamos contigo."
    ]
  },
  {
    "pregunta": "¿Qué diferencia hay entre alquiler, renting y leasing?",
    "respuesta": [
      "El alquiler cubre una necesidad puntual: se paga por el tiempo de uso y GAM asume el mantenimiento y la sustitución del equipo. El renting flexible es un contrato de largo plazo con cuota fija y mantenimiento integrado. El leasing es una fórmula de financiación con opción de compra al vencimiento.",
      "Las tres modalidades pueden convivir en una misma flota. Tu delegación puede estudiar qué combinación se ajusta a tu operación."
    ]
  },
  {
    "pregunta": "¿Tenéis máquinas eléctricas para trabajar dentro de nave?",
    "respuesta": [
      "El 85 % del parque es cero emisiones. Para trabajo en interior hay plataformas de tijera y unipersonales eléctricas, carretillas contrapesadas y retráctiles de batería, apiladores, transpaletas, preparapedidos, fregadoras y barredoras. Todos ellos funcionan sin emisiones y con un nivel sonoro reducido."
    ]
  },
  {
    "pregunta": "¿Compráis maquinaria usada?",
    "respuesta": [
      "Sí. Analizamos tu flota, la tasamos y te hacemos oferta. Si lo prefieres, la anunciamos en nuestro portal de comercio electrónico para que la vendas al cliente final. También reacondicionamos máquinas y las devolvemos al mercado con garantía."
    ]
  }
] as const;
