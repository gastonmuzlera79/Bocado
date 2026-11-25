/** Minúsculas, sin acentos y sin espacios de más: la misma idea que public.normalizar() en la base. */
export function normalizar(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function minutosTexto(m: number | null): string | null {
  if (!m) return null;
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim();
}

export const POR_PAGINA = 24;

/** Nombre de archivo de la foto de una categoría: "Panes, pizzas y masas" → "panes-pizzas-y-masas". */
export function slugCategoria(c: string) {
  return c
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Número estable a partir de un texto (FNV-1a). Sirve para mezclar sin azar: el mismo texto da siempre el mismo valor. */
export function huella(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
