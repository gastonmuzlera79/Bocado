"""Lector por reglas de la colección "700/1000 Recetas Argentinas para Freidora de Aire".

Uso: python3 tools/leer_recetario_airfryer.py <carpeta_con_parteN.txt> <salida.json>
"""
import json
import re
import sys
from pathlib import Path

CAPITULOS = {
    1: "Desayunos y meriendas", 2: "Almuerzos rápidos", 3: "Carnes",
    4: "Verduras y guarniciones", 5: "Panes, pizzas y masas", 6: "Postres",
    7: "Snacks y picadas", 8: "Comidas fit", 9: "Gourmet",
}

# Título: emoji(s) opcionales + número + punto + texto. Ej: "🥜 14. Barritas de Avena y Maní"
RE_TITULO = re.compile(r"^\s*[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200d]+\s*(\d{1,3})\.\s+([A-ZÁÉÍÓÚÑ¿¡\"“].{2,110})$")
RE_NUMERADO = re.compile(r"^[^\w(¿¡]*?(\d{1,3})\.\s+(\S.*)$")
RE_SECCION = re.compile(
    r"^\s*(?:💡\s*)?(Descripción|Ingredientes|Preparación|Cocción|Resultado|Tip|Consejo|Variante|Truco)\b[^:]*:\s*(.*)$",
    re.IGNORECASE,
)
RE_TEMP = re.compile(r"(\d{2,3})\s*°\s*C", re.IGNORECASE)
RE_TIEMPO = re.compile(r"(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?\s*(min|minutos|h|horas?)\b", re.IGNORECASE)
RE_PORCIONES = re.compile(r"\((?:para\s*)?(\d{1,2})(?:\s*[–-]\s*(\d{1,2}))?\s*(?:porciones|personas|unidades|u\.?)?\)?", re.IGNORECASE)

LIMPIAR = str.maketrans({"​": "", " ": " ", "●": "", "○": "", "•": ""})


def limpiar(linea: str) -> str:
    return re.sub(r"\s+", " ", linea.translate(LIMPIAR)).strip()


def minutos(texto: str):
    m = RE_TIEMPO.search(texto)
    if not m:
        return None
    a = int(m.group(1))
    b = int(m.group(2)) if m.group(2) else a
    valor = round((a + b) / 2)
    return valor * 60 if m.group(3).lower().startswith("h") else valor


def parsear_parte(texto: str, capitulo: int):
    lineas = [l for l in (limpiar(x) for x in texto.splitlines()) if l]
    recetas, actual, seccion = [], None, None
    saltar = 0
    for i, linea in enumerate(lineas):
        if saltar:
            saltar -= 1
            continue
        # Un título es un renglón numerado seguido (en hasta 3 renglones) de "Descripción:".
        m = RE_NUMERADO.match(linea)
        fin = None
        if m and not RE_SECCION.match(linea):
            for j in range(i + 1, min(i + 4, len(lineas))):
                if lineas[j].lower().startswith("descripci"):
                    fin = j
                    break
        if fin is not None:
            if actual and actual["ingredientes"]:
                recetas.append(actual)
            titulo = " ".join([m.group(2)] + lineas[i + 1:fin]).strip()
            saltar = fin - i - 1
            actual = {
                "capitulo": capitulo,
                "categoria": CAPITULOS.get(capitulo),
                "numero": int(m.group(1)),
                "titulo": titulo,
                "descripcion": "",
                "porciones_texto": "",
                "ingredientes": [],
                "pasos": [],
                "coccion": [],
                "resultado": "",
                "tip": "",
            }
            seccion = None
            continue
        if actual is None:
            continue
        s = RE_SECCION.match(linea)
        if s:
            nombre = s.group(1).lower()
            resto = s.group(2).strip()
            seccion = {
                "descripción": "descripcion", "descripcion": "descripcion",
                "ingredientes": "ingredientes", "preparación": "pasos", "preparacion": "pasos",
                "cocción": "coccion", "coccion": "coccion", "resultado": "resultado",
            }.get(nombre, "tip")
            if seccion == "ingredientes":
                actual["porciones_texto"] = linea
            elif resto:
                agregar(actual, seccion, resto)
            continue
        if seccion:
            agregar(actual, seccion, linea)
    if actual and actual["ingredientes"]:
        recetas.append(actual)
    return recetas


def agregar(receta, seccion, texto):
    if seccion in ("ingredientes", "pasos", "coccion"):
        receta[seccion].append(texto)
    else:
        receta[seccion] = (receta[seccion] + " " + texto).strip()


def enriquecer(r):
    coc = " ".join(r["coccion"])
    t = RE_TEMP.search(coc)
    r["temperatura_c"] = int(t.group(1)) if t else None
    r["tiempo_coccion_min"] = minutos(coc)
    p = RE_PORCIONES.search(r["porciones_texto"])
    r["porciones"] = int(p.group(1)) if p else None
    r["completa"] = bool(r["ingredientes"] and (r["pasos"] or r["coccion"]))
    return r


def main():
    carpeta, salida = Path(sys.argv[1]), Path(sys.argv[2])
    todas = []
    for i in range(1, 10):
        archivo = carpeta / f"parte{i}.txt"
        texto = archivo.read_text(encoding="utf-8")
        if i == 1:
            # La parte I trae índice, prólogo y mantenimiento: arranca en la primera receta.
            idx = texto.find("1. Medialunas Express")
            texto = texto[idx:] if idx > 0 else texto
        for r in parsear_parte(texto, i):
            todas.append(enriquecer(r))
    for n, r in enumerate(todas, 1):
        r["id_origen"] = f"af-{r['capitulo']:02d}-{r['numero']:03d}-{n:04d}"
    salida.write_text(json.dumps(todas, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
