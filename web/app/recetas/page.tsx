import type { Metadata } from "next";
import Link from "next/link";
import TarjetaReceta from "@/componentes/TarjetaReceta";
import { buscarRecetas, categorias } from "@/lib/datos";
import { POR_PAGINA } from "@/lib/texto";

export const metadata: Metadata = { title: "Recetas" };
export const dynamic = "force-dynamic";

type Params = Promise<{ q?: string; cat?: string; pagina?: string }>;

function enlace(q: string, cat: string | null, pagina = 1) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (cat) p.set("cat", cat);
  if (pagina > 1) p.set("pagina", String(pagina));
  const s = p.toString();
  return s ? `/recetas?${s}` : "/recetas";
}

export default async function Recetas({ searchParams }: { searchParams: Params }) {
  const { q = "", cat = null, pagina: pag = "1" } = await searchParams;
  const pagina = Math.max(1, Number(pag) || 1);
  const [{ recetas, total }, cats] = await Promise.all([buscarRecetas(q, cat, pagina), categorias()]);
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
          <Link href={enlace(q, null)} aria-current={!cat}>
            Todas
          </Link>
          {cats.map((c) => (
            <Link key={c} href={enlace(q, c)} aria-current={cat === c}>
              {c}
            </Link>
          ))}
        </nav>
      </section>

      <section className="pila" aria-live="polite">
        <p className="apagado numeros">
          {total === 0
            ? "No hay recetas que coincidan. Probá con otra palabra o sacá la categoría."
            : `${total} recetas${q ? ` para “${q}”` : ""}${cat ? ` en ${cat}` : ""}`}
        </p>
        <div className="grilla">
          {recetas.map((r) => (
            <TarjetaReceta key={r.slug} receta={r} />
          ))}
        </div>
        {paginas > 1 && (
          <nav className="paginas" aria-label="Páginas">
            {pagina > 1 && (
              <Link className="boton secundario chico" href={enlace(q, cat, pagina - 1)}>
                Anterior
              </Link>
            )}
            <span className="apagado numeros">
              Página {pagina} de {paginas}
            </span>
            {pagina < paginas && (
              <Link className="boton secundario chico" href={enlace(q, cat, pagina + 1)}>
                Siguiente
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
