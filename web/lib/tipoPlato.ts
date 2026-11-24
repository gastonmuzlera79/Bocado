/**
 * Tipo de plato para elegir la ilustración genérica de una receta.
 * Se deduce del título (y si no alcanza, de la descripción y la categoría) con reglas en orden:
 * gana la primera que coincide, así "Pochoclos de pollo" es pollo y no snack.
 */
export const TIPOS_PLATO = [
  "pizza",
  "hamburguesa",
  "empanadas",
  "pastas",
  "sopas",
  "arroz",
  "frios",
  "pollo",
  "pescado",
  "carne",
  "huevos",
  "panqueques",
  "pan",
  "tortas",
  "galletitas",
  "frutas",
  "papas",
  "snacks",
  "verduras",
  "general",
] as const;

export type TipoPlato = (typeof TIPOS_PLATO)[number];

export const NOMBRE_TIPO: Record<TipoPlato, string> = {
  pizza: "Pizza",
  hamburguesa: "Hamburguesas y sándwiches",
  empanadas: "Empanadas y tartas",
  pastas: "Pastas",
  sopas: "Sopas y guisos",
  arroz: "Arroz",
  frios: "Postres fríos",
  pollo: "Pollo",
  pescado: "Pescados y mariscos",
  carne: "Carnes",
  huevos: "Huevos",
  panqueques: "Panqueques y waffles",
  pan: "Panes",
  tortas: "Tortas y budines",
  galletitas: "Galletitas",
  frutas: "Frutas",
  papas: "Papas y batatas",
  snacks: "Snacks y picadas",
  verduras: "Verduras",
  general: "Receta",
};

/** Arma una expresión que busca palabras enteras, también las que terminan en tilde (tiramisú, puré). */
function palabras(...alternativas: string[]) {
  return new RegExp(`(?<![\\p{L}])(?:${alternativas.join("|")})(?![\\p{L}])`, "u");
}

const VERDURA = "berenjenas?|zucchinis?|lentejas|garbanzos?|calabaza|espinaca|br[oó]coli|soja|quinoa|coliflor|zapallo|porotos|acelga|arvejas|choclo|hongos";
const DULCE = "peras?|manzanas?|frutillas?|lim[oó]n|coco|mandarina|naranja|miel|almendras?|dulce de leche|chocolate|frutos|frutas|durazno|ricota y miel|crema|cacao|banana|lima|brownie|nueces";

