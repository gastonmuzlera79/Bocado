import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/config";

/** Cliente de Supabase para componentes de servidor, acciones y rutas. Actúa con la sesión de quien navega. */
export async function supabaseServidor() {
  const almacen = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) almacen.set(name, value, options);
        } catch {
          // Desde un componente de servidor no se pueden escribir cookies; el middleware renueva la sesión.
        }
      },
    },
  });
}
