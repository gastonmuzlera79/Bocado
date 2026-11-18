"""Genera web/datos/demo.json: el recetario y el catálogo en el formato que usa la web en modo demo.

El modo demo deja ver y probar la web sin una base de Supabase. Usa los mismos datos y el mismo cálculo
de nutrición que db/seed, así que lo que se ve en la demo es lo que va a haber en la base.

Uso: python3 tools/generar_demo.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalogo import cargar_catalogo, indice_nombres, resolver  # noqa: E402
from generar_seed import nutricion_receta, texto_ingrediente  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent


def main():
    cat = cargar_catalogo()
    idx = indice_nombres(cat)
    nutri = json.loads((RAIZ / "data/catalogo/nutricion.json").read_text(encoding="utf-8"))

    ingredientes = [
        {"nombre": n, "categoria": f[0], "basico": bool(f[1]), "sinonimos": f[2]}
        for n, f in sorted(cat.items())
    ]
    recetas = []
    for f in sorted((RAIZ / "data/recetas").glob("*.json")):
        for r in json.loads(f.read_text(encoding="utf-8")):
            nut, estimada = nutricion_receta(r, cat, idx, nutri)
            recetas.append({
                "slug": r["slug"],
                "titulo": r["titulo"],
                "descripcion": r["descripcion"],
                "categoria": r.get("categoria"),
                "tecnica": r.get("tecnica"),
                "porciones": r.get("porciones"),
                "minutos": r.get("tiempo_coccion_min"),
                "temperatura": r.get("temperatura_c"),
                "dificultad": r["dificultad"],
                "consejo": r.get("consejo"),
                "etiquetas": r.get("etiquetas", []),
                "fuente": r.get("fuente_visible"),
                "ingredientes": [
                    {"texto": texto_ingrediente(i), "ingrediente": resolver(i["nombre"], idx),
                     "opcional": bool(i.get("opcional"))}
                    for i in r["ingredientes"]
                ],
                "pasos": r["pasos"],
                "nutricion": nut if nut["kcal"] is not None else None,
                "nutricionEstimada": estimada == "true" if estimada else None,
            })
    salida = RAIZ / "web/datos/demo.json"
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps({"ingredientes": ingredientes, "recetas": recetas}, ensure_ascii=False,
                                 separators=(",", ":")), encoding="utf-8")
    print(f"{len(recetas)} recetas y {len(ingredientes)} ingredientes en {salida.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
