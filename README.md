# Web de GAM

Sitio de alquiler, venta y mantenimiento de maquinaria industrial. Salida
estática: se publica en cualquier CDN o en GitHub Pages sin proceso Node detrás.

```bash
npm install
npm run dev          # servidor de desarrollo en localhost:4321
npm run build        # comprueba tipos y compila a dist/
npm run verify       # lint + tipos + tests unitarios + extremo a extremo
```

## Stack y por qué

| Pieza                    | Motivo                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Astro 5**              | Contenido con islas de interactividad. Manda 0 KB de JS por defecto y sólo hidrata lo que de verdad reacciona. |
| **TypeScript** (estricto) | Los datos cruzan tres fronteras (build → HTML → isla). Sin tipos, un renombrado se descubre en producción.   |
| **Svelte 5**             | El runtime más pequeño de los que integra Astro. Compila; no se envía un framework al navegador.             |
| **nanostores**           | La bandeja vive en la cabecera, en el catálogo y en su diálogo: tres islas que no se conocen entre sí.        |
| **Zod** (vía colecciones) | Valida las 35 familias y las 54 delegaciones en build. Un dato mal formado rompe la compilación, no la web.  |
| **Vitest + Playwright**  | La lógica pura se prueba en milisegundos; los recorridos reales, contra el sitio ya compilado.                |
| **Tipografías propias**  | Servidas desde el mismo origen. Pedirlas a Google bloqueaba el renderizado 2,3 s en móvil.                     |

## Estructura

```
src/
├── config/sitio.ts        Dominio, base de despliegue y datos de la empresa
├── content.config.ts      Esquemas Zod de catálogo, servicios y delegaciones
├── datos/                 Contenido como dato, no como marcado
│   ├── catalogo/          35 familias, un JSON por familia
│   ├── delegaciones/      54 sedes, agrupadas por comunidad
│   ├── servicios/         Los 10 servicios
│   └── *.ts               Taxonomías, navegación, pie, FAQ, formulario…
├── estilos/               CSS en capas; indice.css declara el orden
│   ├── base/              Reset, tokens, tipografía, maquetación, utilidades
│   └── componentes/       Un archivo por componente
├── lib/                   Lógica pura y reutilizable (con sus tests al lado)
├── tipos/                 Contrato compartido entre Astro y las islas
├── componentes/           Plantillas de Astro (HTML estático)
├── islas/                 Componentes de Svelte (lo único que se hidrata)
├── layouts/Base.astro     Esqueleto del documento
└── pages/index.astro      Portada
```

Ningún archivo pasa de 300 líneas. Cuando uno se acerca, lo que sobra casi
siempre son datos incrustados en el marcado: se sacan a `src/datos`.

## Qué se hidrata y qué no

Esta es la decisión de rendimiento del proyecto:

| Isla                    | Cuándo             | Por qué                                              |
| ----------------------- | ------------------ | ---------------------------------------------------- |
| `ContadorBandeja`       | `client:idle`      | Está en la cabecera y cambia desde el catálogo        |
| `BuscadorHeroe`         | `client:idle`      | Primera pantalla, pero no bloquea la pintura          |
| `Catalogo`              | `client:visible`   | Está bajo el pliegue; no se paga hasta que se llega   |
| `Delegaciones`          | `client:visible`   | Ídem                                                  |
| `FormularioContacto`    | `client:visible`   | Ídem                                                  |
| Diálogos y avisos       | `client:idle`      | No se ven al cargar; esperan a que el hilo esté libre |

Todo lo demás (cabecera, héroe, servicios, mantenimiento, formación, sectores,
sostenibilidad, FAQ y pie) es HTML estático sin JavaScript asociado.

## Estado

Tres átomos, cada uno con su alcance y su duración:

- **`estado/filtros.ts`** — vive en la URL. Un filtro se puede enlazar y el
  botón atrás lo deshace.
- **`estado/seleccion.ts`** — vive en `localStorage`. Sobrevive a la recarga.
- **`estado/interfaz.ts`** — vive en memoria. Avisos y diálogo abierto.

Las preferencias de accesibilidad (`estado/preferencias.ts`) se vuelcan a
atributos `data-*` del `<html>` y el CSS hace el resto: el JavaScript no toca
ni un color.

## Comprobaciones

```bash
npm test              # 35 tests de lógica pura (filtrado, geo, texto)
npm run test:e2e      # 45 recorridos en escritorio y móvil
npm run auditar       # contraste AA en 12 escenarios (temas, móvil, diálogos)
npm run medir         # Lighthouse en móvil y escritorio
```

### Lighthouse

| | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Escritorio | **100** | **100** | **100** | **100** |
| Móvil | **96** | **100** | **100** | **100** |

Móvil: FCP 1,9 s · LCP 2,6 s · CLS 0 · TBT 0 ms (simulación Slow 4G).

Lo que se probó y **empeoraba**, por si alguien lo vuelve a intentar:

- Meter la hoja de estilos entera en línea: el HTML engorda de 54 a 67 KB y el
  FCP en móvil pasa de 1,9 s a 2,5 s. La hoja externa gana.
- Extraer el CSS crítico con Beasties: con la página entera en el marcado
  considera crítico 50 de los 61 KB, los mete en línea y encima sigue cargando
  la hoja completa. FCP 2,6 s.
- Quitar los 54 nodos `LocalBusiness` del JSON-LD: ahorra 4 KB comprimidos y la
  puntuación no se mueve, así que no compensa perder el marcado local.
- Quitar `content-visibility`: cuesta 11 puntos de rendimiento en móvil.

La auditoría de contraste desactiva `content-visibility` antes de medir: Chrome
no recalcula estilos fuera de pantalla y, sin eso, informa de fallos que no
existen.

## Tipografías

No se cargan desde Google: se sirven desde el mismo origen. El proceso está
automatizado en dos pasos y sólo hay que repetirlo si cambian las familias:

```bash
npm run fuentes   # descarga los .woff2 y recorta los ejes variables
```

El segundo paso (`scripts/afinar-fuentes.py`, necesita `fonttools` y `brotli`)
estrecha los ejes de Archivo a lo que la web usa de verdad: anchura 82–92 en
lugar de 62–125. Son 87 KB que pasan a 41 sin perder ni un carácter.

Las dos del primer pantallazo se precargan con su hash real, que la integración
`endurecer` busca en el CSS ya compilado.

## Despliegue

```bash
npm run build                        # a dist/, para gamrentals.com
DESPLIEGUE=github npm run build:fast # a dist/, para GitHub Pages
```

`DESPLIEGUE=github` cambia el dominio y la ruta base, y marca el sitio como
`noindex` para que una vista previa no compita en buscadores con el sitio
oficial.

## Pendiente

- **El formulario no envía a ningún sitio.** Valida y avisa de que es una
  demostración; no finge un envío correcto. Para activarlo, pásale la prop
  `endpoint` a `FormularioContacto` en `componentes/secciones/Contacto.astro`.
- **La foto de la cargadora XCMG LW300KN** procede de un tercero
  (lectura-specs.com). Confirmar derechos con XCMG o sustituirla antes de
  usarla fuera de una vista previa.
- **Los rangos técnicos del catálogo son orientativos por familia.** Sustituir
  por los datos del ERP cuando se conecte.

## Migración

`scripts/migrar-datos.mjs` y `scripts/repartir-css.py` convirtieron la versión
anterior (un HTML generado concatenando fragmentos de texto) a esta estructura.
Se conservan como registro de cómo se obtuvieron los datos; no forman parte del
build. El código original queda en `_legacy/`.
