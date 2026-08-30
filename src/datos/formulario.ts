import type { TipoCampo } from "@lib/validacion";

/**
 * Campos del formulario de contacto.
 *
 * Como dato en vez de como marcado repetido: cada campo lleva su etiqueta, su
 * regla de validación y, sobre todo, su mensaje de error. Ese mensaje dice qué
 * pasa y cómo arreglarlo («falta la arroba o el dominio»), no «campo inválido»,
 * que no ayuda a nadie a rellenarlo bien.
 */

export interface CampoFormulario {
  id: string;
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  obligatorio: boolean;
  error: string;
  ayuda?: string;
  autocompletar?: string;
}

export const CAMPOS: readonly CampoFormulario[] = [
  {
    id: "f-nombre",
    nombre: "nombre",
    etiqueta: "Nombre y apellidos",
    tipo: "texto",
    obligatorio: true,
    error: "Escribe tu nombre para saber con quién hablamos.",
    autocompletar: "name",
  },
  {
    id: "f-empresa",
    nombre: "empresa",
    etiqueta: "Empresa",
    tipo: "texto",
    obligatorio: false,
    error: "",
    autocompletar: "organization",
  },
  {
    id: "f-email",
    nombre: "email",
    etiqueta: "Correo electrónico",
    tipo: "email",
    obligatorio: true,
    error: "Revisa el correo: falta la arroba o el dominio.",
    autocompletar: "email",
  },
  {
    id: "f-tel",
    nombre: "telefono",
    etiqueta: "Teléfono",
    tipo: "telefono",
    obligatorio: true,
    error: "Necesitamos 9 dígitos para poder llamarte.",
    ayuda: "9 dígitos, sin espacios ni prefijo.",
    autocompletar: "tel",
  },
];

/**
 * Motivos de contacto. Ordenados por volumen real de consulta, no
 * alfabéticamente: quien entra a pedir un alquiler no debería tener que
 * recorrer la lista entera.
 */
export const MOTIVOS: readonly string[] = [
  "Alquiler de maquinaria",
  "Comprar maquinaria nueva",
  "Comprar maquinaria de ocasión",
  "Vender o tasar mi flota",
  "Mantenimiento de flota",
  "Proyecto de energía",
  "Construcción modular",
  "Robótica móvil y AGV",
  "Formación de operarios",
  "Otra consulta",
];

/** Tipo de campo `<input>` que corresponde a cada regla de validación. */
export function tipoDeInput(tipo: TipoCampo): string {
  if (tipo === "email") return "email";
  if (tipo === "telefono") return "tel";
  return "text";
}
