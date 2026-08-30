/**
 * Reglas de validación del formulario de contacto.
 *
 * Separadas de la interfaz para poder probarlas sin montar un navegador, y
 * porque el día que el formulario envíe a un servidor estas mismas reglas
 * tendrán que aplicarse también del otro lado.
 */

/**
 * Comprobación deliberadamente laxa del correo.
 *
 * Validar direcciones contra el RFC completo rechaza correos válidos y no
 * impide que alguien escriba uno inexistente pero bien formado. Lo único que
 * puede detectar un formulario es la errata evidente: falta la arroba o falta
 * el dominio. Lo demás lo dirá el mensaje que rebote.
 */
const CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Dígitos de un número español, ya sea fijo o móvil. */
const DIGITOS_TELEFONO = 9;

export type TipoCampo = "texto" | "email" | "telefono" | "seleccion" | "consentimiento";

export function esValido(tipo: TipoCampo, valor: string | boolean): boolean {
  if (tipo === "consentimiento") return valor === true;

  const texto = String(valor).trim();
  switch (tipo) {
    case "email":
      return CORREO.test(texto);
    case "telefono":
      // Se cuentan sólo los dígitos: la gente escribe espacios, guiones y prefijos
      return texto.replace(/\D/g, "").length >= DIGITOS_TELEFONO;
    case "seleccion":
      return texto.length > 0;
    case "texto":
    default:
      return texto.length > 1;
  }
}

/** Normaliza un teléfono escrito a mano a la forma que espera un enlace `tel:`. */
export function telefonoE164(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  const nacional = digitos.startsWith("34") ? digitos.slice(2) : digitos;
  return `+34${nacional}`;
}
