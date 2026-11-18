# Bocado

App de recetas que parte de lo que tenés en casa: cargás tu despensa y te muestra qué podés cocinar, qué te falta y con qué reemplazarlo. Los usuarios suman recetas propias o traídas de PDFs, fotos, páginas y videos.

La documentación del proyecto (README general, plan de lanzamiento y flujograma) está en la carpeta `BOCADO APP/00_Docs` del Google Drive del proyecto.

## Estructura

| Carpeta | Contenido |
|---|---|
| `db/migrations` | Esquema de la base (PostgreSQL / Supabase): tablas, roles, permisos por fila, búsqueda por despensa |
| `db/seed` | Datos iniciales: catálogo de ingredientes y recetario base |
| `db/test` | Pruebas de permisos y reglas de negocio |
| `data/recetas` | Recetario base en JSON, reescrito a partir de los recetarios fuente |
| `data/catalogo` | Catálogo de ingredientes (categoría, básico, sinónimos, medidas) y nutrición por 100 g del USDA FoodData Central (SR Legacy, dominio público) |
| `tools` | Scripts: lectura de recetarios, validación, generación de datos, pruebas |
| `web` | Sitio, versión instalable y panel de administración (Next.js) — próxima etapa |
| `worker` | Procesamiento de cargas de usuarios (Python, GitHub Actions) — próxima etapa |

## Probar la base de datos

Requiere PostgreSQL 16 instalado localmente (o una base vacía en `DATABASE_URL`):

```bash
tools/probar_db.sh
```

Crea una base temporal, aplica las migraciones, corre las pruebas de permisos y carga los datos iniciales.

## Reglas del proyecto

- La app funciona completa sin IA. Las funciones con Claude están apagadas hasta que se activen desde el panel.
- No se suben secretos (`.env`) ni material con derechos de autor (PDFs originales) al repositorio.
- Las recetas que vienen de recetarios se publican reescritas, con la referencia "Adaptada de: …".
