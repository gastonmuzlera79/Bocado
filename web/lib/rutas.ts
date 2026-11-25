/**
 * Prefijo de la web cuando se publica en una subcarpeta (por ejemplo, GitHub Pages en /Olleando).
 * Los <Link> de Next lo agregan solos; las imágenes y los formularios lo necesitan a mano.
 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function conBase(ruta: string) {
  return `${BASE}${ruta}`;
}

/** true en la versión estática (sin servidor): no hay cuentas ni panel. */
export const estatico = process.env.NEXT_PUBLIC_ESTATICO === "1";
