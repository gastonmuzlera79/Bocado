"""Genera los datos iniciales de la base (db/seed/*.sql) a partir de data/catalogo y data/recetas.

- 0001_catalogo.sql: ingredientes (con nutrición por 100 g del USDA) y sinónimos.
- 0002_recetario.sql: recetas publicadas, ingredientes unidos al catálogo, pasos y nutrición por porción.

La nutrición por porción se estima sumando cada ingrediente convertido a gramos. Si más del 25 % del peso
de los ingredientes no básicos no se puede convertir, la receta queda sin nutrición en lugar de mostrar
un número poco confiable.

Uso: python3 tools/generar_seed.py
"""
import json
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalogo import cargar_catalogo, indice_nombres, resolver, norm  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
NS = uuid.UUID("6f1f4c1e-7c1a-4a8e-9c2b-b0cad0000001")  # ids estables entre regeneraciones

# Gramos aproximados por unidad de medida cuando el ingrediente no tiene un dato propio.
GRAMOS_FIJOS = {"g": 1, "kg": 1000, "ml": 1, "l": 1000, "pizca": 0.5, "feta": 20, "diente": 3,
                "rodaja": 28, "lata": 120, "tapa": 25, "lámina": 30, "filete": 150, "hoja": 1,
                "rama": 2, "puñado": 30, "chorro": 10, "sobre": 7, "vaso": 200, "porción": 100}


