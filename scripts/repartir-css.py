# -*- coding: utf-8 -*-
"""
Migración única: reparte el CSS antiguo (agrupado en comp-a/b/c/d, nombres sin
significado) entre los archivos por componente de src/estilos.

Parsea a nivel de regla siguiendo la profundidad de llaves, así que respeta
media queries, @supports y anidamiento sin romper nada. Cada regla se asigna a
un archivo según el primer selector que reconoce el mapa de abajo.

Uso: python scripts/repartir-css.py
"""
import io
import os
import re
import sys

VIEJO = "_legacy/src-viejo"
NUEVO = "src/estilos"

FUENTES = ["p04-comp-a.css", "p05-comp-b.css", "p06-comp-c.css",
           "p07-comp-d.css", "p20-movil.css"]

# El archivo de móvil va entero a su componente: son ajustes de una sola
# media query que se leen mejor juntos que repartidos por toda la carpeta.
POR_ORIGEN = {"p20-movil.css": "componentes/movil.css"}

# Selectores raíz de cada componente. Se comparan como prefijo, y gana el más
# largo, de modo que `.brands` no acabe en cabecera.css por culpa de `.brand`.
MAPA = [
    ("componentes/boton.css",        [".btn", ".link", ".pill", ".chip", ".chips", ".iconbtn",
                                      ".seg", ".switch"]),
    ("componentes/cabecera.css",     [".masthead", ".brandmark", ".brand", ".nav", ".navtoggle",
                                      ".mega", ".megacol", ".skiplinks", ".hactions", ".drawer",
                                      ".totop"]),
    ("componentes/heroe.css",        [".hero", ".ticks", ".fig", ".figs",
                                      ".telcard"]),
    ("componentes/catalogo.css",     [".explorer", ".filters", ".results", ".card", ".cards",
                                      ".specs", ".fam", ".fams", ".shelf", ".shelf-space",
                                      ".more", ".eco", ".side"]),
    ("componentes/dialogo.css",      ["dialog", ".sheet", ".panel", ".palette", ".trayitem",
                                      ".step", ".steps", ".toast", ".a11y", ".check", ".empty"]),
    ("componentes/servicios.css",    [".svc", ".svcs", ".sector", ".sectors", ".brands",
                                      ".tablewrap", "table.data", ".faq"]),
    ("componentes/formulario.css",   [".form", ".formstatus", ".field", ".field-search", ".fgroup",
                                      ".selectfield", ".consent", ".contact", "input", "select",
                                      "textarea", "label"]),
    ("componentes/delegaciones.css", [".deleg", ".delegs"]),
    ("componentes/pie.css",          [".footer"]),
    ("componentes/movil.css",        [".thumbbar", ".mcol"]),
    ("base/estados.css",           [".reveal", ".cv"]),
    ("base/maquetacion.css",         [".band", ".wrap", ".grid",
                                      ".stack", ".row", ".head", ".kicker", ".prose"]),
]
POR_DEFECTO = "base/utilidades.css"

# Aplanado y ordenado por especificidad textual: el prefijo más largo manda.
MARCAS = sorted(
    ((marca, archivo) for archivo, lista in MAPA for marca in lista),
    key=lambda par: -len(par[0]),
)


def trocear(css):
    """Devuelve la lista de bloques de primer nivel, con sus comentarios previos."""
    bloques, buffer, profundidad, i = [], "", 0, 0
    while i < len(css):
        c = css[i]
        # Los comentarios se copian tal cual, sin contar llaves
        if c == "/" and css[i:i + 2] == "/*":
            fin = css.find("*/", i + 2)
            fin = len(css) if fin == -1 else fin + 2
            buffer += css[i:fin]
            i = fin
            continue
        buffer += c
        if c == "{":
            profundidad += 1
        elif c == "}":
            profundidad -= 1
            if profundidad == 0:
                bloques.append(buffer.strip())
                buffer = ""
        i += 1
    if buffer.strip():
        bloques.append(buffer.strip())
    return bloques


