import { modoDemo } from "@/lib/config";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Permiso =
  | "moderar_recetas"
  | "moderar_comentarios"
  | "editar_catalogo"
  | "administrar_usuarios"
  | "administrar_permisos"
  | "ver_metricas"
  | "configurar"
  | "ver_auditoria"
  | "administrar_cargas";

export type Sesion = {
  id: string;
  email: string | null;
  nombre: string;
  rol: "usuario" | "moderador" | "admin";
  suspendido: boolean;
  permisos: Set<Permiso>;
};

/** Usuario que navega, con su rol y permisos. null si no ingresó o si la web está en modo demo. */
export async function sesionActual(): Promise<Sesion | null> {
  if (modoDemo) return null;
  const sb = await supabaseServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await sb
    .from("perfiles")
    .select("nombre_visible,nombre_usuario,rol,suspendido")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil) return null;
  const { data: permisos } = perfil.suspendido
    ? { data: [] }
    : await sb.from("permisos_rol").select("permiso").eq("rol", perfil.rol);
  return {
    id: user.id,
    email: user.email ?? null,
    nombre: perfil.nombre_visible || perfil.nombre_usuario,
    rol: perfil.rol,
    suspendido: perfil.suspendido,
    permisos: new Set((permisos ?? []).map((p) => p.permiso as Permiso)),
  };
}

export function esEquipo(s: Sesion | null): boolean {
  return !!s && s.permisos.size > 0;
}
