/**
 * Contenido de la sección de mantenimiento.
 *
 * Va en un módulo y no dentro de la plantilla porque son tablas y listas
 * largas: mezcladas con el marcado, el componente pasaría de 300 líneas y
 * cambiar una fila obligaría a leer HTML en vez de datos.
 */

export interface FilaContrato {
  concepto: string;
  /** Una celda por nivel: preventivo, básico e integral. */
  niveles: [Celda, Celda, Celda] | [CeldaAncha];
}

export interface Celda {
  texto: string;
  tono?: "si" | "no";
}

export interface CeldaAncha extends Celda {
  ancho: 3;
}

export const NIVELES_CONTRATO = [
  "Preventivo",
  "Full Service básico",
  "Full Service integral",
] as const;

const si = (texto = "Sí"): Celda => ({ texto, tono: "si" });
const no = (texto = "No"): Celda => ({ texto, tono: "no" });
const normal = (texto: string): Celda => ({ texto });

export const CONTRATOS: FilaContrato[] = [
  { concepto: "Revisiones periódicas programadas", niveles: [si(), si(), si()] },
  {
    concepto: "Asistencia técnica por avería",
    niveles: [no("Presupuesto aparte"), si("Incluida"), si("Incluida")],
  },
  {
    concepto: "Reparación de materiales",
    niveles: [no(), normal("Hasta importe pactado"), si("Sin límite pactado")],
  },
  {
    concepto: "Reparaciones acordadas a medida",
    niveles: [no(), no(), si("Según criterios del cliente")],
  },
  { concepto: "Informe y check list al finalizar", niveles: [si(), si(), si()] },
  {
    concepto: "Programación",
    niveles: [{ texto: "Por calendario o por horas de funcionamiento del equipo", ancho: 3 }],
  },
];

export interface BloqueRevision {
  icono: string;
  titulo: string;
  apunte?: string;
  puntos: string[];
}

export const REVISIONES: BloqueRevision[] = [
  {
    icono: "i-bolt",
    titulo: "Máquinas eléctricas",
    puntos: [
      "Estado de baterías y rellenado de agua y ácido",
      "Comprobación del cargador y estado de contactos",
      "Revisión del sistema eléctrico",
      "Ajuste, comprobación y limpieza de motores eléctricos",
    ],
  },
  {
    icono: "m-grupo",
    titulo: "Motor de combustión",
    apunte: "Diésel, GLP o gasolina",
    puntos: [
      "Mantenimiento básico del motor",
      "Cambio de aceite y de filtro de aceite",
      "Cambio de filtro de gasoil y de aire",
      "Revisión de correas de servicio",
    ],
  },
  {
    icono: "i-shield",
    titulo: "En toda máquina",
    puntos: [
      "Luces, sistemas eléctricos y electrónicos",
      "Revisión general de funcionamiento y seguridad",
      "Engrase general y desplazamiento a tus instalaciones",
      "Check list e informe de correctivos detectados",
    ],
  },
];

export const KITS_MEJORA = [
  "Seguridad",
  "Visibilidad",
  "Matriculación",
  "Ahorro energético",
  "Ruedas",
  "Control de flota",
  "Climatización",
  "Formación",
] as const;

export interface ModalidadFormacion {
  icono: string;
  titulo: string;
  texto: string;
}

export const MODALIDADES: ModalidadFormacion[] = [
  {
    icono: "i-users",
    titulo: "Cursos abiertos",
    texto:
      "Convocatorias presenciales en delegación. Al terminar recibes dossier con la documentación generada y certificado de asistencia y aptitud en formato diploma y carnet.",
  },
  {
    icono: "i-monitor",
    titulo: "Teoría online y simulador",
    texto:
      "Plataforma propia que combina la teoría a distancia con la práctica presencial, con flexibilidad horaria y geográfica y un simulador para ganar destreza antes de subirse a la máquina.",
  },
  {
    icono: "i-clipboard",
    titulo: "Bonificación FUNDAE",
    texto:
      "Tramitamos todo para que tu empresa bonifique la formación. El importe se descuenta de los seguros sociales al finalizar el curso.",
  },
];