def lit(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(round(v, 2)) if isinstance(v, float) else str(v)
    return "'" + str(v).replace("'", "''") + "'"


def arr(v):
    return "array[" + ", ".join(lit(x) for x in v) + "]::text[]" if v else "'{}'::text[]"


def gramos(ing, ficha):
    """Convierte cantidad + unidad a gramos. Devuelve None si no se puede."""
    cant, unidad = ing.get("cantidad"), ing.get("unidad")
    if cant is None:
        return None
    g_unidad, g_taza = ficha[4], ficha[5]
    if unidad in (None, "unidad"):
        return cant * g_unidad if g_unidad else None
    if unidad == "taza":
        return cant * g_taza if g_taza else None
    if unidad == "cucharada":
        return cant * (g_taza / 16 if g_taza else 12)
    if unidad == "cucharadita":
        return cant * (g_taza / 48 if g_taza else 4)
    if unidad in GRAMOS_FIJOS:
        return cant * GRAMOS_FIJOS[unidad]
    return None


def texto_ingrediente(i):
    cant, unidad, nombre = i.get("cantidad"), i.get("unidad"), i["nombre"]
    if cant is None:
        base = nombre
    else:
        c = {0.25: "¼", 0.5: "½", 0.75: "¾", 1.5: "1 ½"}.get(cant, f"{cant:g}")
        plural = cant > 1
        u = {"unidad": "", "taza": "tazas" if plural else "taza", "cucharada": "cucharadas" if plural else "cucharada",
             "cucharadita": "cucharaditas" if plural else "cucharadita", "feta": "fetas" if plural else "feta",
             "diente": "dientes" if plural else "diente", "rodaja": "rodajas" if plural else "rodaja",
             "lata": "latas" if plural else "lata", "tapa": "", "lámina": "láminas" if plural else "lámina",
             "filete": "filetes" if plural else "filete"}.get(unidad, unidad or "")
        base = f"{c} {u} de {nombre}".replace("  ", " ") if u else f"{c} {nombre}"
    if i.get("nota"):
        base += f" ({i['nota']})"
    return base


def main():
    cat = cargar_catalogo()
    idx = indice_nombres(cat)
    nutri = json.loads((RAIZ / "data/catalogo/nutricion.json").read_text(encoding="utf-8"))
    ids = {n: uuid.uuid5(NS, "ing:" + n) for n in cat}

    out = ["-- Generado por tools/generar_seed.py. No editar a mano.", "begin;"]
    for nombre, ficha in cat.items():
        categoria, basico, sinonimos, _claves, g_u, g_t = ficha
        n = nutri.get(nombre, {})
        fuente = f"USDA FoodData Central SR Legacy #{n['fdc_id']}: {n['usda']}" if n else None
        out.append(
            "insert into public.ingredientes (id, nombre, categoria, es_basico, gramos_por_unidad, gramos_por_taza, "
            "kcal_100g, proteinas_100g, grasas_100g, carbohidratos_100g, fibra_100g, fuente_nutricion) values ("
            + ", ".join(lit(x) for x in [str(ids[nombre]), nombre, categoria, bool(basico), g_u, g_t,
                                         n.get("kcal"), n.get("proteinas"), n.get("grasas"),
                                         n.get("carbohidratos"), n.get("fibra"), fuente])
            + ") on conflict (nombre) do nothing;")
        for s in sinonimos:
            out.append(f"insert into public.sinonimos values ({lit(norm(s))}, {lit(str(ids[nombre]))}) on conflict do nothing;")
    out.append("commit;")
    (RAIZ / "db/seed/0001_catalogo.sql").write_text("\n".join(out) + "\n", encoding="utf-8")

    out = ["-- Generado por tools/generar_seed.py. No editar a mano.", "begin;"]
    total, con_nutri = 0, 0
    for f in sorted((RAIZ / "data/recetas").glob("*.json")):
        for r in json.loads(f.read_text(encoding="utf-8")):
            total += 1
            rid = uuid.uuid5(NS, "receta:" + r["origen_ref"])
            filas, suma, peso_ok, peso_total = [], {"kcal": 0, "proteinas": 0, "grasas": 0, "carbohidratos": 0}, 0, 0
            for orden, i in enumerate(r["ingredientes"], 1):
                canon = resolver(i["nombre"], idx)
                filas.append((orden, ids.get(canon), texto_ingrediente(i), i.get("cantidad"), i.get("unidad"),
                              i.get("nota"), i.get("opcional", False)))
                if canon is None or cat[canon][1]:
                    continue  # grupos de condimentos y básicos no pesan en la estimación
                g = gramos(i, cat[canon])
                peso_total += 1
                if g is not None and canon in nutri:
                    peso_ok += 1
                    for k in suma:
                        suma[k] += nutri[canon][k] * g / 100
                elif canon in ("aceite", "aceite de oliva") and g:
                    peso_ok += 1
            porciones = r.get("porciones") or 1
            estimada = None
            if r.get("nutricion"):  # valores que trae el libro: se respetan tal cual
                nut, estimada = {k: r["nutricion"].get(k) for k in suma}, "false"
                con_nutri += 1
            elif peso_total and peso_ok / peso_total >= 0.75:
                nut, estimada = {k: round(v / porciones, 1) for k, v in suma.items()}, "true"
                con_nutri += 1
            else:
                nut = {k: None for k in suma}
            out.append(
                "insert into public.recetas (id, slug, titulo, descripcion, categoria, tecnica, porciones, "
                "tiempo_coccion_min, temperatura_c, dificultad, consejo, etiquetas, estado, origen, origen_ref, "
                "fuente_visible, kcal_porcion, proteinas_porcion, grasas_porcion, carbohidratos_porcion, nutricion_estimada) values ("
                + ", ".join([lit(str(rid)), lit(r["slug"]), lit(r["titulo"]), lit(r["descripcion"]), lit(r.get("categoria")),
                             lit(r.get("tecnica")), lit(r.get("porciones")), lit(r.get("tiempo_coccion_min")),
                             lit(r.get("temperatura_c")), lit(r["dificultad"]), lit(r.get("consejo")), arr(r.get("etiquetas", [])),
                             "'publicada'", "'recetario'", lit(r["origen_ref"]), lit(r.get("fuente_visible")),
                             lit(nut["kcal"]), lit(nut["proteinas"]), lit(nut["grasas"]), lit(nut["carbohidratos"]),
                             estimada or "null"])
                + ") on conflict (slug) do nothing;")
            for orden, iid, texto, cant, unidad, nota, opc in filas:
                out.append("insert into public.receta_ingredientes values ("
                           + ", ".join([lit(str(rid)), str(orden), lit(str(iid) if iid else None), lit(texto),
                                        lit(cant), lit(unidad), lit(nota), lit(opc)]) + ") on conflict do nothing;")
            for orden, paso in enumerate(r["pasos"], 1):
                out.append(f"insert into public.receta_pasos values ({lit(str(rid))}, {orden}, {lit(paso)}) on conflict do nothing;")
    out.append("commit;")
    (RAIZ / "db/seed/0002_recetario.sql").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"Catálogo: {len(cat)} ingredientes. Recetario: {total} recetas, {con_nutri} con nutrición.")


if __name__ == "__main__":
    main()
