import { modoDemo } from "@/lib/config";
import * as demo from "@/lib/datos/demo";
import * as sb from "@/lib/datos/supabase";
import type { Coincidencia, FiltrosCocina, Ingrediente, PaginaRecetas, Receta, Orden } from "@/lib/tipos";

/** Punto único de acceso a los datos: Supabase si está configurado, datos/demo.json si no. */
export async function listarIngredientes(): Promise<Ingrediente[]> {
  return modoDemo ? demo.listarIngredientes() : sb.listarIngredientes();
}

export async function categorias(): Promise<string[]> {
  return modoDemo ? demo.categorias() : sb.categorias();
}

export async function buscarRecetas(
  texto: string,
  categoria: string | null,
  pagina: number,
  orden: Orden = "mezcla",
): Promise<PaginaRecetas> {
  return modoDemo ? demo.buscarRecetas(texto, categoria, pagina, orden) : sb.buscarRecetas(texto, categoria, pagina, orden);
}

export async function obtenerReceta(slug: string): Promise<Receta | null> {
  return modoDemo ? demo.obtenerReceta(slug) : sb.obtenerReceta(slug);
}

export async function queCocino(nombres: string[], filtros: FiltrosCocina): Promise<Coincidencia[]> {
  return modoDemo ? demo.queCocino(nombres, filtros) : sb.queCocino(nombres, filtros);
}