const REGLAS: [TipoPlato, RegExp][] = [
  ["pizza", palabras("pizzas?", "pizzetas?", "pizzitas?", "a la pizza", "calzones?", "fugazzas?", "fugazzetas?")],
  ["hamburguesa", palabras("hamburguesas?", "s[aá]ndwich(?:es)?", "sanguches?", "tostados?", "tacos?", "wraps?", "burritos?", "quesadillas?", "lomitos?", "arrolladitos?", "choripanes?", "shawarma", "chimichangas?", "panchos?")],
  ["tortas", new RegExp(`(?<![\\p{L}])tart(?:as?|itas?) .*(?:${DULCE})`, "u")],
  ["empanadas", palabras("empanad(?:as?|itas?) (?:de|criollas?|salte[nñ]as?|tucumanas?|caseras?|al|fritas?|arabes|árabes)", "^empanad(?:as|itas)", "tartas?", "tartitas?", "pascualinas?", "quiches?", "quichecitas?", "canastitas?", "pastel(?:es|itos?)? de (?:papa|carne|choclo)")],
  ["pastas", palabras("fideos", "ravioles", "raviolones", "capeletis", "lasa[nñ]as?", "[nñ]oquis", "canelones", "sorrentinos", "tallarines", "macarrones", "spaghetti", "tirabuzones", "mo[nñ]os")],
  ["sopas", new RegExp(`(?<![\\p{L}])(?:sopas?|caldos?|vel[oó]ut[eé]s?|guisos?|guisito|locros?|cazuelas?|minestrone|puchero|estofados?|carbonada|crema de (?:${VERDURA}|verduras|choclo|arvejas|puerros?|tomate|papa))(?![\\p{L}])`, "u")],
  ["arroz", /^(?:arroz(?! con leche| de coliflor)|risotto|paella)|(?<![\p{L}])(?:risottos?|paellas?)(?![\p{L}])/u],
  ["tortas", /^brownies?/u],
  ["frutas", /^(?:peras?|manzanas?|duraznos?|bananas?)(?![\p{L}]).*helado/u],
  ["frios", palabras("mousses?", "flan(?:es|cito|citos)?", "tiramis[uú]", "parfaits?", "helados?", "panna cotta", "gelatinas?", "chocotortas?", "cr[eè]me br[uû]l[eé]e", "arroz con leche", "postres? fr[ií]os?", "en vasitos?", "en copas?", "chaj[aá]", "cheesecakes?", "lemon pie", "pavlovas?", "semifr[ií]os?", "marquise", "natillas?", "crema de (?:chocolate|frutillas|caf[eé]|maracuy[aá]|vainilla|dulce de leche)")],
  ["pollo", palabras("pollo", "alitas?", "supremas?", "pechugas?", "patitas? de pollo", "muslos?", "pavo")],
  ["pescado", palabras("salm[oó]n", "at[uú]n", "pescados?", "merluza", "trucha", "camarones", "langostinos?", "calamar(?:es)?", "rabas", "mariscos", "abadejo", "bacalao", "sardinas?", "cangrejo", "mejillones", "pejerrey")],
  ["huevos", palabras("huevos?", "omelett?es?", "frittatas?", "frittatitas?", "tortillas? (?!de ma[ií]z|de trigo|mexicanas?)", "tortilla$", "revueltos?", "shakshuka")],
  ["verduras", new RegExp(`(?<![\\p{L}])(?:milanesas?|alb[oó]ndig\\p{L}*|medallones|bocaditos?|nuggets?) de (?:${VERDURA})`, "u")],
  ["carne", palabras("carnes?", "entra[nñ]a", "peceto", "bondiola", "costill(?:as|itas)", "lomo", "vac[ií]o", "cerdo", "alb[oó]ndig(?:as|uitas)", "matambre", "chorizos?", "tira de asado", "asadito", "milanesas?", "cordero", "bifes?", "nalga", "cuadril", "colita", "pastr[oó]n", "osobuco", "ni[nñ]os envueltos", "kebab", "kofta", "salchichas?")],
  ["panqueques", palabras("panqueques?", "waffles?", "cr[eê]pes?", "pancakes?", "tostadas? francesas?", "torrejas?")],
  ["pan", palabras("pan", "panes", "pancitos?", "panecillos?", "bagels?", "chip[aá]s?", "medialunas?", "grisines?", "bollitos?", "focaccias?", "tortas? fritas", "roscas?", "facturas?", "scones?", "figazas?", "baguettes?", "ciabattas?", "pan chato", "bolitas de mandioca", "medialunitas?")],
  ["galletitas", palabras("galletit(?:a|as)", "galletas?", "cookies?", "merengu(?:es|itos?)", "tejas", "bizcochitos?", "barritas?", "granola", "palmeritas?", "cuadraditos?")],
  ["tortas", palabras("tortas?", "tortitas? de (?:cacao|chocolate|coco|nuez|lim[oó]n|vainilla)", "budines", "bud[ií]n", "budincitos?", "muffins?", "cupcakes?", "magdalenas?", "brownies?", "bizcochuelos?", "cheesecakes?", "volc[aá]n(?:es|cito|citos)?", "chocotorta", "rogel", "rolls?", "flan(?:es)?", "alfajor(?:es)?", "pionono", "mousse", "tiramis[uú]", "lemon pie", "postres?", "souffl[eé]s?", "cr[eè]me br[uû]l[eé]e", "bombones", "trufas", "pavlovas?", "retorcidos", "arroz con leche")],
  ["frutas", palabras("manzanas?", "peras?", "bananas?", "frutillas?", "anan[aá]", "duraznos?", "frutas?", "crumble", "parfait", "ciruelas?", "higos?", "mango")],
  ["papas", palabras("papas?", "batatas?", "pur[eé]", "r[oö]sti")],
  ["snacks", palabras("pochoclos?", "bocad(?:os|itos)", "croquetas?", "bastones", "bastoncitos", "dips?", "aros de cebolla", "garbanzos", "nachos", "chips", "crocantes?", "palitos", "snacks?", "teque[nñ]os", "bu[nñ]uelos", "bolitas", "nuggets?", "provoletas?", "totopos")],
  ["verduras", palabras("verduras?", "ensaladas?", "zapallitos?", "zucchinis?", "berenjenas?", "coliflor", "br[oó]coli", "calabaza", "zapallo", "choclos?", "esp[aá]rragos", "champi[nñ]ones", "portobellos?", "tofu", "lentejas", "morrones?", "tomates?", "espinaca", "repollitos", "hongos", "zanahorias?", "vegetales", "chauchas", "polenta", "cebollas?", "paltas?", "avena", "porotos")],
];

const POR_CATEGORIA: Record<string, TipoPlato> = {
  "Postres": "tortas",
  "Panes, pizzas y masas": "pan",
  "Carnes": "carne",
  "Snacks y picadas": "snacks",
  "Desayunos y meriendas": "tortas",
  "Verduras y guarniciones": "verduras",
};

/** Saca los "sin huevo", "sin harina", etc.: dicen lo que la receta no lleva. */
function normalizar(t: string) {
  return t.toLowerCase().replace(/(?<![\p{L}])sin [\p{L}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function buscar(texto: string): TipoPlato | null {
  const t = normalizar(texto);
  for (const [tipo, re] of REGLAS) if (re.test(t)) return tipo;
  return null;
}

export function tipoPlato(r: { titulo: string; descripcion?: string | null; categoria?: string | null }): TipoPlato {
  return (
    buscar(r.titulo) ??
    (r.categoria ? POR_CATEGORIA[r.categoria] : undefined) ??
    (r.descripcion ? buscar(r.descripcion) : null) ??
    "general"
  );
}
