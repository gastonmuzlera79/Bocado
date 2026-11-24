import { suggest, buildPlan, shoppingList, formatList } from '../src/core/index.js';

const recipes = await (await fetch('../src/data/recipes.json')).json();

const $ = (id) => document.getElementById(id);
const parseList = (text) => text.split(',').map((s) => s.trim()).filter(Boolean);

function options() {
  const minutes = Number($('minutes').value);
  return {
    pantry: parseList($('pantry').value),
    diet: $('diet').value || null,
    exclude: parseList($('exclude').value),
    maxMinutes: minutes > 0 ? minutes : Infinity,
  };
}

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderSuggestions() {
  const { pantry, diet, exclude, maxMinutes } = options();
  const box = $('suggestions');
  box.replaceChildren();
  const results = suggest(pantry, recipes, { diet, exclude, maxMissing: 3 }).filter((m) => m.recipe.minutes <= maxMinutes);
  if (results.length === 0) {
    box.append(el('p', 'Con esos ingredientes no hay recetas que cierren. Probá sumar algo o relajar los filtros.', 'empty'));
    return;
  }
  for (const m of results) {
    const card = el('article', undefined, 'card');
    card.append(el('h3', m.recipe.title));
    card.append(el('p', `${m.recipe.minutes} min · ${m.recipe.servings} porciones`, 'meta'));
    card.append(
      el('p', m.missing.length === 0 ? 'Tenés todo.' : `Te falta: ${m.missing.map((i) => i.name).join(', ')}`, m.missing.length === 0 ? 'ok' : 'missing'),
    );
    const details = el('details');
    details.append(el('summary', 'Ver pasos'));
    const steps = el('ol');
    m.recipe.steps.forEach((s) => steps.append(el('li', s)));
    details.append(steps);
    card.append(details);
    box.append(card);
  }
}

function renderPlan() {
  const { pantry, diet, exclude, maxMinutes } = options();
  const plan = buildPlan(pantry, recipes, { days: 5, diet, exclude, maxMinutes });
  const list = $('plan');
  list.replaceChildren();
  plan.forEach((r) => list.append(el('li', `${r.title} (${r.minutes} min)`)));
  $('shopping').textContent = plan.length ? formatList(shoppingList(plan, pantry)) || 'No hace falta comprar nada.' : 'No hay recetas para esos filtros.';
}

['pantry', 'diet', 'exclude', 'minutes'].forEach((id) => $(id).addEventListener('input', renderSuggestions));
$('plan-btn').addEventListener('click', renderPlan);
renderSuggestions();
