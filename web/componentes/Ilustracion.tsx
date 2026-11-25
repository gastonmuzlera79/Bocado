import { conBase } from "@/lib/rutas";

/**
 * Foto de referencia por tipo de plato. Las recetas no usan fotos de los libros:
 * hasta que alguien suba una foto propia, se muestra esta imagen (generada con IA, en public/platos; ver fotoPlato en lib/tipoPlato).
 */
export default function Ilustracion({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`ilustracion ${className ?? ""}`}
      src={conBase(src)}
      alt=""
      width={960}
      height={640}
      loading="lazy"
      decoding="async"
    />
  );
}
