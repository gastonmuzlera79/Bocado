import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

/** Destino del enlace de ingreso: cambia el código por una sesión y vuelve al inicio. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get("code");
  if (codigo) {
    const sb = await supabaseServidor();
    const { error } = await sb.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }
  return NextResponse.redirect(`${origin}/ingresar?error=enlace`);
}