def desenvolver(css):
    """Quita el `@layer x { ... }` exterior: ahora la capa la pone el @import."""
    salida = []
    for bloque in trocear(css):
        # El comentario de cabecera viaja pegado al bloque, asi que se ignora
        # para localizar el `@layer`; si no, el envoltorio no se detecta.
        sin_comentarios = re.sub(r"^(?:\s*/\*.*?\*/\s*)+", "", bloque, flags=re.S)
        m = re.match(r"^@layer\s+[\w\s,]+\{", sin_comentarios)
        if m:
            bloque = sin_comentarios
            dentro = bloque[m.end():].rsplit("}", 1)[0]
            salida.append(re.sub(r"^  ", "", dentro, flags=re.M))
        else:
            salida.append(bloque)
    return "\n".join(salida)


def destino(bloque):
    """Elige archivo según el primer selector del bloque."""
    cabecera = bloque.split("{", 1)[0]
    # En una media query lo que manda es lo que hay dentro
    if cabecera.strip().startswith("@"):
        interior = bloque.split("{", 1)[1] if "{" in bloque else ""
        cabecera = interior.split("{", 1)[0]
    # Sin el comentario previo, que puede mencionar clases de otro componente
    cabecera = re.sub(r"/\*.*?\*/", " ", cabecera, flags=re.S).lower()
    if bloque.lstrip().startswith("@keyframes"):
        return "base/animaciones.css"
    if bloque.lstrip().startswith("@media print"):
        return "base/impresion.css"
    # `.on-night x` y `.band--night x` son contextos de tema, no componentes:
    # la regla pertenece al archivo de `x`, o el componente la sobrescribiria
    # por caer en una capa anterior.
    sin_contexto = re.sub(r"\.(on-night|band--night)\s+(?=[.:a-z])", "", cabecera)
    if sin_contexto.strip():
        cabecera = sin_contexto
    # Manda el selector de la izquierda: en `.mega__side .kicker` el dueño de la
    # regla es el megamenu, no la utilidad de antetitulo que hay dentro.
    for token in re.findall(r"[.:]?[a-z][a-z0-9_.-]*", cabecera):
        for marca, archivo in MARCAS:
            if token == marca or token.startswith(marca + "__") or token.startswith(marca + "--"):
                return archivo
    return POR_DEFECTO


def main():
    cubos = {archivo: [] for archivo, _ in MAPA}
    cubos[POR_DEFECTO] = []
    for extra in ("base/animaciones.css", "base/impresion.css"):
        cubos[extra] = []
    sueltos = []

    for nombre in FUENTES:
        ruta = os.path.join(VIEJO, nombre)
        if not os.path.exists(ruta):
            sys.exit("No encuentro " + ruta)
        css = desenvolver(io.open(ruta, encoding="utf-8").read())
        for bloque in trocear(css):
            if not bloque.strip():
                continue
            archivo = POR_ORIGEN.get(nombre) or destino(bloque)
            if archivo == POR_DEFECTO:
                sueltos.append(bloque.split("{", 1)[0].strip()[:60])
            cubos[archivo].append(bloque)

    for archivo, bloques in cubos.items():
        ruta = os.path.join(NUEVO, archivo)
        if not os.path.isdir(os.path.dirname(ruta)):
            os.makedirs(os.path.dirname(ruta))
        cuerpo = "\n\n".join(bloques) + "\n"
        io.open(ruta, "w", encoding="utf-8").write(cuerpo)
        print("  %-38s %4d lineas  %3d reglas"
              % (archivo, len(cuerpo.splitlines()), len(bloques)))
    print("\n  sin clasificar (van a utilidades): %d reglas" % len(sueltos))
    for selector in sueltos:
        print("      " + selector)


if __name__ == "__main__":
    main()
