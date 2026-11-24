import QueCocino from "@/componentes/QueCocino";
import { modoDemo } from "@/lib/config";
import { categorias, listarIngredientes } from "@/lib/datos";
import { sesionActual } from "@/lib/sesion";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

async function despensaGuardada(usuarioId: string): Promise<string[]> {
  const sb = await supabaseServidor();
  const { data } = await sb.from("despensa").select("ingredientes(nombre)").eq("usuario_id", usuarioId);
  return (data ?? [])
    .map((d) => (d.ingredientes as unknown as { nombre: string } | null)?.nombre)
    .filter((n): n is string => !!n);
}

export default async function Inicio() {
  const sesion = await sesionActual();
  const [ingredientes, cats, inicial] = await Promise.all([
    listarIngredientes(),
    categorias(),
    sesion ? despensaGuardada(sesion.id) : Promise.resolve([]),
  ]);
  return (
    <div className="pila-grande">
      <section className="portada">
        <div className="pila" style={{ gap: 10 }}>
          <h1>¿Qué cocino con lo que tengo?</h1>
          <p className="apagado" style={{ maxWidth: "52ch" }}>
            Anotá lo que hay en tu heladera y en la alacena. Te mostramos las recetas que podés hacer, ordenadas por lo
            que ya tenés, y qué te falta para cada una.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/platos/general.webp" alt="" width={960} height={640} fetchPriority="high" />
      </section>
      <QueCocino
        ingredientes={ingredientes}
        categorias={cats}
        inicial={inicial}
        demo={modoDemo}
        conCuenta={!!sesion}
      />
    </div>
  );
}
