"use server";

import { revalidatePath } from "next/cache";
import { sesionActual, type Permiso } from "@/lib/sesion";
import { supabaseServidor } from "@/lib/supabase/servidor";

/** Corta si quien llama no tiene el permiso. La base lo vuelve a controlar con sus políticas. */
async function exigir(permiso: Permiso) {
  const s = await sesionActual();
  if (!s || !s.permisos.has(permiso)) throw new Error("Sin permiso para esta acción.");
  return s;
}

function listo(seccion: string) {
  revalidatePath(`/admin`);
  revalidatePath(`/admin?seccion=${seccion}`);
}

export async function aprobarReceta(datos: FormData) {
  await exigir("moderar_recetas");
  const sb = await supabaseServidor();
  await sb.from("recetas").update({ estado: "publicada", motivo_rechazo: null }).eq("id", String(datos.get("id")));
  listo("moderacion");
}

export async function rechazarReceta(datos: FormData) {
  await exigir("moderar_recetas");
  const motivo = String(datos.get("motivo") ?? "").trim() || "No cumple las pautas de publicación.";
  const sb = await supabaseServidor();
  await sb.from("recetas").update({ estado: "rechazada", motivo_rechazo: motivo }).eq("id", String(datos.get("id")));
  listo("moderacion");
}

export async function cerrarReporte(datos: FormData) {
  const s = await exigir("moderar_comentarios");
  const estado = datos.get("estado") === "descartado" ? "descartado" : "resuelto";
  const sb = await supabaseServidor();
  await sb.from("reportes").update({ estado, resuelto_por: s.id }).eq("id", String(datos.get("id")));
  listo("reportes");
}

export async function cambiarRol(datos: FormData) {
  const s = await exigir("administrar_usuarios");
  const id = String(datos.get("id"));
  const rol = String(datos.get("rol"));
  if (id === s.id) throw new Error("No podés cambiar tu propio rol.");
  if (!["usuario", "moderador", "admin"].includes(rol)) throw new Error("Rol desconocido.");
  const sb = await supabaseServidor();
  await sb.from("perfiles").update({ rol }).eq("id", id);
  listo("usuarios");
}

export async function cambiarSuspension(datos: FormData) {
  const s = await exigir("administrar_usuarios");
  const id = String(datos.get("id"));
  if (id === s.id) throw new Error("No podés suspenderte a vos.");
  const sb = await supabaseServidor();
  await sb.from("perfiles").update({ suspendido: datos.get("suspender") === "si" }).eq("id", id);
  listo("usuarios");
}

/** Guarda una clave de configuración respetando el tipo que ya tiene (número, sí/no u objeto de esos). */
export async function guardarConfiguracion(datos: FormData) {
  await exigir("configurar");
  const clave = String(datos.get("clave"));
  const sb = await supabaseServidor();
  const { data: actual } = await sb.from("configuracion").select("valor").eq("clave", clave).maybeSingle();
  if (!actual) throw new Error("Clave de configuración desconocida.");

  const leer = (previo: unknown, campo: string): unknown => {
    if (typeof previo === "boolean") return datos.get(campo) === "on";
    const crudo = String(datos.get(campo) ?? "").trim();
    if (typeof previo === "number" || previo === null) {
      if (crudo === "") return null;
      const n = Number(crudo.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) throw new Error(`Valor inválido en ${campo}.`);
      return n;
    }
    return crudo;
  };

  let valor: unknown;
  if (actual.valor && typeof actual.valor === "object" && !Array.isArray(actual.valor)) {
    valor = Object.fromEntries(
      Object.entries(actual.valor as Record<string, unknown>).map(([k, v]) => [k, leer(v, `${clave}.${k}`)]),
    );
  } else {
    valor = leer(actual.valor, clave);
  }
  await sb.from("configuracion").update({ valor, actualizado_en: new Date().toISOString() }).eq("clave", clave);
  listo("configuracion");
}
