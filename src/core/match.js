import { normalize } from './normalize.js';

// Ingredientes que se asumen disponibles en cualquier cocina.
export const STAPLES = ['sal', 'pimienta', 'aceite', 'agua', 'azucar'].map(normalize);

export function isStaple(name) {
  return STAPLES.includes(normalize(name));
}

/**
 * Compara la despensa del usuario con una receta.
 * score = proporción de ingredientes (sin contar básicos) que ya se tienen.
 */
export function matchRecipe(pantry, recipe) {
  const have = new Set(pantry.map(normalize));
  const needed = recipe.ingredients.filter((i) => !isStaple(i.name));
  const owned = needed.filter((i) => have.has(normalize(i.name)));
  const missing = needed.filter((i) => !have.has(normalize(i.name)));
  const score = needed.length === 0 ? 1 : owned.length / needed.length;
  return { recipe, score, owned, missing };
}

/**
 * Devuelve las recetas ordenadas por cuánto cubre la despensa.
 * Opciones: maxMissing (default 3), diet (etiqueta requerida), exclude (ingredientes a evitar).
 */
export function suggest(pantry, recipes, { maxMissing = 3, diet = null, exclude = [] } = {}) {
  const banned = exclude.map(normalize);
  return recipes
    .filter((r) => !diet || r.tags.includes(diet))
    .filter((r) => !r.ingredients.some((i) => banned.includes(normalize(i.name))))
    .map((r) => matchRecipe(pantry, r))
    .filter((m) => m.missing.length <= maxMissing)
    .sort((a, b) => b.score - a.score || a.missing.length - b.missing.length || a.recipe.minutes - b.recipe.minutes);
}
