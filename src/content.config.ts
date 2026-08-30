import { defineCollection, z } from "astro:content";
import {
  CLAVES_CANAL,
  CLAVES_ENTORNO,
  CLAVES_FAMILIA,
  CLAVES_MOTOR,
} from "./datos/taxonomias";

/**
 * Esquemas del contenido estructurado.
 *
 * La validación corre en build: una máquina sin ficha técnica o una delegación
 * con coordenadas fuera de la península hacen fallar la compilación en vez de
 * llegar a producción y romper la página en el navegador del cliente.
 */

/**
 * Carga y concatena todos los JSON de un directorio de datos.
 *
 * Se ordena por nombre de archivo para que el orden del catálogo sea el mismo
 * en cada build: sin esto el orden lo decide `import.meta.glob` y la portada
 * podría barajar las familias entre despliegues.
 */
function cargarDirectorio(modulos: Record<string, unknown>): { id: string }[] {
  return Object.entries(modulos)
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .flatMap(([, modulo]) => (modulo as { default: { id: string }[] }).default);
}

const enumDe = <T extends string>(claves: T[]) =>
  z.enum(claves as [T, ...T[]]);

const catalogo = defineCollection({
  loader: async () =>
    cargarDirectorio(
      import.meta.glob("./datos/catalogo/*.json", { eager: true }),
    ),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, "El id viaja en la URL: minúsculas y guiones"),
    nombre: z.string().min(3),
    familia: enumDe(CLAVES_FAMILIA),
    icono: z.string(),
    descripcion: z.string().min(40, "La descripción es el texto que indexa el buscador"),
    /** Altura de trabajo máxima en metros; 0 si la familia no eleva. */
    alturaMax: z.number().min(0).max(100),
    /** Carga o capacidad máxima en kg. */
    cargaMax: z.number().min(0),
    entornos: z.array(enumDe(CLAVES_ENTORNO)).min(1),
    motores: z.array(enumDe(CLAVES_MOTOR)).min(1),
    cero: z.boolean().describe("Disponible en versión cero emisiones"),
    canales: z.array(enumDe(CLAVES_CANAL)).min(1),
    ficha: z
      .array(z.tuple([z.string(), z.string()]))
      .min(2, "Sin ficha técnica la familia no se puede comparar"),
    etiquetas: z.string().describe("Sinónimos y marcas para el buscador"),
  }),
});

const delegaciones = defineCollection({
  loader: async () =>
    cargarDirectorio(
      import.meta.glob("./datos/delegaciones/*.json", { eager: true }),
    ),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    direccion: z.string(),
    cp: z.string(),
    ciudad: z.string(),
    comunidad: z.string(),
    telefono: z.string(),
    lat: z.number().min(27).max(44).nullable(),
    lng: z.number().min(-19).max(5).nullable(),
  }),
});

const servicios = defineCollection({
  loader: async () =>
    cargarDirectorio(
      import.meta.glob("./datos/servicios/*.json", { eager: true }),
    ),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    nombre: z.string(),
    icono: z.string(),
    resumen: z.string(),
    descripcion: z.string(),
    detalle: z.string(),
    puntos: z.array(z.string()).min(3),
    enlace: z.object({
      texto: z.string(),
      href: z.string(),
      externo: z.boolean().default(false),
    }),
  }),
});

export const collections = { catalogo, delegaciones, servicios };
