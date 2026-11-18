#!/usr/bin/env bash
# Crea una base PostgreSQL desde cero, aplica las migraciones y corre las pruebas.
# Uso: tools/probar_db.sh            (levanta un PostgreSQL temporal local)
#      DATABASE_URL=... tools/probar_db.sh   (usa una base existente y vacía, por ejemplo en CI)
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TEMP=""

limpiar() {
  if [[ -n "$TEMP" ]]; then
    su postgres -c "$PG_BIN/pg_ctl -D $TEMP/datos -m fast stop" >/dev/null 2>&1 || true
    rm -rf "$TEMP"
  fi
}
trap limpiar EXIT

if [[ -z "${DATABASE_URL:-}" ]]; then
  PG_BIN="$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)"
  TEMP="$(mktemp -d)"
  chown postgres "$TEMP"
  su postgres -c "$PG_BIN/initdb -D $TEMP/datos -A trust -U postgres" >/dev/null
  su postgres -c "$PG_BIN/pg_ctl -D $TEMP/datos -o '-k $TEMP -p 54329 -c listen_addresses=' -l $TEMP/log -w start" >/dev/null
  DATABASE_URL="postgresql://postgres@/postgres?host=$TEMP&port=54329"
fi

psql_q() { psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }

echo "== Imitación de Supabase"
psql_q -f "$RAIZ/db/test/00_supabase_local.sql"
for m in "$RAIZ"/db/migrations/*.sql; do
  echo "== Migración $(basename "$m")"
  psql_q -f "$m"
done
# Las pruebas corren dentro de una transacción que se deshace al final.
for t in "$RAIZ"/db/test/[1-9]*.sql; do
  echo "== Prueba $(basename "$t")"
  psql_q -f "$t"
done
for s in "$RAIZ"/db/seed/*.sql; do
  [[ -e "$s" ]] || continue
  echo "== Datos $(basename "$s")"
  psql_q -f "$s"
done
for v in "$RAIZ"/db/test/verificar_*.sql; do
  [[ -e "$v" ]] || continue
  echo "== Verificación $(basename "$v")"
  psql_q -f "$v"
done
