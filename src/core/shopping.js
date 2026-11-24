import { normalize } from './normalize.js';
import { planIngredients } from './plan.js';

/**
 * Lista de compras de un plan, restando la despensa y sumando cantidades
 * de un mismo ingrediente cuando comparten unidad.
 * Si las unidades difieren se dejan como renglones separados (no se convierte nada).
 */
export function shoppingList(plan, pantry = []) {
  const have = new Set(pantry.map(normalize));
  const rows = new Map();
  for (const ing of planIngredients(plan)) {
    const key = normalize(ing.name);
    if (have.has(key)) continue;
    const rowKey = `${key}|${ing.unit ?? ''}`;
    const row = rows.get(rowKey) ?? { name: ing.name, unit: ing.unit ?? '', qty: 0 };
    row.qty += ing.qty ?? 0;
    rows.set(rowKey, row);
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function formatList(list) {
  return list
    .map((r) => (r.qty ? `${r.name}: ${r.qty}${r.unit ? ' ' + r.unit : ''}` : r.name))
    .join('\n');
}
