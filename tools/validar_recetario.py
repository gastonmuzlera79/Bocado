"""Valida los archivos del recetario base (data/recetas/*.json).

Uso: python3 tools/validar_recetario.py data/recetas
Sale con error si alguna receta no cumple las reglas mínimas.
"""
import json
import sys
from pathlib import Path

UNIDADES = {None, "g", "kg", "ml", "l", "taza", "cucharada", "cucharadita", "unidad", "feta", "diente",
            "rodaja", "puñado", "pizca", "lata", "paquete", "hoja", "rama", "atado", "tapa", "lámina",
            "sobre", "vaso", "chorro", "cm", "porción", "filete", "tira", "bola", "planta"}
DIFICULTADES = {"fácil", "media", "difícil"}


def validar(r, nombre):
    errores = []
    if not r.get("titulo") or len(r["titulo"]) < 3:
        errores.append("sin título")
    if not r.get("descripcion"):
        errores.append("sin descripción")
    if not r.get("ingredientes"):
        errores.append("sin ingredientes")
    if not r.get("pasos") or len(r["pasos"]) < 1:
        errores.append("sin pasos")
    if r.get("dificultad") not in DIFICULTADES:
        errores.append(f"dificultad inválida: {r.get('dificultad')}")
    if r.get("origen") == "recetario" and not (r.get("fuente_visible") or "").startswith("Adaptada de:"):
        errores.append("falta 'Adaptada de:'")
    for i in r.get("ingredientes", []):
        if not i.get("nombre"):
            errores.append("ingrediente sin nombre")
        if i.get("unidad") not in UNIDADES:
            errores.append(f"unidad desconocida: {i.get('unidad')}")
        if i.get("cantidad") is not None and not isinstance(i["cantidad"], (int, float)):
            errores.append(f"cantidad no numérica: {i.get('cantidad')}")
    return [f"{nombre} · {r.get('slug', r.get('titulo'))}: {e}" for e in errores]


def main(carpeta):
    archivos = sorted(Path(carpeta).glob("*.json"))
    total, errores, slugs = 0, [], {}
    for f in archivos:
        for r in json.loads(f.read_text(encoding="utf-8")):
            total += 1
            errores += validar(r, f.name)
            if r.get("slug") in slugs:
                errores.append(f"{f.name} · slug repetido: {r['slug']} (también en {slugs[r['slug']]})")
            slugs[r.get("slug")] = f.name
    for e in errores[:200]:
        print(e)
    print(f"{total} recetas revisadas en {len(archivos)} archivos, {len(errores)} errores")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "data/recetas"))
