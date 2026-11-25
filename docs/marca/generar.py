"""Genera los archivos del logo de Olleando en SVG, con el texto convertido a trazos.

Uso: python3 generar.py <carpeta de salida>
Necesita fonttools y brotli, y en fuentes/ junto al script:
Fraunces_opsz_wght_72_700.woff2 e Inter_wght_600.woff2 (Google Fonts, licencia OFL).
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

AQUI = Path(__file__).parent
SAL = Path(sys.argv[1])
SAL.mkdir(parents=True, exist_ok=True)

VERDE, VERDE_CLARO, NARANJA, NARANJA_TEXTO = "#0d631b", "#a3f69c", "#fc820c", "#b85a08"
OSCURO, TINTA_CLARA = "#131712", "#f3f6ef"
TITULO, LEMA = "Fraunces_opsz_wght_72_700.woff2", "Inter_wght_600.woff2"


def texto(fuente, cadena, tam, x, y, espaciado=0.0):
    f = TTFont(AQUI / "fuentes" / fuente)
    g, cmap, esc = f.getGlyphSet(), f.getBestCmap(), tam / f["head"].unitsPerEm
    pen, cur = SVGPathPen(g), 0.0
    for ch in cadena:
        n = cmap[ord(ch)]
        g[n].draw(TransformPen(pen, (esc, 0, 0, -esc, x + cur, y)))
        cur += f["hmtx"][n][0] * esc + espaciado
    return pen.getCommands(), cur - espaciado


def simbolo(linea, cuchara=NARANJA):
    return (f'<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M44 8 L33 27" stroke="{cuchara}" stroke-width="5"/>'
            f'<path d="M22 19c-3-3 3-5 0-9" stroke="{linea}" stroke-width="3.5" opacity=".5"/>'
            f'<path d="M6 28 H58 M11 28 V41 a13 13 0 0 0 13 13 H40 a13 13 0 0 0 13 -13 V28 M3 34 H9 M55 34 H61" '
            f'stroke="{linea}" stroke-width="5"/></g>')


def svg(w, h, cuerpo, fondo=None):
    f = f'<rect width="{w}" height="{h}" fill="{fondo}"/>' if fondo else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
            f'aria-label="Olleando"><title>Olleando</title>{f}{cuerpo}</svg>\n')


def guardar(n, c):
    (SAL / n).write_text(c, encoding="utf-8")


def horizontal(oscuro=False):
    tinta, lema = (TINTA_CLARA, NARANJA) if oscuro else (VERDE, NARANJA_TEXTO)
    d, w = texto(TITULO, "Olleando", 66, 150, 92)
    d2, w2 = texto(LEMA, "RASCANDO LA OLLA", 14.5, 153, 122, 3.2)
    ancho = int(150 + max(w, w2) + 40)
    cuerpo = (f'<g transform="translate(40 28) scale(1.45)">{simbolo(VERDE_CLARO if oscuro else VERDE)}</g>'
              f'<path d="{d}" fill="{tinta}"/><path d="{d2}" fill="{lema}"/>')
    return svg(ancho, 160, cuerpo, OSCURO if oscuro else None)


def vertical():
    _, w = texto(TITULO, "Olleando", 76, 0, 0)
    _, w2 = texto(LEMA, "RASCANDO LA OLLA", 16, 0, 0, 3.6)
    ancho = int(max(w, w2) + 80)
    d, _ = texto(TITULO, "Olleando", 76, (ancho - w) / 2, 232)
    d2, _ = texto(LEMA, "RASCANDO LA OLLA", 16, (ancho - w2) / 2, 270, 3.6)
    cuerpo = (f'<g transform="translate({ancho / 2 - 64} 20) scale(2)">{simbolo(VERDE)}</g>'
              f'<path d="{d}" fill="{VERDE}"/><path d="{d2}" fill="{NARANJA_TEXTO}"/>')
    return svg(ancho, 300, cuerpo)


guardar("olleando-logo-horizontal.svg", horizontal())
guardar("olleando-logo-horizontal-oscuro.svg", horizontal(oscuro=True))
guardar("olleando-logo-vertical.svg", vertical())
guardar("olleando-isotipo.svg", svg(64, 64, simbolo(VERDE)))
guardar("olleando-isotipo-oscuro.svg", svg(64, 64, simbolo(VERDE_CLARO), OSCURO))
guardar("olleando-icono.svg", svg(64, 64, f'<rect width="64" height="64" rx="14" fill="{VERDE}"/>'
                                    f'<g transform="translate(9 8) scale(.72)">{simbolo("#ffffff")}</g>'))
print("listo:", sorted(p.name for p in SAL.glob("*.svg")))
