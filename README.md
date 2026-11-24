# Olleando

App de recetas que parte de lo que tenés en casa: cargás tu despensa y te muestra qué podés cocinar, qué te falta y con qué reemplazarlo. Los usuarios suman recetas propias o traídas de PDFs, fotos, páginas y videos.

La documentación del proyecto (README general, plan de lanzamiento y flujograma) está en la carpeta `00_Docs` del Google Drive del proyecto.

## Estructura

| Carpeta | Contenido |
|---|---|
| `db/migrations` | Esquema de la base (PostgreSQL / Supabase): tablas, roles, permisos por fila, búsqueda por despensa |
| `db/seed` | Datos iniciales: catálogo de ingredientes y recetario base |
| `db/test` | Pruebas de permisos y reglas de negocio |
| `data/recetas` | Recetario base en JSON, reescrito a partir de los recetarios fuente |
| `data/catalogo` | Catálogo de ingredientes (categoría, básico, sinónimos, medidas) y nutrición por 100 g del USDA FoodData Central (SR Legacy, dominio público) |
| `tools` | Scripts: lectura de recetarios, validación, generación de datos, pruebas |
| `web` | Sitio y panel de administración (Next.js + Supabase); sin Supabase configurado funciona en modo demo |
| `worker` | Procesamiento de cargas de usuarios (Python, GitHub Actions) — próxima etapa |

## Probar la base de datos

Requiere PostgreSQL 16 instalado localmente (o una base vacía en `DATABASE_URL`):

```bash
tools/probar_db.sh
```

Crea una base temporal, aplica las migraciones, corre las pruebas de permisos y carga los datos iniciales.

## Web

```bash
cd web
npm install
npm run dev
```

Sin `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `web/.env.example`) arranca en modo demo: lee `web/datos/demo.json`, que genera `tools/generar_demo.py` con los mismos datos y cálculos que `db/seed`. En la demo la despensa se guarda en el navegador y no hay cuentas.

Con Supabase configurado se activan el ingreso por enlace al mail, la despensa en la cuenta, el registro de búsquedas y el panel (`/admin`): métricas, recetas por revisar, reportes, usuarios y roles, configuración y auditoría. Cada sección aparece según los permisos del rol, y la base los vuelve a controlar con sus políticas.

## Recetario base

Hoy tiene 888 recetas reescritas: 690 de "700 Recetas Argentinas para Freidora de Aire" y 198 de la serie "Air Fryer 101 · Sabores sin culpa".

- Libros con extracción cruda (`tools/leer_recetario_airfryer.py`): la reescritura va en `data/recetas/lotes/*.jsonl` y `tools/recetario.py armar` genera el JSON final. `tools/recetario.py copia` controla que no haya frases de 6 palabras copiadas.
- Libros sin extracción cruda: la reescritura va en `data/recetas/lotes_101/<libro>.jsonl` con tiempo, temperatura, categoría y la nutrición del libro; `data/recetas/lotes_101/fuentes.json` dice qué "Adaptada de" lleva cada uno y `tools/armar_directos.py` arma todos. El control de copia es `tools/recetario.py copia_texto <texto.txt> <lote.jsonl>`.
- `tools/validar_recetario.py` revisa campos, unidades, slugs y títulos repetidos; `tools/catalogo.py cobertura` revisa que cada ingrediente esté en el catálogo; `tools/generar_seed.py` arma `db/seed`.
- La nutrición que trae un libro se guarda tal cual (`nutricion_estimada = false`); si no la trae, se estima con el USDA.

## Reglas del proyecto

- La app funciona completa sin IA. Las funciones con Claude están apagadas hasta que se activen desde el panel.
- No se suben secretos (`.env`) ni material con derechos de autor (PDFs originales) al repositorio.
- Las recetas que vienen de recetarios se publican reescritas, con la referencia "Adaptada de: …".
