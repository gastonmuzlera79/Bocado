"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { modoDemo, sitioUrl } from "@/lib/config";
import { queCocino } from "@/lib/datos";
import { idsIngredientes } from "@/lib/datos/supabase";
import { supabaseServidor } from "@/lib/supabase/servidor";
import type { Coincidencia, FiltrosCocina } from "@/lib/tipos";

export async function buscarConDespensa(nombres: string[], filtros: FiltrosCocina): Promise<Coincidencia[]> {
  const limpios = nombres.map((n) => n.trim()).filter(Boolean).slice(0, 60);
  if (!limpios.length) return [];
  return queCocino(limpios, filtros);
}

/** Guarda la despensa de quien ingresó. En modo demo la despensa vive en el navegador. */
export async function guardarDespensa(nombres: string[]): Promise<{ ok: boolean; mensaje: string }> {
  if (modoDemo) return { ok: false, mensaje: "En la demo la despensa se guarda solo en este navegador." };
  const sb = await supabaseServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, mensaje: "Ingresá para guardar tu despensa en tu cuenta." };
  const ids = await idsIngredientes(nombres);
  const { error: errorBorrar } = await sb.from("despensa").delete().eq("usuario_id", user.id);
  if (errorBorrar) return { ok: false, mensaje: "No se pudo actualizar la despensa. Probá de nuevo." };
  if (ids.length) {
    const { error } = await sb.from("despensa").insert(ids.map((id) => ({ usuario_id: user.id, ingrediente_id: id })));
    if (error) return { ok: false, mensaje: "No se pudo guardar la despensa. Probá de nuevo." };
  }
  return { ok: true, mensaje: `Despensa guardada: ${ids.length} ingredientes.` };
}

export async function ingresar(_: unknown, datos: FormData): Promise<{ mensaje: string; ok: boolean }> {
  if (modoDemo) return { ok: false, mensaje: "La demo no tiene cuentas. El ingreso se activa al conectar la base." };
  const email = String(datos.get("email") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, mensaje: "Revisá el mail: parece incompleto." };
  const sb = await supabaseServidor();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${sitioUrl}/auth/callback` },
  });
  if (error) return { ok: false, mensaje: "No pudimos mandar el enlace. Esperá un minuto y probá otra vez." };
  return { ok: true, mensaje: `Te mandamos un enlace a ${email}. Abrilo desde este mismo dispositivo.` };
}

export async function salir() {
  if (!modoDemo) {
    const sb = await supabaseServidor();
    await sb.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}
