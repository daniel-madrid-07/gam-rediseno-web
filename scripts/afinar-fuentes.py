# -*- coding: utf-8 -*-
"""
Recorta los ejes de las fuentes variables a lo que la web usa de verdad.

Archivo viene de Google con el eje de anchura completo (62 a 125) y el de peso
de 500 a 900. La web sólo usa dos anchuras, 82 para los titulares y 92 para los
subtítulos, y pesos de 700 y 800. Todo lo demás son datos de interpolación que
se descargan para no usarse nunca: 87 KB cuando bastan 41.

Esto no es subsetting de caracteres (que rompería si algún día aparece una
letra fuera del conjunto): sólo estrecha los rangos de los ejes. Cualquier
carácter del subconjunto latino se sigue dibujando igual.

Requiere: pip install fonttools brotli
Uso:      python scripts/afinar-fuentes.py   (después de traer-fuentes.mjs)
"""
import glob
import io
import os

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

DIRECTORIO = "src/estilos/fuentes"

# Rangos que la hoja de estilos usa realmente. Se dejan con un poco de margen
# por arriba y por abajo para no tener que tocar esto al ajustar un titular.
RECORTES = {
    "archivo": {"wdth": (82, 92), "wght": (600, 900)},
}


def familia_de(nombre):
    """`archivo-500900-latin.woff2` -> `archivo`."""
    return nombre.split("-")[0]


def main():
    total_antes = 0
    total_despues = 0

    for ruta in sorted(glob.glob(os.path.join(DIRECTORIO, "*.woff2"))):
        nombre = os.path.basename(ruta)
        limites = RECORTES.get(familia_de(nombre))
        antes = os.path.getsize(ruta)
        total_antes += antes

        if not limites:
            total_despues += antes
            continue

        fuente = TTFont(ruta)
        if "fvar" not in fuente:
            # Fuente estática: no hay ejes que recortar
            total_despues += antes
            continue

        recortada = instancer.instantiateVariableFont(
            fuente, limites, inplace=False, updateFontNames=False
        )
        buffer = io.BytesIO()
        recortada.flavor = "woff2"
        recortada.save(buffer)
        datos = buffer.getvalue()

        # Sólo se sustituye si de verdad baja: si no, se deja el original
        if len(datos) < antes:
            io.open(ruta, "wb").write(datos)
            print("  %-42s %4d KB -> %4d KB  (-%d %%)"
                  % (nombre, antes / 1024, len(datos) / 1024,
                     round(100 * (antes - len(datos)) / antes)))
            total_despues += len(datos)
        else:
            total_despues += antes

    print("\n  total %d KB -> %d KB  (-%d KB)"
          % (total_antes / 1024, total_despues / 1024,
             (total_antes - total_despues) / 1024))


if __name__ == "__main__":
    main()
