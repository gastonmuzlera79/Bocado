/**
 * Tipo de plato para elegir la ilustración genérica de una receta.
 * Se deduce del título (y si no alcanza, de la descripción y la categoría) con reglas en orden:
 * gana la primera que coincide, así "Pochoclos de pollo" es pollo y no snack.
 */
export const TIPOS_PLATO = [
  "bebidas",
  "wraps",
  "brochetas",
  "tostadas",
  "dips",
  "granola",
  "chips",
  "facturas",
  "rellenas",
  "legumbres",
  "pizza",
  "hamburguesa",
  "sandwich",
  "empanadas",
  "tartas",
  "pastas",
  "sopas",
  "arroz",
  "frios",
  "salados",
  "ensaladas",
  "milanesas",
  "pollo",
  "pavo",
  "pescado",
  "mariscos",
  "albondigas",
  "cerdo",
  "cordero",
  "carne",
  "huevos",
  "panqueques",
  "pan",
  "tortas",
  "galletitas",
  "frutas",
  "papas",
  "croquetas",
  "snacks",
  "verduras",
  "general",
] as const;

export type TipoPlato = (typeof TIPOS_PLATO)[number];

export const NOMBRE_TIPO: Record<TipoPlato, string> = {
  pizza: "Pizza",
  bebidas: "Bebidas",
  wraps: "Wraps y tacos",
  brochetas: "Brochetas",
  tostadas: "Tostadas",
  dips: "Dips y salsas",
  granola: "Granola y barritas",
  chips: "Chips y pochoclos",
  facturas: "Facturas y donas",
  rellenas: "Verduras rellenas",
  legumbres: "Legumbres",
  hamburguesa: "Hamburguesas y medallones",
  sandwich: "Sándwiches y tostados",
  croquetas: "Croquetas y bastones",
  empanadas: "Empanadas",
  tartas: "Tartas",
  pastas: "Pastas",
  sopas: "Sopas y guisos",
  arroz: "Arroz",
  frios: "Postres fríos",
  salados: "Muffins y budines salados",
  ensaladas: "Ensaladas y bowls",
  milanesas: "Milanesas",
  pollo: "Pollo",
  pavo: "Pavo",
  pescado: "Pescados",
  mariscos: "Mariscos",
  albondigas: "Albóndigas",
  cerdo: "Cerdo",
  cordero: "Cordero",
  carne: "Carne vacuna",
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

const REGLAS: [TipoPlato, RegExp][] = [
  // Casos puntuales que las reglas generales clasifican mal.
  ["bebidas", /^(?:caf[eé]|licuados?|smoothies?|chocolatadas?|batidos?|jugos?|limonadas?)(?![\p{L}])/u],
  ["galletitas", /^(?:bocad(?:os|itos) de coco|coquitos|discos de chocolate)/u],
  ["snacks", /^(?:tejas|galletitas saladas|galletitas de cheddar|bizcochitos .*queso|queso y membrillo)/u],
  ["frios", /^crema tibia de chocolate/u],
  ["panqueques", /^(?:chaffles?|tortitas de (?:banana|avena))(?![\p{L}])/u],
  ["facturas", /^(?:rosquitas|pastelitos de (?:membrillo|batata)|espirales de canela)/u],
  ["tartas", /^(?:pastafrola|galette)/u],
  ["empanadas", /^(?:pastelitos salados|paquetitos de hojaldre)/u],
  ["pizza", /^calzoncitos/u],
  ["pastas", /^(?:lasa[nñ]itas|espaguetis)/u],
  ["tortas", /^pan (?:dulce|de banana)/u],
  ["rellenas", /^(?:ni[nñ]os envueltos|portobellos a la pizza)/u],
  ["carne", /^matambre a la pizza/u],
  ["verduras", /^(?:bifes de soja|br[oó]coli crocante|tofu crocante)/u],
  ["wraps", /^(?:wraps?|tacos?|burritos?|quesadillas?|chimichangas?|shawarmas?|fajitas?)(?![\p{L}])/u],
  ["brochetas", palabras("brochet(?:tes?|as?|itas?)", "pinchos?", "pinchitos?", "kebabs?", "kofta")],
  ["tostadas", /^(?:tostadas?(?! francesas?)(?![\p{L}])|croque monsieur|bruschettas?|crostinis?)/u],
  ["dips", /^(?:dips?|salsas?|hummus|guacamole|chimichurri|aderezos?|pat[eé]s?|untables?)(?![\p{L}])/u],
  ["granola", palabras("granolas?", "barritas?", "barras de cereal")],
  ["chips", /^(?:chips|pochoclos?(?! de pollo)|totopos|nachos)(?![\p{L}])/u],
  ["facturas", /^(?:medialunas?|medialunitas?|rolls?|donas?|facturas?|churros?|cuernitos?|vigilantes?|berlinesas?|bolas de fraile)(?![\p{L}])/u],
  ["rellenas", /^(?:medias? )?(?:zapallitos?|zucchinis?|tomates?|berenjenas?|morrones?|pimientos?|portobellos?|champi[nñ]ones|hongos|papas?|batatas?|cebollas?|paltas?|calabazas?|zapallos?|alcauciles?|repollos?)(?![\p{L}]).*rellen/u],
  ["legumbres", /^(?:falafels?|fain[aá] de (?:lentejas|garbanzos?)|lentejas|garbanzos|porotos|(?:bocaditos?|bolitas|croquetas?|nuggets?|medallones chicos) de (?:lentejas|garbanzos?|porotos))(?![\p{L}])/u],
  ["pizza", palabras("pizzas?", "pizzetas?", "pizzitas?", "a la pizza", "calzones?", "fugazzas?", "fugazzetas?")],
  ["hamburguesa", /^(?:hamburguesas?|hamburguesitas?|medall[oó]n(?:es)?(?! de lomo))(?![\p{L}])/u],
  ["sandwich", /^(?:s[aá]ndwich(?:es)?|sanguches?|tostados?(?![\p{L}])|lomitos?(?![\p{L}])|chorip[aá]n(?:es)?|panchos?(?![\p{L}])|arrollad\p{L}* de pan|tri[aá]ngulos de pan)/u],
  ["tartas", palabras("tart(?:as?|itas?)", "pascualinas?", "quiches?", "quichecitas?", "canastitas?", "pastel(?:es)? de (?:papa|carne|choclo|verduras)")],
  ["empanadas", palabras("empanad(?:as?|itas?) (?:de|criollas?|salte[nñ]as?|tucumanas?|caseras?|al|fritas?|arabes|árabes)", "^empanad(?:as|itas)")],
  ["pastas", palabras("fideos", "ravioles", "raviolones", "capeletis", "lasa[nñ]as?", "[nñ]oquis", "canelones", "sorrentinos", "tallarines", "macarrones", "spaghetti", "tirabuzones", "mo[nñ]os")],
  ["sopas", new RegExp(`(?<![\\p{L}])(?:sopas?|caldos?|vel[oó]ut[eé]s?|guisos?|guisito|locros?|cazuelas?|minestrone|puchero|estofados?|carbonada|crema de (?:${VERDURA}|verduras|choclo|arvejas|puerros?|tomate|papa))(?![\\p{L}])`, "u")],
  ["arroz", /^(?:arroz(?! con leche| de coliflor)|risotto|paella)|(?<![\p{L}])(?:risottos?|paellas?)(?![\p{L}])/u],
  ["ensaladas", /^(?:ensaladas?|bowls?)(?![\p{L}])/u],
  ["milanesas", /(?<![\p{L}])(?:milanes(?:as?|itas?)|supremas? (?:a la )?napolitanas?)(?![\p{L}])/u],
  ["tortas", /^brownies?/u],
  ["salados", /(?<![\p{L}])(?:muffins?|bud[ií]n(?:es|cito|citos)?|magdalenas?|cupcakes?)(?![\p{L}]).*(?:salad[oa]s?|cheddar|queso|panceta|jam[oó]n|br[oó]coli|espinaca|verdeo|morr[oó]n|or[eé]gano|cebolla|aceitunas|tomate|cherry)/u],
  ["frutas", /^(?:peras?|manzanas?|duraznos?|bananas?)(?![\p{L}]).*helado/u],
  ["frios", palabras("mousses?", "flan(?:es|cito|citos)?", "tiramis[uú]", "parfaits?", "helados?", "panna cotta", "gelatinas?", "chocotortas?", "cr[eè]me br[uû]l[eé]e", "arroz con leche", "postres? fr[ií]os?", "en vasitos?", "en copas?", "chaj[aá]", "cheesecakes?", "lemon pie", "pavlovas?", "semifr[ií]os?", "marquise", "natillas?", "crema de (?:chocolate|frutillas|caf[eé]|maracuy[aá]|vainilla|dulce de leche)")],
  ["albondigas", palabras("alb[oó]ndigas", "albondiguitas? (?:de|en|con) (?:carne|cerdo|cordero|pollo|ternera)", "alb[oó]ndigas de pollo")],
  ["pavo", palabras("pavo", "pavita", "pavitas")],
  ["pollo", palabras("pollo", "alitas?", "supremas?", "pechugas?", "patitas? de pollo", "muslos?")],
  ["mariscos", palabras("camarones", "langostinos?", "calamar(?:es)?", "rabas", "mariscos", "cangrejos?", "mejillones", "pulpo", "almejas", "vieiras", "kanikama", "kani")],
  ["pescado", palabras("salm[oó]n", "at[uú]n", "pescados?", "merluza", "trucha", "abadejo", "bacalao", "sardinas?", "pejerrey", "filet(?:es)? de", "br[oó]tola", "corvina", "lenguado")],
  ["huevos", palabras("huevos?", "omelett?es?", "frittatas?", "frittatitas?", "tortillas?(?= )(?! de ma[ií]z| de trigo| mexicanas?)", "tortilla$", "revueltos?", "shakshuka")],
  ["croquetas", /^(?:croquet(?:as?|itas?)|bastones|bastoncitos|bocad(?:os|itos)|bolitas|nuggets?|alb[oó]ndiguitas|teque[nñ]os|bu[nñ]uelos|aros de cebolla|palitos)(?![\p{L}])(?!.*(?: de (?:cerdo|carne|cordero|ternera)|manzanas?|bananas?|coco|dulce|caramelo|canela))/u],
  ["cerdo", palabras("cerdo", "bondiola", "carr[eé]", "solomillo", "matambrito", "pechito", "lech[oó]n", "salchichas?", "costillitas?", "costillas(?! de (?:asado|ternera|vaca|res))")],
  ["cordero", palabras("cordero", "corderito", "chivito", "chivo", "cabrito", "borrego")],
  ["carne", palabras("carnes?", "entra[nñ]a", "peceto", "bondiola", "costill(?:as|itas)", "lomo", "vac[ií]o", "cerdo", "alb[oó]ndig(?:as|uitas)", "matambre", "chorizos?", "tira de asado", "asadito", "milanesas?", "bifes?", "nalga", "cuadril", "colita", "pastr[oó]n", "osobuco", "ni[nñ]os envueltos", "kebab", "kofta", "salchichas?")],
  ["panqueques", palabras("panqueques?", "waffles?", "cr[eê]pes?", "pancakes?", "tostadas? francesas?", "torrejas?")],
  ["pan", palabras("pan", "panes", "pancitos?", "panecillos?", "bagels?", "chip[aá]s?", "medialunas?", "grisines?", "bollitos?", "focaccias?", "tortas? fritas", "roscas?", "facturas?", "scones?", "figazas?", "baguettes?", "ciabattas?", "pan chato", "bolitas de mandioca", "medialunitas?")],
  ["galletitas", palabras("galletit(?:a|as)", "galletas?", "cookies?", "merengu(?:es|itos?)", "tejas", "bizcochitos?", "barritas?", "granola", "palmeritas?", "cuadraditos?")],
  ["tortas", palabras("tortas?", "tortitas? de (?:cacao|chocolate|coco|nuez|lim[oó]n|vainilla)", "budines", "bud[ií]n", "budincitos?", "muffins?", "cupcakes?", "magdalenas?", "brownies?", "bizcochuelos?", "cheesecakes?", "volc[aá]n(?:es|cito|citos)?", "chocotorta", "rogel", "rolls?", "flan(?:es)?", "alfajor(?:es)?", "pionono", "mousse", "tiramis[uú]", "lemon pie", "postres?", "souffl[eé]s?", "cr[eè]me br[uû]l[eé]e", "bombones", "trufas", "pavlovas?", "retorcidos", "arroz con leche")],
  ["frutas", palabras("manzanas?", "peras?", "bananas?", "frutillas?", "anan[aá]", "duraznos?", "frutas?", "crumble", "parfait", "ciruelas?", "higos?", "mango")],
  ["papas", palabras("papas?", "batatas?", "pur[eé]", "r[oö]sti")],
  ["snacks", palabras("snacks?", "provoletas?", "picadas?", "espirales", "aceitunas", "tablas?")],
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

/**
 * Fotos alternativas para los tipos con muchas recetas, para que el listado no repita siempre la misma.
 * Cada receta usa la primera variante cuyo patrón aparece en el título; si ninguna coincide, la foto base del tipo.
 * Los archivos están en public/platos/<tipo>-<variante>.webp.
 */
const VARIANTES: Partial<Record<TipoPlato, [string, RegExp][]>> = {
  tortas: [
    ["muffins", /muffins?|cupcakes?|magdalenas?|budincitos?/],
    ["chocolate", /brownie|volc[aá]n|chocolate|cacao|fondant|rogel|marmol/],
  ],
  verduras: [
    ["gratinadas", /gratin|napolitana|con queso|a la crema|salsa (?:blanca|de queso)|costra|polenta/],
    ["verdes", /br[oó]coli|coliflor|esp[aá]rragos|chauchas|acelga|espinaca|hojas verdes|zapallitos|zucchini/],
    ["asadas", /tomates?|cebollas?|morrones?|pimientos?/],
  ],
  pan: [
    ["pancitos", /pancit|bollit|bollos|chip[aá]|scones?|bagels?|panecillos|tortas fritas/],
    ["focaccia", /focaccia|chato|trenza|relleno|de ajo/],
  ],
  croquetas: [
    ["bastones", /bastones|bastoncitos|palitos|aros/],
    ["bolitas", /bolitas|bu[nñ]uelos|bocad|alb[oó]ndiguitas/],
  ],
  carne: [
    ["matambre", /matambre|arrollad|roast|peceto|lomo relleno|musaka/],
    ["salteada", /tiras|saltead|braseada|con papas|encebollad|a la criolla|asadito/],
  ],
  pizza: [
    ["pizzetas", /pizzetas?|calzon/],
    ["verdura", /coliflor|zucchini|zapallito|espinaca|berenjena|keto|avena|polenta|vegana|verduras|calabaza|verde/],
  ],
  pollo: [
    ["pechugas", /pechuga|suprema|filetes|grillad|mariposa/],
    ["salsa", /curry|wok|oriental|soja|salsa|champi|verdeo|mostaza|yogur|ajillo/],
  ],
  frios: [
    ["cheesecake", /cheesecake|lemon pie|pavlova/],
    ["copas", /mousse|tiramis|vasito|copa|parfait|crema|gelatina|helado|panna|chaj/],
  ],
  tartas: [["dulce", /manzana|pera|frutilla|frutos|lim[oó]n|miel|mandarina|chocolate|brownie|yogur|lima|pastafrola|galette/]],
  frutas: [
    ["crumble", /crumble|galette/],
    ["bananas", /banana/],
  ],
  papas: [["batatas", /batata/]],
  rellenas: [
    ["hongos", /champi|portobello|hongos/],
    ["papas", /^(?:papas|batatas)/],
  ],
  panqueques: [
    ["waffles", /waffles?|chaffle/],
    ["crepes", /cr[eê]pes?|finos|con dulce|suzette|torrejas|tostadas francesas/],
  ],
};

/** Ruta de la foto de referencia de una receta: la del tipo de plato, o una variante si el título la pide. */
export function fotoPlato(r: { titulo: string; descripcion?: string | null; categoria?: string | null }): string {
  const tipo = tipoPlato(r);
  const t = normalizar(r.titulo);
  for (const [variante, re] of VARIANTES[tipo] ?? []) if (re.test(t)) return `/platos/${tipo}-${variante}.webp`;
  return `/platos/${tipo}.webp`;
}
