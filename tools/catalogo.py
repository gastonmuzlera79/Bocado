"""Catálogo de ingredientes: nutrición desde USDA FoodData Central (SR Legacy, dominio público) y cobertura.

Comandos:
  nutricion <carpeta_csv_usda>   Completa data/catalogo/nutricion.json (kcal y macronutrientes por 100 g)
                                 eligiendo, para cada ingrediente, el alimento cuya descripción contiene
                                 todas las palabras clave. Muestra lo elegido para revisar.
  cobertura                      Lista los nombres de ingredientes del recetario que no están en el catálogo.
"""
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "data/catalogo/ingredientes.json"
NUTRICION = RAIZ / "data/catalogo/nutricion.json"
NUTRIENTES = {"1008": "kcal", "1003": "proteinas", "1004": "grasas", "1005": "carbohidratos", "1079": "fibra"}


def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower().strip())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def cargar_catalogo():
    datos = json.loads(CATALOGO.read_text(encoding="utf-8"))
    return {k: v for k, v in datos.items() if not k.startswith("_")}


def indice_nombres(cat):
    idx = {}
    for nombre, (_, _, sinonimos, *_resto) in cat.items():
        idx[norm(nombre)] = nombre
        for s in sinonimos:
            idx[norm(s)] = nombre
    return idx


def resolver(nombre, idx):
    """Devuelve el ingrediente canónico, o None si es un grupo de condimentos o no está."""
    n = norm(nombre)
    if n in idx:
        return idx[n]
    # Quitar aclaraciones comunes: "carne vacuna magra", "pan integral grueso"
    for sufijo in (" magra", " magro", " fresca", " fresco", " grandes", " grande", " chica", " chico"):
        if n.endswith(sufijo) and n[: -len(sufijo)] in idx:
            return idx[n[: -len(sufijo)]]
    return None


def es_grupo(nombre):
    return "," in nombre or " y " in nombre or " o " in nombre


def cmd_nutricion(carpeta):
    carpeta = Path(carpeta)
    foods = {}
    with open(carpeta / "food.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            foods[r["fdc_id"]] = r["description"]
    valores = {}
    with open(carpeta / "food_nutrient.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["nutrient_id"] in NUTRIENTES:
                valores.setdefault(r["fdc_id"], {})[NUTRIENTES[r["nutrient_id"]]] = float(r["amount"])
    salida, faltan = {}, []
    for nombre, (_, _, _, claves, *_r) in cargar_catalogo().items():
        if not claves:
            continue
        partes = [p.strip().lower() for p in claves.split("|")]
        candidatos = [(fid, d) for fid, d in foods.items() if all(p in d.lower() for p in partes)]
        if not candidatos:
            faltan.append((nombre, claves))
            continue
        fid, desc = min(candidatos, key=lambda x: len(x[1]))
        v = valores.get(fid, {})
        salida[nombre] = {"fdc_id": int(fid), "usda": desc, **{k: round(v.get(k, 0.0), 2) for k in NUTRIENTES.values()}}
        print(f"{nombre:28} {v.get('kcal', 0):6.0f} kcal  ← {desc[:80]}")
    NUTRICION.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n{len(salida)} ingredientes con nutrición. Sin coincidencia en USDA: {len(faltan)}")
    for n, c in faltan:
        print(f"  FALTA {n}: {c}")


def cmd_cobertura():
    idx = indice_nombres(cargar_catalogo())
    faltan = {}
    for f in sorted((RAIZ / "data/recetas").glob("*.json")):
        for r in json.loads(f.read_text(encoding="utf-8")):
            for i in r["ingredientes"]:
                if resolver(i["nombre"], idx) is None and not es_grupo(i["nombre"]):
                    faltan[i["nombre"]] = faltan.get(i["nombre"], 0) + 1
    for n, c in sorted(faltan.items(), key=lambda x: -x[1]):
        print(f"{c:4}  {n}")
    print(f"{len(faltan)} nombres sin catálogo")
    return 1 if faltan else 0


if __name__ == "__main__":
    c, *a = sys.argv[1:]
    if c == "nutricion":
        cmd_nutricion(a[0])
    elif c == "cobertura":
        sys.exit(cmd_cobertura())
    else:
        raise SystemExit(__doc__)
