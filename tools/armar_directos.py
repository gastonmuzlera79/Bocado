"""Arma todos los recetarios sin extracción cruda listados en data/recetas/lotes_101/fuentes.json.

Cada entrada "nombre": "Adaptada de: …" lee lotes_101/<nombre>.jsonl y escribe data/recetas/airfryer101_<nombre>.json.
Uso: python3 tools/armar_directos.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from recetario import cmd_directo  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
CARPETA = RAIZ / "data/recetas/lotes_101"

for nombre, fuente in json.loads((CARPETA / "fuentes.json").read_text(encoding="utf-8")).items():
    cmd_directo(CARPETA / f"{nombre}.jsonl", RAIZ / f"data/recetas/airfryer101_{nombre}.json", "a101", fuente)
