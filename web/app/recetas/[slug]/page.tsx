import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerReceta } from "@/lib/datos";
import { minutosTexto } from "@/lib/texto";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await obtenerReceta((await params).slug);
  return r ? { title: r.titulo, description: r.descripcion ?? undefined } : { title: "Receta no encontrada" };
}

function valor(n: number | null, unidad = "") {
  return n == null ? "—" : `${Math.round(n)}${unidad}`;
}

export default async function FichaReceta({ params }: { params: Params }) {
  const r = await obtenerReceta((await params).slug);
  if (!r) notFound();
  const datos = [
    r.porciones && `${r.porciones} ${r.porciones === 1 ? "porción" : "porciones"}`,
    minutosTexto(r.minutos),
    r.temperatura && `${r.temperatura} °C`,
    r.dificultad,
    r.tecnica,
  ].filter(Boolean);

  return (
    <article className="pila-grande">
      <header className="pila" style={{ gap: 10 }}>
        <p className="chico">
          <Link href={r.categoria ? `/recetas?cat=${encodeURIComponent(r.categoria)}` : "/recetas"}>
            {r.categoria ?? "Recetas"}
          </Link>
        </p>
        <h1>{r.titulo}</h1>
        {r.descripcion && (
          <p className="apagado" style={{ maxWidth: "65ch" }}>
            {r.descripcion}
          </p>
        )}
        <p className="meta">
          {datos.map((d) => (
            <span key={String(d)}>{d}</span>
          ))}
        </p>
      </header>

      <div className="ficha">
        <section className="panel pila" aria-labelledby="t-ing">
          <h3 id="t-ing">Ingredientes</h3>
          <ul className="lista-ing">
            {r.ingredientes.map((i, n) => (
              <li key={n}>
                {i.texto}
                {i.opcional && <span className="opcional">opcional</span>}
              </li>
            ))}
          </ul>
          {r.nutricion && (
            <div className="pila" style={{ gap: 8 }}>
              <h3>Por porción</h3>
              <dl className="nutricion">
                <div>
                  <dt>Calorías</dt>
                  <dd>{valor(r.nutricion.kcal)}</dd>
                </div>
                <div>
                  <dt>Proteínas</dt>
                  <dd>{valor(r.nutricion.proteinas, " g")}</dd>
                </div>
                <div>
                  <dt>Grasas</dt>
                  <dd>{valor(r.nutricion.grasas, " g")}</dd>
                </div>
                <div>
                  <dt>Hidratos</dt>
                  <dd>{valor(r.nutricion.carbohidratos, " g")}</dd>
                </div>
              </dl>
              <p className="apagado chico">
                {r.nutricionEstimada
                  ? "Valores estimados a partir de los ingredientes (USDA FoodData Central). Son orientativos."
                  : "Valores informados por el recetario original."}
              </p>
            </div>
          )}
        </section>

        <section className="pila" aria-labelledby="t-pasos">
          <h3 id="t-pasos">Preparación</h3>
          <ol className="pasos">
            {r.pasos.map((p, n) => (
              <li key={n}>
                <span>{p}</span>
              </li>
            ))}
          </ol>
          {r.consejo && (
            <p className="consejo">
              <strong>Consejo: </strong>
              {r.consejo}
            </p>
          )}
          {r.fuente && <p className="apagado chico">{r.fuente}</p>}
        </section>
      </div>
    </article>
  );
}
