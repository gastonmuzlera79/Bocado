import datos from "@/datos/demo.json";
import { huella, intercalar, normalizar, POR_PAGINA } from "@/lib/texto";
import { fotoPlato } from "@/lib/tipoPlato";
import type { Coincidencia, FiltrosCocina, Ingrediente, Orden, PaginaRecetas, Receta, RecetaResumen } from "@/lib/tipos";

type RecetaDemo = Omit<Receta, "ingredientes" | "temperatura"> & {
  temperatura: number | null;
  ingredientes: { texto: string; ingrediente: string | null; opcional: boolean }[];
};

const ingredientes = datos.ingredientes as Ingrediente[];
const recetas = datos.recetas as unknown as RecetaDemo[];
const esBasico = new Map(ingredientes.map((i) => [i.nombre, i.basico]));

/** Nombre del catálogo a partir de lo que escribe la persona (nombre o sinónimo). */
const indice = new Map<string, string>();
for (const i of ingredientes) {
  indice.set(normalizar(i.nombre), i.nombre);
  for (const s of i.sinonimos) indice.set(normalizar(s), i.nombre);
}
export function resolverIngrediente(texto: string): string | null {
  return indice.get(normalizar(texto)) ?? null;
}

function resumen(r: RecetaDemo): RecetaResumen {
  return {
    slug: r.slug,
    titulo: r.titulo,
    descripcion: r.descripcion,
    categoria: r.categoria,
    minutos: r.minutos,
    dificultad: r.dificultad,
  };
}

export function listarIngredientes(): Ingrediente[] {
  return ingredientes;
}

export function categorias(): string[] {
  return [...new Set(recetas.map((r) => r.categoria).filter((c): c is string => !!c))].sort();
}

function comparar(orden: Orden) {
  return (a: RecetaDemo, b: RecetaDemo) => {
    if (orden === "rapidas") return (a.minutos ?? 999) - (b.minutos ?? 999) || a.titulo.localeCompare(b.titulo, "es");
    if (orden === "az") return a.titulo.localeCompare(b.titulo, "es");
    return huella(a.slug) - huella(b.slug);
  };
}

export function buscarRecetas(texto: string, categoria: string | null, pagina: number, orden: Orden = "mezcla"): PaginaRecetas {
  const q = normalizar(texto);
  const palabras = q.split(" ").filter(Boolean);
  let lista = recetas.filter((r) => !categoria || r.categoria === categoria);
  if (palabras.length) {
    lista = lista
      .map((r) => {
        const titulo = normalizar(r.titulo);
        const resto = normalizar(`${r.descripcion ?? ""} ${r.etiquetas.join(" ")} ${r.ingredientes.map((i) => i.texto).join(" ")}`);
        let puntos = 0;
        for (const p of palabras) {
          if (titulo.includes(p)) puntos += 3;
          else if (resto.includes(p)) puntos += 1;
          else return null;
        }
        return { r, puntos };
      })
      .filter((x): x is { r: RecetaDemo; puntos: number } => x !== null)
      .sort((a, b) => b.puntos - a.puntos || comparar(orden)(a.r, b.r))
      .map((x) => x.r);
  } else {
    lista = [...lista].sort(comparar(orden));
  }
  const desde = (pagina - 1) * POR_PAGINA;
  return { recetas: lista.slice(desde, desde + POR_PAGINA).map(resumen), total: lista.length };
}

/** Slugs de todas las recetas (para generar las fichas en la versión estática). */
export function slugs(): string[] {
  return recetas.map((r) => r.slug);
}

export function obtenerReceta(slug: string): Receta | null {
  const r = recetas.find((x) => x.slug === slug);
  if (!r) return null;
  return { ...r, ingredientes: r.ingredientes.map(({ texto, opcional }) => ({ texto, opcional })) };
}

/**
 * Misma regla que public.que_cocino(): los básicos y los opcionales no cuentan, y solo aparecen recetas
 * donde tenés al menos uno de los ingredientes necesarios.
 */
export function queCocino(nombres: string[], filtros: FiltrosCocina = {}, limite = 30): Coincidencia[] {
  const mios = new Set(nombres.map((n) => resolverIngrediente(n)).filter((n): n is string => !!n));
  const salida: Coincidencia[] = [];
  for (const r of recetas) {
    if (filtros.categoria && r.categoria !== filtros.categoria) continue;
    if (filtros.maxMinutos && (r.minutos ?? 0) > filtros.maxMinutos) continue;
    const requeridos = r.ingredientes.filter((i) => i.ingrediente && !i.opcional && !esBasico.get(i.ingrediente));
    const tengo = requeridos.filter((i) => mios.has(i.ingrediente!)).length;
    if (tengo === 0) continue;
    const necesito = requeridos.length;
    salida.push({
      ...resumen(r),
      coincidencia: necesito ? Math.round((100 * tengo) / necesito) : 100,
      tengo,
      necesito,
      faltantes: requeridos.filter((i) => !mios.has(i.ingrediente!)).map((i) => i.texto),
    });
  }
  // A igual coincidencia, mezcla fija (no alfabética) y sin dos fotos iguales seguidas cuando se puede.
  const ordenadas = salida
    .sort((a, b) => b.tengo / b.necesito - a.tengo / a.necesito || b.tengo - a.tengo || huella(a.slug) - huella(b.slug))
    .slice(0, limite);
  return intercalar(ordenadas, fotoPlato, (c) => `${c.coincidencia}-${c.tengo}`);
}

export function metricasDemo() {
  const porCategoria = new Map<string, number>();
  for (const r of recetas) porCategoria.set(r.categoria ?? "Sin categoría", (porCategoria.get(r.categoria ?? "Sin categoría") ?? 0) + 1);
  const porFuente = new Map<string, number>();
  for (const r of recetas) porFuente.set(r.fuente ?? "Sin fuente", (porFuente.get(r.fuente ?? "Sin fuente") ?? 0) + 1);
  return {
    recetas: recetas.length,
    conNutricion: recetas.filter((r) => r.nutricion).length,
    nutricionDelLibro: recetas.filter((r) => r.nutricionEstimada === false).length,
    ingredientes: ingredientes.length,
    porCategoria: [...porCategoria].sort((a, b) => b[1] - a[1]),
    porFuente: [...porFuente].sort((a, b) => b[1] - a[1]),
  };
}
