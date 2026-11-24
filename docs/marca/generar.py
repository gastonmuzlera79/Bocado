"""Genera el logo de Olleando en SVG, con el texto convertido a trazos."""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

AQUI = Path(__file__).parent
SALIDA = Path(sys.argv[1])
SALIDA.mkdir(parents=True, exist_ok=True)

VERDE = "#0d631b"
VERDE_CLARO = "#a3f69c"
NARANJA = "#fc820c"
TINTA_OSCURA = "#f3f6ef"


def texto(fuente, cadena, tam, x, y, espaciado=0.0):
    """Devuelve (path d, ancho) del texto en coordenadas SVG, con la línea de base en y."""
    f = TTFont(AQUI / "fuentes" / fuente)
    glyphs = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f["hmtx"]
    escala = tam / f["head"].unitsPerEm
    pen = SVGPathPen(glyphs)
    cursor = 0.0
    for ch in cadena:
        nombre = cmap[ord(ch)]
        tp = TransformPen(pen, (escala, 0, 0, -escala, x + cursor, y))
        glyphs[nombre].draw(tp)
        cursor += hmtx[nombre][0] * escala + espaciado
    return pen.getCommands(), cursor - espaciado


def ancho(fuente, cadena, tam, espaciado=0.0):
    return texto(fuente, cadena, tam, 0, 0, espaciado)[1]


def olla(cuerpo, cuchara, burbujas, brillo):
    """Isotipo en una caja de 120 x 120: olla con cuchara de madera y burbujas."""
    return f"""
  <g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="44" cy="34" r="6" fill="{burbujas}"/>
    <circle cx="58" cy="24" r="4.2" fill="{burbujas}"/>
    <circle cx="47" cy="14" r="2.8" fill="{burbujas}"/>
    <path d="M101 9 L70 47" stroke="{cuchara}" stroke-width="8" fill="none"/>
    <rect x="6" y="60" width="14" height="8" rx="4" fill="{cuerpo}"/>
    <rect x="100" y="60" width="14" height="8" rx="4" fill="{cuerpo}"/>
    <path d="M18 54 H102 V80 A24 24 0 0 1 78 104 H42 A24 24 0 0 1 18 80 Z" fill="{cuerpo}"/>
    <rect x="12" y="45" width="96" height="11" rx="5.5" fill="{cuerpo}"/>
    <path d="M30 70 V80 A12 12 0 0 0 42 92" stroke="{brillo}" stroke-width="5" fill="none"/>
  </g>"""


def svg(ancho_px, alto_px, contenido, fondo=None, titulo="Olleando"):
    rect = f'<rect width="{ancho_px}" height="{alto_px}" fill="{fondo}"/>' if fondo else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho_px} {alto_px}" '
            f'width="{ancho_px}" height="{alto_px}" role="img" aria-label="{titulo}">'
            f"<title>{titulo}</title>{rect}{contenido}\n</svg>\n")


def guardar(nombre, contenido):
    (SALIDA / nombre).write_text(contenido, encoding="utf-8")


# Isotipo solo
iso = olla(VERDE, NARANJA, NARANJA, VERDE_CLARO)
guardar("olleando-isotipo.svg", svg(120, 120, iso))
guardar("olleando-isotipo-oscuro.svg",
        svg(120, 120, olla(VERDE_CLARO, NARANJA, NARANJA, VERDE), fondo="#131712"))

# Ícono de app: fondo verde redondeado
icono = (f'<rect width="120" height="120" rx="28" fill="{VERDE}"/>'
         f'<g transform="translate(9 11) scale(0.85)">{olla("#ffffff", NARANJA, NARANJA, VERDE)}</g>')
guardar("olleando-icono.svg", svg(120, 120, icono))


def horizontal(c_texto, c_lema, oscuro=False):
    tam, lema_tam = 64, 19
    x_texto = 136
    d_nombre, w_nombre = texto("fredoka.woff2", "Olleando", tam, x_texto, 72)
    w_lema = ancho("nunito.woff2", "RASCANDO LA OLLA", lema_tam, 2.6)
    d_lema, _ = texto("nunito.woff2", "RASCANDO LA OLLA", lema_tam, x_texto + 3, 102, 2.6)
    w = int(x_texto + max(w_nombre, w_lema) + 12)
    cuerpo = VERDE_CLARO if oscuro else VERDE
    brillo = VERDE if oscuro else VERDE_CLARO
    contenido = (f'<g transform="translate(0 0)">{olla(cuerpo, NARANJA, NARANJA, brillo)}</g>'
                 f'<path d="{d_nombre}" fill="{c_texto}"/><path d="{d_lema}" fill="{c_lema}"/>')
    return svg(w, 120, contenido, fondo="#131712" if oscuro else None)


guardar("olleando-logo-horizontal.svg", horizontal(VERDE, NARANJA))
guardar("olleando-logo-horizontal-oscuro.svg", horizontal(TINTA_OSCURA, NARANJA, oscuro=True))


def vertical():
    tam, lema_tam = 72, 20
    w_nombre = ancho("fredoka.woff2", "Olleando", tam)
    w_lema = ancho("nunito.woff2", "RASCANDO LA OLLA", lema_tam, 3)
    w = int(max(w_nombre, w_lema) + 40)
    d_nombre, _ = texto("fredoka.woff2", "Olleando", tam, (w - w_nombre) / 2, 222)
    d_lema, _ = texto("nunito.woff2", "RASCANDO LA OLLA", lema_tam, (w - w_lema) / 2, 260, 3)
    contenido = (f'<g transform="translate({(w - 150) / 2} 10) scale(1.25)">'
                 f'{olla(VERDE, NARANJA, NARANJA, VERDE_CLARO)}</g>'
                 f'<path d="{d_nombre}" fill="{VERDE}"/><path d="{d_lema}" fill="{NARANJA}"/>')
    return svg(w, 280, contenido)


guardar("olleando-logo-vertical.svg", vertical())
print("listo:", sorted(p.name for p in SALIDA.iterdir()))
