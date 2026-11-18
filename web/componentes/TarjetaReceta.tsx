import Link from "next/link";
import { minutosTexto } from "@/lib/texto";
import type { RecetaResumen } from "@/lib/tipos";

export default function TarjetaReceta({ receta }: { receta: RecetaResumen }) {
  const min = minutosTexto(receta.minutos);
  return (
    <Link href={`/recetas/${receta.slug}`} className="tarjeta">
      {receta.categoria && <span className="etiqueta">{receta.categoria}</span>}
      <h2>{receta.titulo}</h2>
      {receta.descripcion && <p className="apagado chico">{receta.descripcion}</p>}
      <p className="meta">
        {min && <span>{min}</span>}
        {receta.dificultad && <span>{receta.dificultad}</span>}
      </p>
    </Link>
  );
}
