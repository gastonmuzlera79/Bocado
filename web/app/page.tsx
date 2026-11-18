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
      <section className="pila" style={{ gap: 8 }}>
        <h1>¿Qué cocino con lo que tengo?</h1>
        <p className="apagado" style={{ maxWidth: "60ch" }}>
          Anotá lo que hay en tu heladera y en la alacena. Te mostramos las recetas que podés hacer, ordenadas por lo
          que ya tenés, y qué te falta para cada una.
        </p>
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
