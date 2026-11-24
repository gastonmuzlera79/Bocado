# Marca de Olleando

Logo: una olla con una cuchara de madera adentro y burbujas, por "rascando la olla".

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
- Naranja `#fc820c`: cuchara, burbujas y lema. No usarlo para texto chico sobre fondo claro: no tiene contraste suficiente.

## Tipografías

- Nombre: Fredoka SemiBold.
- Lema: Nunito ExtraBold, en mayúsculas y con espaciado.

Ambas son de Google Fonts con licencia SIL Open Font License, que permite usarlas en un logo. En los SVG el texto ya está convertido a trazos, así que no hace falta tener las fuentes instaladas para verlos.

## Regenerar

`generar.py` arma los SVG. Necesita `pip install fonttools brotli` y los archivos `fredoka.woff2` y `nunito.woff2` (Google Fonts) en una carpeta `fuentes/` junto al script:

```bash
python3 docs/marca/generar.py docs/marca
```
