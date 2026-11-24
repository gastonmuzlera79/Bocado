// Normaliza nombres de ingredientes para poder compararlos:
// minúsculas, sin tildes, sin plural simple ("tomates" -> "tomate").

export function normalize(text) {
  const base = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return base
    .split(' ')
    .map(singular)
    .join(' ');
}

function singular(word) {
  if (word.length <= 3) return word;
  if (word.endsWith('ces')) return word.slice(0, -3) + 'z'; // nueces -> nuez
  if (word.endsWith('es') && /[lnrdz]es$/.test(word)) return word.slice(0, -2); // limones -> limon
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}
