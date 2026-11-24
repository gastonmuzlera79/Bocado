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

## Estructura

| Ruta | Contenido |
|---|---|
| `src/core/` | Lógica: normalización, sugerencias, plan, lista de compras |
| `src/data/recipes.json` | Recetas de ejemplo |
| `web/` | Interfaz web |
| `server.js` | Servidor estático para desarrollo |
| `test/` | Tests con el runner de Node |
| `docs/competidores.md` | Análisis de competidores y qué sumar |
| `docs/producto.md` | Alcance, límites y próximos pasos |

## Estado

Versión 0.1, prototipo. Ver los límites conocidos en [docs/producto.md](docs/producto.md).
