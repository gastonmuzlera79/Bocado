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
