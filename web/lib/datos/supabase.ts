import { supabaseServidor } from "@/lib/supabase/servidor";
import { POR_PAGINA, huella, intercalar } from "@/lib/texto";
import { fotoPlato } from "@/lib/tipoPlato";
import type { Coincidencia, FiltrosCocina, Ingrediente, PaginaRecetas, Receta, RecetaResumen, Orden } from "@/lib/tipos";

const CAMPOS_RESUMEN = "slug,titulo,descripcion,categoria,tiempo_preparacion_min,tiempo_coccion_min,dificultad";

type FilaReceta = {
  slug: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  tiempo_preparacion_min: number | null;
  tiempo_coccion_min: number | null;
  dificultad: RecetaResumen["dificultad"];
};

function resumen(f: FilaReceta): RecetaResumen {
  const minutos = (f.tiempo_preparacion_min ?? 0) + (f.tiempo_coccion_min ?? 0);
  return {
    slug: f.slug,
    titulo: f.titulo,
    descripcion: f.descripcion,
    categoria: f.categoria,
    minutos: minutos || null,
    dificultad: f.dificultad,
  };
}

export async function listarIngredientes(): Promise<Ingrediente[]> {
  const sb = await supabaseServidor();
  const [{ data: ings, error }, { data: sins }] = await Promise.all([
    sb.from("ingredientes").select("id,nombre,categoria,es_basico").order("nombre"),
    sb.from("sinonimos").select("sinonimo,ingrediente_id"),
  ]);
  if (error) throw error;
  const porId = new Map<string, string[]>();
  for (const s of sins ?? []) porId.set(s.ingrediente_id, [...(porId.get(s.ingrediente_id) ?? []), s.sinonimo]);
  return (ings ?? []).map((i) => ({
    nombre: i.nombre,
    categoria: i.categoria,
    basico: i.es_basico,
    sinonimos: porId.get(i.id) ?? [],
  }));
}

export async function categorias(): Promise<string[]> {
  const sb = await supabaseServidor();
  const { data } = await sb.from("recetas").select("categoria").eq("estado", "publicada").not("categoria", "is", null);
  return [...new Set((data ?? []).map((d) => d.categoria as string))].sort();
}

export async function buscarRecetas(
  texto: string,
  categoria: string | null,
  pagina: number,
  orden: Orden = "mezcla",
): Promise<PaginaRecetas> {
  const sb = await supabaseServidor();
  const desde = (pagina - 1) * POR_PAGINA;
  if (texto.trim()) {
    // buscar_recetas devuelve una página; pedimos una de más para saber si hay otra.
    const { data, error } = await sb.rpc("buscar_recetas", { p_texto: texto, p_limite: 100, p_desde: 0 });
    if (error) throw error;
    const lista = ((data ?? []) as FilaReceta[]).filter((r) => !categoria || r.categoria === categoria);
    return { recetas: lista.slice(desde, desde + POR_PAGINA).map(resumen), total: lista.length };
  }
  let consulta = sb.from("recetas").select(CAMPOS_RESUMEN, { count: "exact" }).eq("estado", "publicada");
  if (categoria) consulta = consulta.eq("categoria", categoria);
  // "mezcla" ordena por id: es un uuid al azar, así que el orden queda mezclado pero fijo.
  if (orden === "rapidas") consulta = consulta.order("minutos", { ascending: true, nullsFirst: false }).order("titulo");
  else if (orden === "az") consulta = consulta.order("titulo");
  else consulta = consulta.order("id");
  const { data, count, error } = await consulta.range(desde, desde + POR_PAGINA - 1);
  if (error) throw error;
  return { recetas: ((data ?? []) as FilaReceta[]).map(resumen), total: count ?? 0 };
}

