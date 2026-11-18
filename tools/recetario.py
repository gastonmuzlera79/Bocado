"""Circuito del recetario base.

Comandos:
  lote     <crudo.json> <desde> <cantidad> [--saltear duplicados.json]
           Muestra un lote de recetas originales en formato compacto, para reescribir.
  armar    <crudo.json> <carpeta_lotes> <salida.json> <fuente_visible>
           Une las reescrituras (data/recetas/lotes/*.jsonl) con los datos fijos del original
           (temperatura, tiempo, porciones, capítulo) y genera el recetario completo.
  copia    <crudo.json> <carpeta_lotes>
           Controla que ningún paso o descripción reescrita repita 6 palabras seguidas del original.

Formato de cada línea de un lote (una receta por línea, JSON):
  {"id": "af-02-006", "t": título, "d": descripción, "p": porciones o null, "dif": "fácil|media|difícil",
   "i": [[cantidad, unidad, nombre, nota, opcional], ...], "s": [pasos], "c": consejo, "e": [etiquetas]}
"""
import json
import re
import sys
import unicodedata
from pathlib import Path


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", (s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ ]+", " ", s)


def slug(s: str) -> str:
    return re.sub(r"\s+", "-", norm(s).strip())[:80]


def id_corto(r):
    return r["id_origen"].rsplit("-", 1)[0]


def cmd_lote(crudo, desde, cantidad, saltear=None):
    datos = json.loads(Path(crudo).read_text(encoding="utf-8"))
    omitir = set(json.loads(Path(saltear).read_text())) if saltear else set()
    datos = [r for r in datos if r["id_origen"] not in omitir]
    for r in datos[int(desde):int(desde) + int(cantidad)]:
        partes = [
            id_corto(r), r["titulo"], r.get("porciones_texto", ""),
            "D: " + r.get("descripcion", ""),
            "I: " + "; ".join(r["ingredientes"]),
            "P: " + " / ".join(r["pasos"]),
            "C: " + " ".join(r["coccion"]),
            "T: " + r.get("tip", ""),
        ]
        print(" | ".join(p for p in partes if p))


def leer_lotes(carpeta):
    out = {}
    for f in sorted(Path(carpeta).glob("*.jsonl")):
        for n, linea in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if linea.strip():
                try:
                    r = json.loads(linea)
                except json.JSONDecodeError as e:
                    raise SystemExit(f"{f.name}:{n}: JSON inválido: {e}")
                out[r["id"]] = r
    return out


def cmd_armar(crudo, carpeta, salida, fuente):
    originales = {id_corto(r): r for r in json.loads(Path(crudo).read_text(encoding="utf-8"))}
    lotes = leer_lotes(carpeta)
    recetas, slugs = [], set()
    for rid, r in lotes.items():
        o = originales.get(rid, {})
        s = slug(r["t"])
        base, k = s, 2
        while s in slugs:
            s, k = f"{base}-{k}", k + 1
        slugs.add(s)
        recetas.append({
            "slug": s,
            "titulo": r["t"],
            "descripcion": r["d"],
            "categoria": o.get("categoria"),
            "tecnica": "freidora de aire",
            "porciones": r.get("p") or o.get("porciones"),
            "tiempo_coccion_min": o.get("tiempo_coccion_min"),
            "temperatura_c": o.get("temperatura_c"),
            "dificultad": r.get("dif", "fácil"),
            "ingredientes": [
                {"cantidad": i[0], "unidad": i[1], "nombre": i[2],
                 "nota": i[3] if len(i) > 3 else None,
                 "opcional": bool(i[4]) if len(i) > 4 else False}
                for i in r["i"]
            ],
            "pasos": r["s"],
            "consejo": r.get("c"),
            "etiquetas": r.get("e", []),
            "origen": "recetario",
            "origen_ref": rid,
            "fuente_visible": fuente,
        })
    Path(salida).write_text(json.dumps(recetas, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(recetas)} recetas escritas en {salida}")


def ngramas(texto, n=6):
    w = norm(texto).split()
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


VACIAS = set("a al con de del el en la las lo los o para por que se si sin su sus un una unos unas y hasta como".split())
# Vocabulario funcional de cocina: instrucciones que casi no admiten otra redacción.
COCINA = set("""corta corte cortar cociná cocina cocinar coloca colocá ubica pone pon ponelos ponelas mezcla mezcla
agrega suma sumá incorpora retira sirve servi servilo servila servilos servilas acompaña
canasta freidora airfryer molde moldes fuente papel manteca aluminio rejilla base bol bowl tapa
minutos minuto min grados c segundos mitad tiempo coccion antes despues final al
cubos rodajas gajos tiras bastones aros mitades trozos picado picada picados picadas rallado rallada
caliente tibio tibia frio fria crudo cocido cocida cocidos cocidas
mas menos poco poca un dos tres cuatro 1 2 3 4 5 6 7 8 9 10 12 15 20 30
pure papas batatas ensalada verde arroz blanco fideos salsa criolla tomate barbacoa noisette asadas doradas
horno grilladas vegetales verduras pan plato servir acompaña acompañá calabaza manzana papa
finas finos gruesas gruesos medianas medianos chicas chicos grandes laminas medio pincelalas pincelalos pinceladas
lavalas lavalos pelalas pelalos verduras cebollas batatas zapallitos
""".split())


def es_enumeracion(ngrama, vocab):
    """Una secuencia que solo nombra ingredientes (más artículos y conectores) no es expresión copiada."""
    return all(w in VACIAS or w in vocab or w in COCINA for w in ngrama.split())


def cmd_copia(crudo, carpeta, n=6):
    originales = {id_corto(r): r for r in json.loads(Path(crudo).read_text(encoding="utf-8"))}
    problemas = 0
    for rid, r in leer_lotes(carpeta).items():
        o = originales.get(rid)
        if not o:
            continue
        orig = ngramas(" ".join(o["pasos"] + [o.get("descripcion", ""), o.get("tip", ""), o.get("resultado", "")]), n)
        nuevo = " ".join(r["s"] + [r["d"], r.get("c") or ""])
        vocab = set(norm(" ".join(o["ingredientes"])).split())
        repetidos = {g for g in ngramas(nuevo, n) & orig if not es_enumeracion(g, vocab)}
        if repetidos:
            problemas += 1
            print(f"{rid}: {sorted(repetidos)[:3]}")
    print(f"Recetas con frases de {n} palabras copiadas: {problemas}")
    return problemas


if __name__ == "__main__":
    c, *a = sys.argv[1:]
    if c == "lote":
        sal = a[a.index("--saltear") + 1] if "--saltear" in a else None
        cmd_lote(a[0], a[1], a[2], sal)
    elif c == "armar":
        cmd_armar(*a)
    elif c == "copia":
        sys.exit(1 if cmd_copia(*a) else 0)
    else:
        raise SystemExit(__doc__)
