/**
 * Versión estática de app/acciones.ts (GitHub Pages, sin servidor). tools/sitio_estatico.mjs la copia en lugar
 * de la original: la búsqueda corre en el navegador con los datos de prueba y no hay cuentas.
 */
import { queCocino } from "@/lib/datos/demo";
import type { Coincidencia, FiltrosCocina } from "@/lib/tipos";

export async function buscarConDespensa(nombres: string[], filtros: FiltrosCocina): Promise<Coincidencia[]> {
  const limpios = nombres.map((n) => n.trim()).filter(Boolean).slice(0, 60);
  if (!limpios.length) return [];
  return queCocino(limpios, filtros);
}

export async function guardarDespensa(_nombres: string[]): Promise<{ ok: boolean; mensaje: string }> {
  return { ok: false, mensaje: "En esta versión la despensa se guarda solo en este navegador." };
}

export async function ingresar(_estado: unknown, _datos: FormData): Promise<{ mensaje: string; ok: boolean }> {
  return { ok: false, mensaje: "Esta versión no tiene cuentas." };
}

export async function salir() {}
