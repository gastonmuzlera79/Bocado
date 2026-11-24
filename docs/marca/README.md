# Marca de Olleando

Logo: una olla dibujada con una sola línea y una cuchara de madera adentro, por "rascando la olla".

| Archivo | Uso |
|---|---|
| `olleando-logo-horizontal.svg` | Encabezados, documentos, mails |
| `olleando-logo-horizontal-oscuro.svg` | Lo mismo, sobre fondo oscuro |
| `olleando-logo-vertical.svg` | Portadas, redes, piezas cuadradas |
| `olleando-isotipo.svg` | La olla sola, sin fondo |
| `olleando-isotipo-oscuro.svg` | La olla sola, sobre fondo oscuro |
| `olleando-icono.svg` | Ícono de app y favicon (también en `web/app/icon.svg`) |

Los PNG en alta resolución están en Drive, carpeta OLLEANDO APP › 01_Marca.

## Colores

- Verde `#0d631b`: olla y nombre.
- Verde claro `#a3f69c`: brillo de la olla; reemplaza al verde sobre fondos oscuros.
- Naranja `#fc820c`: cuchara. El lema usa un naranja más oscuro, `#b85a08`, para que se lea sobre fondo claro. No usarlo para texto chico sobre fondo claro: no tiene contraste suficiente.

## Tipografías

- Nombre y títulos de la web: Fraunces Bold.
- Lema y texto de la web: Inter (el lema en SemiBold, mayúsculas y con espaciado).

Las dos son de Google Fonts con licencia SIL Open Font License, que permite usarlas en un logo. En los SVG el texto ya está convertido a trazos; en la web se cargan con `next/font`, que las sirve desde el mismo sitio.

## Fotos de los platos

Cada tipo de plato tiene una foto en `web/public/platos/<tipo>.webp` (960 × 640). Se generaron con la IA de imágenes de Figma, todas con la misma consigna: vista desde arriba, plato blanco liso sobre mesa de madera clara, luz natural de costado, tonos cálidos, sin texto, manos ni marcas. En la ficha de cada receta se aclara que es una imagen ilustrativa y no una foto de esa receta.

Para sumar un tipo nuevo, generar la foto con la misma consigna y guardarla con el nombre del tipo.

## Regenerar

`generar.py` arma los SVG. Necesita `pip install fonttools brotli` y los archivos `Fraunces_opsz_wght_72_700.woff2` e `Inter_wght_600.woff2` (Google Fonts) en una carpeta `fuentes/` junto al script:

```bash
python3 docs/marca/generar.py docs/marca
```
