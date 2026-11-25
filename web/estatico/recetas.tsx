"use client";
/**
 * Versión estática de app/recetas/page.tsx (GitHub Pages, sin servidor). tools/sitio_estatico.mjs la copia en
 * lugar de la original: lee la búsqueda de la dirección y filtra en el navegador con los datos de prueba.
 */
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Cargando from "@/componentes/Cargando";
import Recetario from "@/componentes/Recetario";
import { buscarRecetas, categorias } from "@/lib/datos/demo";
import type { Orden } from "@/lib/tipos";

function RecetarioSegunDireccion() {
  const p = useSearchParams();
  const q = p.get("q") ?? "";
  const cat = p.get("cat");
  const ord = p.get("orden");
  const orden: Orden = ord === "rapidas" || ord === "az" ? ord : "mezcla";
  const pagina = Math.max(1, Number(p.get("pagina")) || 1);
  const { recetas, total } = buscarRecetas(q, cat, pagina, orden);
  return <Recetario q={q} cat={cat} pagina={pagina} orden={orden} recetas={recetas} total={total} cats={categorias()} />;
}

export default function Recetas() {
  return (
    <Suspense fallback={<Cargando />}>
      <RecetarioSegunDireccion />
    </Suspense>
  );
}
