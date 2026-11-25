import type { Metadata } from "next";
import Recetario from "@/componentes/Recetario";
import { buscarRecetas, categorias } from "@/lib/datos";
import type { Orden } from "@/lib/tipos";

export const metadata: Metadata = { title: "Recetas" };
export const dynamic = "force-dynamic";

type Params = Promise<{ q?: string; cat?: string; pagina?: string; orden?: string }>;

export default async function Recetas({ searchParams }: { searchParams: Params }) {
  const { q = "", cat = null, pagina: pag = "1", orden: ord } = await searchParams;
  const orden: Orden = ord === "rapidas" || ord === "az" ? ord : "mezcla";
  const pagina = Math.max(1, Number(pag) || 1);
  const [{ recetas, total }, cats] = await Promise.all([buscarRecetas(q, cat, pagina, orden), categorias()]);
  return <Recetario q={q} cat={cat} pagina={pagina} orden={orden} recetas={recetas} total={total} cats={cats} />;
}
