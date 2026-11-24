# Bocado

Qué cocinar con lo que ya tenés en casa, plan de la semana y lista de compras. Pensada para cocina argentina de todos los días.

## Probarlo

Requiere Node 20 o superior. No hay dependencias que instalar.

```bash
npm start
```

Abrí http://localhost:3000. Escribí ingredientes separados por coma y mirá las recetas posibles.

```bash
npm test
```

## Publicación

Al mergear a `main`, el workflow `.github/workflows/pages.yml` corre los tests y publica la web en GitHub Pages (https://gastonmuzlera79.github.io/Bocado/). Requiere que en Settings > Pages la fuente sea "GitHub Actions". Para generar el sitio localmente: `bash scripts/build-site.sh`.

## Estructura

| Ruta | Contenido |
|---|---|
| `src/core/` | Lógica: normalización, sugerencias, plan, lista de compras |
| `src/data/recipes.json` | Recetas de ejemplo |
| `web/` | Interfaz web |
| `server.js` | Servidor estático para desarrollo |
| `scripts/build-site.sh` | Arma la carpeta publicable para Pages |
| `.github/workflows/` | Tests y despliegue |
| `test/` | Tests con el runner de Node |
| `docs/competidores.md` | Análisis de competidores y qué sumar |
| `docs/producto.md` | Alcance, límites y próximos pasos |

## Estado

Versión 0.1, prototipo. Ver los límites conocidos en [docs/producto.md](docs/producto.md).
