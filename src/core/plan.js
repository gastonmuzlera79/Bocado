import { normalize } from './normalize.js';
import { isStaple, matchRecipe } from './match.js';

/**
 * Arma un plan de `days` comidas sin repetir receta.
 * Elige de a una: prioriza recetas que reutilizan ingredientes ya elegidos
 * (así se compra menos y se desperdicia menos) y que cubren la despensa.
 */
export function buildPlan(pantry, recipes, { days = 5, diet = null, exclude = [], maxMinutes = Infinity } = {}) {
  const banned = exclude.map(normalize);
  let pool = recipes
    .filter((r) => !diet || r.tags.includes(diet))
    .filter((r) => r.minutes <= maxMinutes)
    .filter((r) => !r.ingredients.some((i) => banned.includes(normalize(i.name))));

  const plan = [];
  const bought = new Set(); // ingredientes que ya hay que comprar para el plan
  while (plan.length < days && pool.length > 0) {
    const scored = pool.map((r) => {
      const m = matchRecipe(pantry, r);
      const reused = m.missing.filter((i) => bought.has(normalize(i.name))).length;
      const newToBuy = m.missing.length - reused;
      // Menos cosas nuevas para comprar es mejor; a igualdad, más cobertura de despensa.
      return { r, m, rank: newToBuy * 10 - m.score * 5 - reused };
    });
    scored.sort((a, b) => a.rank - b.rank || a.r.minutes - b.r.minutes);
    const pick = scored[0];
    plan.push(pick.r);
    pick.m.missing.forEach((i) => bought.add(normalize(i.name)));
    pool = pool.filter((r) => r.id !== pick.r.id);
  }
  return plan;
}

export function planIngredients(plan) {
  return plan.flatMap((r) => r.ingredients.filter((i) => !isStaple(i.name)));
}
