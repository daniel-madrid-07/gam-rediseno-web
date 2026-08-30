/**
 * Migración única: convierte el antiguo src-viejo/p10-data.js (variables
 * globales concatenadas en el HTML) a los JSON tipados de src/datos.
 *
 * Se conserva en el repositorio como registro de cómo se obtuvieron los datos.
 * Uso: node scripts/migrar-datos.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const fuente = join(raiz, "_legacy", "src-viejo", "p10-data.js");
const destino = join(raiz, "src", "datos");

const codigo = readFileSync(fuente, "utf8");
const leer = new Function(
  `${codigo}; return { FAMILIAS, CATALOGO, SERVICIOS, SECTORES, MARCAS, CURSOS, DELEGACIONES };`,
);
const { CATALOGO, SERVICIOS, SECTORES, MARCAS, CURSOS, DELEGACIONES } = leer();

const escribir = (ruta, datos) => {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, `${JSON.stringify(datos, null, 2)}\n`, "utf8");
  const n = Array.isArray(datos) ? datos.length : Object.keys(datos).length;
  console.log(`  ${ruta.replace(raiz, ".").padEnd(52)} ${String(n).padStart(3)} registros`);
};

/* ---- Catálogo: un archivo por familia, así ninguno pasa de 300 líneas ---- */
const renombraMaquina = (m) => ({
  id: m.id,
  nombre: m.n,
  familia: m.fam,
  icono: m.ico,
  descripcion: m.d,
  alturaMax: m.h ?? 0,
  cargaMax: m.kg ?? 0,
  entornos: m.env,
  motores: m.mot,
  cero: Boolean(m.eco),
  canales: m.ch,
  ficha: m.specs,
  etiquetas: m.tags,
});

console.log("Catálogo por familia");
const porFamilia = new Map();
for (const maquina of CATALOGO) {
  if (!porFamilia.has(maquina.fam)) porFamilia.set(maquina.fam, []);
  porFamilia.get(maquina.fam).push(renombraMaquina(maquina));
}
// El prefijo numérico fija el orden de lectura: el cargador de la colección
// ordena por nombre de archivo, y "por relevancia" es justo este orden.
let orden = 0;
for (const [familia, maquinas] of porFamilia) {
  orden += 1;
  const prefijo = String(orden).padStart(2, "0");
  escribir(join(destino, "catalogo", `${prefijo}-${familia}.json`), maquinas);
}

/* ---- Servicios: uno por archivo, son textos largos ---- */
console.log("Servicios");
const renombraServicio = (s) => ({
  id: s.id,
  nombre: s.n,
  icono: s.ico,
  resumen: s.r,
  descripcion: s.d,
  detalle: s.largo,
  puntos: s.puntos,
  enlace: { texto: s.cta.t, href: s.cta.h, externo: Boolean(s.cta.ext) },
});
const servicios = SERVICIOS.map(renombraServicio);
const mitad = Math.ceil(servicios.length / 2);
escribir(join(destino, "servicios", "01-operacion.json"), servicios.slice(0, mitad));
escribir(join(destino, "servicios", "02-negocio.json"), servicios.slice(mitad));

/* ---- Delegaciones: agrupadas por comunidad autónoma ---- */
console.log("Delegaciones por comunidad");
const identificador = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const porComunidad = new Map();
for (const d of DELEGACIONES) {
  const registro = {
    id: identificador(d.n),
    nombre: d.n,
    direccion: d.d,
    cp: d.cp,
    ciudad: d.c,
    comunidad: d.co,
    telefono: d.t,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
  };
  const clave = identificador(d.co);
  if (!porComunidad.has(clave)) porComunidad.set(clave, []);
  porComunidad.get(clave).push(registro);
}
for (const [comunidad, lista] of porComunidad) {
  escribir(join(destino, "delegaciones", `${comunidad}.json`), lista);
}

/* ---- Listas cortas: módulos TypeScript, no colecciones ---- */
console.log("Listas auxiliares");
const ts = (nombre, tipo, datos) =>
  `/* Generado por scripts/migrar-datos.mjs a partir de los datos de GAM. */\n\n` +
  `export interface ${tipo} ${nombre === "SECTORES" ? "{\n  nombre: string;\n  icono: string;\n}" : "{\n  nombre: string;\n  norma: string;\n  modalidad: string;\n  descripcion: string;\n}"}\n\n` +
  `export const ${nombre}: readonly ${tipo}[] = ${JSON.stringify(datos, null, 2)} as const;\n`;

writeFileSync(
  join(destino, "sectores.ts"),
  ts("SECTORES", "Sector", SECTORES.map((s) => ({ nombre: s.n, icono: s.ico }))),
  "utf8",
);
writeFileSync(
  join(destino, "cursos.ts"),
  ts(
    "CURSOS",
    "Curso",
    CURSOS.map((c) => ({
      nombre: c.n,
      norma: c.norma,
      modalidad: c.mod,
      descripcion: c.d,
    })),
  ),
  "utf8",
);
writeFileSync(
  join(destino, "marcas.ts"),
  `/* Generado por scripts/migrar-datos.mjs a partir de los datos de GAM. */\n\n` +
    `/** Marcas que GAM distribuye o mantiene en su parque. */\n` +
    `export const MARCAS: readonly string[] = ${JSON.stringify(MARCAS, null, 2)} as const;\n`,
  "utf8",
);
console.log(`  sectores.ts ${SECTORES.length} · cursos.ts ${CURSOS.length} · marcas.ts ${MARCAS.length}`);
