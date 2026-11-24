import type { TipoPlato } from "@/lib/tipoPlato";

/**
 * Foto de referencia por tipo de plato. Las recetas no usan fotos de los libros:
 * hasta que alguien suba una foto propia, se muestra esta imagen (generada con IA, en public/platos).
 */
export default function Ilustracion({ tipo, className }: { tipo: TipoPlato; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`ilustracion ${className ?? ""}`}
      src={`/platos/${tipo}.webp`}
      alt=""
      width={960}
      height={640}
      loading="lazy"
      decoding="async"
    />
  );
}
