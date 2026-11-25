import type { Metadata } from "next";
import Link from "next/link";
import TarjetaReceta from "@/componentes/TarjetaReceta";
import { buscarRecetas, categorias } from "@/lib/datos";
import { POR_PAGINA, slugCategoria } from "@/lib/texto";
import type { Orden } from "@/lib/tipos";

export const metadata: Metadata = { title: "Recetas" };
export const dynamic = "force-dynamic";

type Params = Promise<{ q?: string; cat?: string; pagina?: string; orden?: string }>;

const ORDENES: [Orden, string][] = [
  ["mezcla", "Sugeridas"],
  ["rapidas", "Más rápidas"],
  ["az", "A–Z"],
];

function enlace(q: string, cat: string | null, pagina = 1, orden: Orden = "mezcla") {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (cat) p.set("cat", cat);
  if (orden !== "mezcla") p.set("orden", orden);
  if (pagina > 1) p.set("pagina", String(pagina));
  const s = p.toString();
  return s ? `/recetas?${s}` : "/recetas";
}

export default async function Recetas({ searchParams }: { searchParams: Params }) {
  const { q = "", cat = null, pagina: pag = "1", orden: ord } = await searchParams;
  const orden: Orden = ord === "rapidas" || ord === "az" ? ord : "mezcla";
  const pagina = Math.max(1, Number(pag) || 1);
  const [{ recetas, total }, cats] = await Promise.all([buscarRecetas(q, cat, pagina, orden), categorias()]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="pila-grande">
      <section className="pila">
        <h1>Recetas</h1>
        <form action="/recetas" className="fila" role="search">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <div style={{ flex: "1 1 280px" }}>
            <label htmlFor="q">Buscar por nombre o ingrediente</label>
            <input id="q" name="q" className="campo" defaultValue={q} placeholder="Ej.: milanesa, budín, zapallito" />
          </div>
          <button type="submit" className="boton">
            Buscar
          </button>
        </form>
        <nav className="categorias" aria-label="Categorías">
          <Link href={enlace(q, null, 1, orden)} aria-current={!cat}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/platos/general.webp" alt="" width={720} height={480} loading="lazy" />
            <span>Todas</span>
          </Link>
          {cats.map((c) => (
            <Link key={c} href={enlace(q, c, 1, orden)} aria-current={cat === c}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/categorias/${slugCategoria(c)}.webp`} alt="" width={720} height={480} loading="lazy" />
              <span>{c}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="pila" aria-live="polite">
        <div className="fila-orden">
          <p className="apagado numeros">
            {total === 0
            ? "No hay recetas que coincidan. Probá con otra palabra o sacá la categoría."
              : `${total} recetas${q ? ` para “${q}”` : ""}${cat ? ` en ${cat}` : ""}`}
          </p>
          {total > 1 && (
            <nav className="orden" aria-label="Ordenar">
              <span className="apagado">Ordenar:</span>
              {ORDENES.map(([o, nombre]) => (
                <Link key={o} href={enlace(q, cat, 1, o)} aria-current={orden === o}>
                  {nombre}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="grilla">
          {recetas.map((r) => (
            <TarjetaReceta key={r.slug} receta={r} />
          ))}
        </div>
        {paginas > 1 && (
          <nav className="paginas" aria-label="Páginas">
            {pagina > 1 && (
              <Link className="boton secundario chico" href={enlace(q, cat, pagina - 1, orden)}>
                Anterior
              </Link>
            )}
            <span className="apagado numeros">
              Página {pagina} de {paginas}
            </span>
            {pagina < paginas && (
              <Link className="boton secundario chico" href={enlace(q, cat, pagina + 1, orden)}>
                Siguiente
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
