export type Dificultad = "fácil" | "media" | "difícil";

export type Ingrediente = {
  nombre: string;
  categoria: string;
  basico: boolean;
  sinonimos: string[];
};

export type Nutricion = {
  kcal: number | null;
  proteinas: number | null;
  grasas: number | null;
  carbohidratos: number | null;
};

export type RecetaResumen = {
  slug: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  minutos: number | null;
  dificultad: Dificultad | null;
};

export type Receta = RecetaResumen & {
  tecnica: string | null;
  porciones: number | null;
  temperatura: number | null;
  consejo: string | null;
  etiquetas: string[];
  fuente: string | null;
  ingredientes: { texto: string; opcional: boolean }[];
  pasos: string[];
  nutricion: Nutricion | null;
  /** true: estimada con el USDA; false: la trae el libro; null: sin datos. */
  nutricionEstimada: boolean | null;
};

export type Coincidencia = RecetaResumen & {
  coincidencia: number;
  tengo: number;
  necesito: number;
  faltantes: string[];
};

export type FiltrosCocina = {
  maxMinutos?: number | null;
  categoria?: string | null;
};

export type PaginaRecetas = { recetas: RecetaResumen[]; total: number };
