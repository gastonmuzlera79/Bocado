import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalize, suggest, matchRecipe, buildPlan, shoppingList, formatList } from '../src/core/index.js';

const recipes = JSON.parse(readFileSync(new URL('../src/data/recipes.json', import.meta.url), 'utf8'));

test('normalize quita tildes, mayúsculas y plurales simples', () => {
  assert.equal(normalize('Tomates'), 'tomate');
  assert.equal(normalize('  LIMONES '), 'limon');
  assert.equal(normalize('Jamón cocido'), 'jamon cocido');
  assert.equal(normalize('Zanahorias'), 'zanahoria');
  assert.equal(normalize('arroz'), 'arroz');
});

test('matchRecipe ignora básicos y lista lo que falta', () => {
  const tortilla = recipes.find((r) => r.id === 'tortilla-papas');
  const m = matchRecipe(['Papas', 'huevos'], tortilla);
  assert.equal(m.owned.length, 2);
  assert.deepEqual(m.missing.map((i) => i.name), ['cebolla']);
  assert.ok(Math.abs(m.score - 2 / 3) < 1e-9);
});

test('suggest ordena por cobertura y respeta maxMissing', () => {
  const res = suggest(['papa', 'huevo', 'cebolla'], recipes, { maxMissing: 0 });
  assert.equal(res[0].recipe.id, 'tortilla-papas');
  assert.ok(res.every((m) => m.missing.length === 0));
});

test('suggest filtra por dieta y por ingredientes excluidos', () => {
  const veg = suggest(['papa', 'huevo', 'cebolla', 'lentejas', 'zanahoria'], recipes, { diet: 'vegano', maxMissing: 5 });
  assert.ok(veg.length > 0);
  assert.ok(veg.every((m) => m.recipe.tags.includes('vegano')));

  const sinHuevo = suggest(['papa', 'huevo', 'cebolla'], recipes, { exclude: ['huevo'], maxMissing: 5 });
  assert.ok(sinHuevo.every((m) => !m.recipe.ingredients.some((i) => i.name === 'huevo')));
});

test('buildPlan no repite recetas y respeta el tiempo máximo', () => {
  const plan = buildPlan(['papa', 'huevo'], recipes, { days: 5, maxMinutes: 30 });
  assert.equal(plan.length, 5);
  assert.equal(new Set(plan.map((r) => r.id)).size, 5);
  assert.ok(plan.every((r) => r.minutes <= 30));
});

test('buildPlan devuelve menos días si no hay recetas suficientes', () => {
  const plan = buildPlan([], recipes, { days: 20 });
  assert.equal(plan.length, recipes.length);
});

test('shoppingList suma cantidades, resta despensa y omite básicos', () => {
  const plan = ['tortilla-papas', 'revuelto-gramajo'].map((id) => recipes.find((r) => r.id === id));
  const list = shoppingList(plan, ['cebolla']);
  const byName = Object.fromEntries(list.map((r) => [r.name, r]));
  assert.equal(byName.papa.qty, 7); // 4 + 3
  assert.equal(byName.huevo.qty, 9); // 5 + 4
  assert.equal(byName['jamon cocido'].qty, 100);
  assert.equal(byName.cebolla, undefined);
  assert.equal(byName.sal, undefined);
  assert.equal(byName.aceite, undefined);
});

test('formatList genera texto legible', () => {
  const txt = formatList([{ name: 'papa', qty: 7, unit: 'u' }, { name: 'sal', qty: 0, unit: '' }]);
  assert.equal(txt, 'papa: 7 u\nsal');
});