export async function obtenerReceta(slug: string): Promise<Receta | null> {
  const sb = await supabaseServidor();
  const { data } = await sb
    .from("recetas")
    .select(
      `id,${CAMPOS_RESUMEN},tecnica,porciones,temperatura_c,consejo,etiquetas,fuente_visible,` +
        "kcal_porcion,proteinas_porcion,grasas_porcion,carbohidratos_porcion,nutricion_estimada",
    )
    .eq("slug", slug)
    .maybeSingle();
  const r = data as unknown as
    | (FilaReceta & {
        id: string;
        tecnica: string | null;
        porciones: number | null;
        temperatura_c: number | null;
        consejo: string | null;
        etiquetas: string[] | null;
        fuente_visible: string | null;
        kcal_porcion: number | null;
        proteinas_porcion: number | null;
        grasas_porcion: number | null;
        carbohidratos_porcion: number | null;
        nutricion_estimada: boolean | null;
      })
    | null;
  if (!r) return null;
  const [{ data: ings }, { data: pasos }] = await Promise.all([
    sb.from("receta_ingredientes").select("texto,opcional").eq("receta_id", r.id).order("orden"),
    sb.from("receta_pasos").select("texto").eq("receta_id", r.id).order("orden"),
  ]);
  return {
    ...resumen(r as unknown as FilaReceta),
    tecnica: r.tecnica,
    porciones: r.porciones,
    temperatura: r.temperatura_c,
    consejo: r.consejo,
    etiquetas: r.etiquetas ?? [],
    fuente: r.fuente_visible,
    ingredientes: ings ?? [],
    pasos: (pasos ?? []).map((p) => p.texto),
    nutricion:
      r.kcal_porcion == null
        ? null
        : { kcal: r.kcal_porcion, proteinas: r.proteinas_porcion, grasas: r.grasas_porcion, carbohidratos: r.carbohidratos_porcion },
    nutricionEstimada: r.nutricion_estimada,
  };
}

/** Ids del catálogo a partir de nombres o sinónimos, usando public.buscar_ingrediente(). */
export async function idsIngredientes(nombres: string[]): Promise<string[]> {
  const sb = await supabaseServidor();
  const ids = await Promise.all(
    nombres.map(async (n) => (await sb.rpc("buscar_ingrediente", { texto: n })).data as string | null),
  );
  return [...new Set(ids.filter((x): x is string => !!x))];
}

export async function queCocino(nombres: string[], filtros: FiltrosCocina = {}): Promise<Coincidencia[]> {
  const sb = await supabaseServidor();
  const ids = await idsIngredientes(nombres);
  if (!ids.length) return [];
  const { data, error } = await sb.rpc("que_cocino", {
    p_ingredientes: ids,
    p_max_minutos: filtros.maxMinutos ?? null,
    p_categoria: filtros.categoria ?? null,
    p_limite: 30,
  });
  if (error) throw error;
  const filas = (data ?? []) as {
    slug: string;
    titulo: string;
    categoria: string | null;
    minutos: number;
    coincidencia: number;
    tengo: number;
    necesito: number;
    faltantes: { ingrediente: string; reemplazos: string[] }[];
  }[];
  // La base ya ordena (ingrediente principal primero, después coincidencia). Sin tocar ese orden,
  // dentro de cada grupo seguido de recetas empatadas mezclamos con un orden fijo y evitamos dos fotos iguales juntas.
  const grupo = (f: (typeof filas)[number]) => `${f.coincidencia}-${f.tengo}`;
  for (let ini = 0; ini < filas.length; ) {
    let fin = ini + 1;
    while (fin < filas.length && grupo(filas[fin]) === grupo(filas[ini])) fin++;
    const mezclado = filas.slice(ini, fin).sort((a, b) => huella(a.slug) - huella(b.slug));
    filas.splice(ini, mezclado.length, ...mezclado);
    ini = fin;
  }
  filas.splice(0, filas.length, ...intercalar(filas, fotoPlato, grupo));
  // Registro para las métricas; si falla no afecta la búsqueda.
  await sb.from("eventos").insert({
    tipo: filas.length ? "busqueda" : "busqueda_sin_resultados",
    datos: { ingredientes: nombres, filtros },
  });
  return filas.map((f) => ({
    slug: f.slug,
    titulo: f.titulo,
    descripcion: null,
    categoria: f.categoria,
    minutos: f.minutos || null,
    dificultad: null,
    coincidencia: f.coincidencia,
    tengo: f.tengo,
    necesito: f.necesito,
    faltantes: f.faltantes.map((x) => (x.reemplazos.length ? `${x.ingrediente} (podés usar ${x.reemplazos.join(" o ")})` : x.ingrediente)),
  }));
}
