#!/usr/bin/env bash
# Arma la carpeta _site con lo mínimo que necesita la web estática.
# Mantiene la misma estructura (web/, src/core, src/data) para que las rutas relativas funcionen.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site/src
cp -r web _site/web
cp -r src/core src/data _site/src/
touch _site/.nojekyll

cat > _site/index.html <<'HTML'
<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=web/">
  <title>Bocado</title>
</head>
<body><a href="web/">Entrar a Bocado</a></body>
</html>
HTML

echo "Sitio generado en _site/"
