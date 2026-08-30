# -*- coding: utf-8 -*-
"""
Genera el recorte del héroe para móvil.

En pantalla estrecha la foto se ve a 375x136 CSS (relación 2,76) porque el CSS
la recorta con `object-fit: cover`. Servir ahí la versión de 800x500 significa
descargar casi la mitad de los píxeles para tirarlos: el navegador no puede
saber que el recorte va a quitar esa altura.

La solución es dirección de arte: una imagen distinta, ya recortada, elegida con
`<picture>` y `media`. `srcset` por sí solo no sirve, porque sólo sabe cambiar
de tamaño, no de encuadre.

El encuadre se desplaza hacia la parte alta de la foto, donde está el rótulo de
la nave: es lo que hace que la imagen se reconozca como una delegación de GAM.

Uso:  python scripts/recorte-heroe.py
"""
import io
import os

from PIL import Image

ORIGEN = "public/img/hero-xl.webp"
DESTINO = "public/img/hero-mov.webp"
DESTINO_AVIF = "public/img/hero-mov.avif"

# 2,76 es la relación exacta del hueco en móvil; 800 de ancho cubre 375 CSS
# a densidad 2, que es lo que tiene prácticamente cualquier móvil actual.
ANCHO = 800
ALTO = 290


def main():
    if not os.path.exists(ORIGEN):
        raise SystemExit("No encuentro " + ORIGEN)

    imagen = Image.open(ORIGEN).convert("RGB")
    ancho_original, alto_original = imagen.size

    # El encuadre no va centrado: se desplaza hacia arriba para que entre el
    # rótulo de la nave, que es lo que identifica la foto como de GAM. Un
    # recorte centrado deja sólo maquinaria genérica.
    SESGO_SUPERIOR = 0.28

    relacion = ANCHO / ALTO
    alto_recorte = int(ancho_original / relacion)
    if alto_recorte > alto_original:
        alto_recorte = alto_original
    arriba = int((alto_original - alto_recorte) * SESGO_SUPERIOR)

    recorte = imagen.crop((0, arriba, ancho_original, arriba + alto_recorte))
    recorte = recorte.resize((ANCHO, ALTO), Image.LANCZOS)
    # 75 es donde la curva se aplana: por debajo se gana muy poco peso y la
    # foto es oscura y desaturada, asi que el ruido de compresion no se ve.
    recorte.save(DESTINO, "WEBP", quality=75, method=6)

    # AVIF comprime un 25 % mejor que WebP en esta foto. Va como primera opcion
    # del <picture>, con el WebP detras para navegadores que no lo soporten.
    recorte.save(DESTINO_AVIF, "AVIF", quality=50)

    print("  %s  %dx%d" % (ORIGEN, ancho_original, alto_original))
    for salida in (DESTINO, DESTINO_AVIF):
        print("    -> %-30s %dx%d  %d KB"
              % (salida, ANCHO, ALTO, os.path.getsize(salida) / 1024))


if __name__ == "__main__":
    main()
