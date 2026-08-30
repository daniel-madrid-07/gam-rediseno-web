/* Generado por scripts/migrar-datos.mjs a partir de los datos de GAM. */

export interface Curso {
  nombre: string;
  norma: string;
  modalidad: string;
  descripcion: string;
}

export const CURSOS: readonly Curso[] = [
  {
    "nombre": "Carretillas elevadoras",
    "norma": "UNE 58451",
    "modalidad": "Presencial + online",
    "descripcion": "Conducción y manejo seguro de carretillas elevadoras."
  },
  {
    "nombre": "Plataformas elevadoras móviles de personal",
    "norma": "UNE 58923",
    "modalidad": "Presencial + online",
    "descripcion": "Conducción y manejo seguro de PEMP, con prácticas en máquina real."
  },
  {
    "nombre": "Trabajos temporales en altura",
    "norma": "PRL",
    "modalidad": "Presencial",
    "descripcion": "Seguridad en trabajos temporales en altura."
  },
  {
    "nombre": "Grúas puente o pórtico",
    "norma": "PRL",
    "modalidad": "Presencial",
    "descripcion": "Conducción y manejo seguro de grúas puente o pórtico."
  },
  {
    "nombre": "Espacios confinados",
    "norma": "PRL",
    "modalidad": "Presencial",
    "descripcion": "Trabajos seguros en espacios confinados."
  },
  {
    "nombre": "Maquinaria de movimiento de tierras",
    "norma": "PRL",
    "modalidad": "Presencial",
    "descripcion": "Conducción y manejo de maquinaria para el movimiento de tierras."
  }
] as const;
