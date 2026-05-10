import type { Product } from "@/types";

// ── Intent types ──────────────────────────────────────────────────────────────
interface QueryIntent {
  occasions: string[];
  styles: string[];
  seasons: string[];
  gender: "men" | "women" | "unisex" | null;
  priceMax: number | null;
  productTypes: string[];
  materials: string[];
  colors: string[];
  rawTerms: string[];
}

// ── Keyword → intent map ──────────────────────────────────────────────────────
const KEYWORD_MAP: Array<{
  words: string[];
  intent: Partial<
    Omit<QueryIntent, "rawTerms" | "priceMax" | "gender">
  >;
}> = [
  {
    words: ["wedding", "bride", "bridal", "bridesmaid", "ceremony", "reception"],
    intent: { occasions: ["wedding"], styles: ["elegant"] },
  },
  {
    words: ["office", "work", "business", "professional", "formal", "meeting"],
    intent: { occasions: ["work"], styles: ["elegant", "classic"] },
  },
  {
    words: ["party", "night", "club", "evening", "cocktail", "date", "dinner"],
    intent: { occasions: ["party"], styles: ["elegant"] },
  },
  {
    words: ["casual", "everyday", "daily", "weekend", "relaxed", "laid-back"],
    intent: { occasions: ["casual"], styles: ["casual"] },
  },
  {
    words: ["sport", "gym", "running", "workout", "fitness", "training", "athletic", "run", "exercise", "jog"],
    intent: { occasions: ["sport"], styles: ["athleisure"] },
  },
  {
    words: ["outdoor", "trail", "hiking", "hike", "nature", "mountain", "trek"],
    intent: { occasions: ["outdoor"], styles: ["casual"] },
  },
  {
    words: ["beach", "vacation", "holiday", "travel", "resort", "tropical"],
    intent: { occasions: ["beach"], seasons: ["summer"] },
  },
  {
    words: ["boho", "bohemian", "festival", "vintage", "retro", "folk", "earthy"],
    intent: { styles: ["boho"] },
  },
  {
    words: ["elegant", "chic", "sophisticated", "glamour", "luxe", "polished"],
    intent: { styles: ["elegant"] },
  },
  {
    words: ["cozy", "comfortable", "warm", "soft", "snug", "slouchy"],
    intent: { styles: ["cozy"], seasons: ["winter"] },
  },
  {
    words: ["minimalist", "simple", "clean", "minimal", "understated", "sleek"],
    intent: { styles: ["minimalist"] },
  },
  {
    words: ["streetwear", "urban", "street", "hypebeast", "edgy", "grunge"],
    intent: { styles: ["streetwear"] },
  },
  {
    words: ["classic", "timeless", "traditional", "preppy", "heritage"],
    intent: { styles: ["classic"] },
  },
  {
    words: ["athleisure", "sporty", "active"],
    intent: { styles: ["athleisure", "casual"] },
  },
  {
    words: ["summer", "hot", "sunny", "warm weather"],
    intent: { seasons: ["summer"] },
  },
  {
    words: ["winter", "cold", "snow", "freezing", "icy"],
    intent: { seasons: ["winter"] },
  },
  {
    words: ["spring", "rain", "transitional"],
    intent: { seasons: ["spring"] },
  },
  {
    words: ["autumn", "fall", "october", "november"],
    intent: { seasons: ["autumn"] },
  },
  {
    words: ["shoes", "sneakers", "footwear", "kicks", "trainers", "boots"],
    intent: { productTypes: ["shoes"] },
  },
  {
    words: ["apparel", "clothes", "clothing", "outfit", "top", "hoodie", "jacket", "tshirt"],
    intent: { productTypes: ["apparel"] },
  },
  {
    words: ["socks", "sock"],
    intent: { productTypes: ["socks"] },
  },
  {
    words: ["accessories", "bag", "beanie", "cap", "hat"],
    intent: { productTypes: ["accessories"] },
  },
  {
    words: ["wool", "merino", "woolly"],
    intent: { materials: ["wool"], styles: ["cozy"] },
  },
  {
    words: ["mesh", "breathable", "airy", "ventilated"],
    intent: { materials: ["mesh"], seasons: ["summer"] },
  },
  {
    words: ["leather", "suede", "vegan leather"],
    intent: { materials: ["leather"], styles: ["elegant", "classic"] },
  },
  {
    words: ["knit", "knitwear", "knitted"],
    intent: { materials: ["knit"], styles: ["cozy"] },
  },
  {
    words: ["black", "jet black", "all-black", "noir"],
    intent: { colors: ["black"] },
  },
  {
    words: ["white", "ivory", "cream", "off-white"],
    intent: { colors: ["white"] },
  },
  {
    words: ["green", "olive", "forest", "sage", "khaki"],
    intent: { colors: ["green"] },
  },
  {
    words: ["blue", "navy", "cobalt", "sky blue"],
    intent: { colors: ["blue"] },
  },
  {
    words: ["brown", "tan", "caramel", "cognac", "chestnut"],
    intent: { colors: ["brown"] },
  },
  {
    words: ["grey", "gray", "charcoal", "slate"],
    intent: { colors: ["grey"] },
  },
];

// ── Gender detection ──────────────────────────────────────────────────────────
const GENDER_WORDS: Record<string, "men" | "women" | "unisex"> = {
  men: "men",
  "men's": "men",
  mens: "men",
  guy: "men",
  male: "men",
  masculine: "men",
  boyfriend: "men",
  husband: "men",
  "for him": "men",
  women: "women",
  "women's": "women",
  womens: "women",
  girl: "women",
  female: "women",
  feminine: "women",
  wife: "women",
  girlfriend: "women",
  lady: "women",
  ladies: "women",
  "for her": "women",
};

// Price regex: "under 200", "below 300 PLN", "max 150", "within 400"
const PRICE_REGEX =
  /(?:under|below|max|within|less than|no more than|budget)\s*(?:pln\s*)?(\d+)/i;

// ── Parse natural language query into structured intents ──────────────────────
export function parseQueryIntent(query: string): QueryIntent {
  const lower = query.toLowerCase();
  const words = lower.split(/[\s,.\-/]+/).filter(Boolean);

  const intent: QueryIntent = {
    occasions: [],
    styles: [],
    seasons: [],
    gender: null,
    priceMax: null,
    productTypes: [],
    materials: [],
    colors: [],
    rawTerms: words,
  };

  // Extract price ceiling
  const priceMatch = lower.match(PRICE_REGEX);
  if (priceMatch) intent.priceMax = parseInt(priceMatch[1], 10);

  // Extract gender
  for (const word of words) {
    if (GENDER_WORDS[word]) {
      intent.gender = GENDER_WORDS[word];
      break;
    }
  }
  if (!intent.gender && lower.includes("for him")) intent.gender = "men";
  if (!intent.gender && lower.includes("for her")) intent.gender = "women";

  // Map keywords to intents
  for (const { words: kws, intent: ki } of KEYWORD_MAP) {
    if (kws.some((kw) => lower.includes(kw))) {
      if (ki.occasions) intent.occasions.push(...ki.occasions);
      if (ki.styles) intent.styles.push(...ki.styles);
      if (ki.seasons) intent.seasons.push(...ki.seasons);
      if (ki.productTypes) intent.productTypes.push(...ki.productTypes);
      if (ki.materials) intent.materials.push(...ki.materials);
      if (ki.colors) intent.colors.push(...ki.colors);
    }
  }

  // Deduplicate
  intent.occasions = [...new Set(intent.occasions)];
  intent.styles = [...new Set(intent.styles)];
  intent.seasons = [...new Set(intent.seasons)];
  intent.productTypes = [...new Set(intent.productTypes)];
  intent.materials = [...new Set(intent.materials)];
  intent.colors = [...new Set(intent.colors)];

  return intent;
}

// ── Product intent lookup tables ──────────────────────────────────────────────
const TYPE_INTENTS: Record<
  string,
  { occasions: string[]; styles: string[]; seasons: string[] }
> = {
  runner: {
    occasions: ["sport", "casual"],
    styles: ["athleisure"],
    seasons: ["summer"],
  },
  trainer: {
    occasions: ["sport", "gym"],
    styles: ["athleisure", "streetwear"],
    seasons: ["summer"],
  },
  walker: {
    occasions: ["casual", "work"],
    styles: ["casual", "minimalist"],
    seasons: [],
  },
  "slip-on": {
    occasions: ["casual", "beach"],
    styles: ["casual", "minimalist"],
    seasons: ["summer"],
  },
  hiker: {
    occasions: ["outdoor"],
    styles: ["casual"],
    seasons: ["autumn", "spring"],
  },
  loafer: {
    occasions: ["work", "casual", "party"],
    styles: ["elegant", "classic"],
    seasons: [],
  },
  flat: {
    occasions: ["work", "casual"],
    styles: ["minimalist", "classic"],
    seasons: [],
  },
  slide: {
    occasions: ["beach", "casual"],
    styles: ["casual"],
    seasons: ["summer"],
  },
  sock: {
    occasions: ["casual", "sport"],
    styles: ["casual", "cozy"],
    seasons: ["winter"],
  },
  tee: {
    occasions: ["casual", "sport", "beach"],
    styles: ["casual", "streetwear", "minimalist"],
    seasons: ["summer"],
  },
  hoodie: {
    occasions: ["casual", "sport"],
    styles: ["cozy", "streetwear", "athleisure"],
    seasons: ["winter", "autumn"],
  },
  pant: {
    occasions: ["casual", "work"],
    styles: ["classic", "minimalist"],
    seasons: [],
  },
  jacket: {
    occasions: ["outdoor", "casual"],
    styles: ["classic", "streetwear"],
    seasons: ["winter", "autumn"],
  },
  cardigan: {
    occasions: ["casual", "work"],
    styles: ["cozy", "classic", "boho"],
    seasons: ["winter", "autumn"],
  },
  bag: {
    occasions: ["casual", "work", "party"],
    styles: ["classic", "minimalist"],
    seasons: [],
  },
  beanie: {
    occasions: ["casual", "outdoor"],
    styles: ["cozy", "streetwear"],
    seasons: ["winter"],
  },
  cap: {
    occasions: ["sport", "casual", "beach"],
    styles: ["casual", "streetwear", "athleisure"],
    seasons: ["summer"],
  },
  insole: {
    occasions: ["casual", "sport"],
    styles: [],
    seasons: [],
  },
};

const MATERIAL_INTENTS: Record<
  string,
  { styles: string[]; seasons: string[] }
> = {
  wool: { styles: ["cozy", "classic"], seasons: ["winter", "autumn"] },
  mesh: { styles: ["athleisure"], seasons: ["summer"] },
  "tree-fiber": { styles: ["minimalist", "casual"], seasons: [] },
  knit: { styles: ["cozy", "casual"], seasons: ["winter", "autumn"] },
  leather: { styles: ["elegant", "classic"], seasons: [] },
};

const COLOR_HEX_NAMES: Record<string, string> = {
  "#1a1a1a": "black",
  "#0f0f0f": "black",
  "#333333": "grey",
  "#4d4d4d": "grey",
  "#f0ede6": "white",
  "#ffffff": "white",
  "#f5f5f5": "white",
  "#fffff0": "white",
  "#3d5a3d": "green",
  "#5c6b4f": "green",
  "#6b7c61": "green",
  "#4a6fa5": "blue",
  "#b5c4d3": "blue",
  "#8a7560": "brown",
  "#c4a882": "brown",
  "#d4b896": "brown",
  "#e8c99a": "brown",
};

function getProductColorNames(product: Product): string[] {
  return product.colors.flatMap((c) => {
    const fromHex = COLOR_HEX_NAMES[c.hex.toLowerCase()];
    const fromName = c.name.toLowerCase();
    return fromHex ? [fromHex, fromName] : [fromName];
  });
}

// ── Score a product against parsed intent ─────────────────────────────────────
export function scoreProduct(product: Product, intent: QueryIntent): number {
  let score = 0;

  // Hard price filter
  if (intent.priceMax !== null && product.price > intent.priceMax) {
    return -Infinity;
  }

  const typeI = TYPE_INTENTS[product.type] ?? {
    occasions: [],
    styles: [],
    seasons: [],
  };
  const matI = MATERIAL_INTENTS[product.material] ?? {
    styles: [],
    seasons: [],
  };
  const productColors = getProductColorNames(product);
  const descLower = product.description.toLowerCase();
  const nameLower = product.name.toLowerCase();
  const allTags = product.tags.map((t) => t.toLowerCase());

  // ── Gender (strong signal) ────────────────────────────────────
  if (intent.gender && intent.gender !== "unisex") {
    if (
      product.category === intent.gender ||
      product.category === "unisex"
    ) {
      score += 3;
    } else {
      score -= 5;
    }
  }

  // ── Occasion ─────────────────────────────────────────────────
  for (const occ of intent.occasions) {
    if (typeI.occasions.includes(occ)) score += 3;
    if (allTags.some((t) => t.includes(occ))) score += 2;
    if (descLower.includes(occ)) score += 1;
  }

  // ── Style ────────────────────────────────────────────────────
  for (const style of intent.styles) {
    if (typeI.styles.includes(style)) score += 2;
    if (matI.styles.includes(style)) score += 2;
    if (allTags.some((t) => t.includes(style))) score += 1.5;
    if (descLower.includes(style)) score += 0.5;
  }

  // ── Season ───────────────────────────────────────────────────
  for (const season of intent.seasons) {
    if (typeI.seasons.includes(season)) score += 2;
    if (matI.seasons.includes(season)) score += 2;
    if (allTags.some((t) => t.includes(season))) score += 1;
    if (descLower.includes(season)) score += 0.5;
  }

  // ── Product type ─────────────────────────────────────────────
  for (const pt of intent.productTypes) {
    if (pt === product.productCategory) score += 3;
    if (pt === product.type) score += 3;
  }

  // ── Material ─────────────────────────────────────────────────
  for (const mat of intent.materials) {
    if (product.material === mat) score += 3;
    if (product.materials.toLowerCase().includes(mat)) score += 1;
  }

  // ── Color ────────────────────────────────────────────────────
  for (const color of intent.colors) {
    if (productColors.some((pc) => pc.includes(color))) score += 2;
  }

  // ── Raw term fallback (keyword matching) ─────────────────────
  for (const term of intent.rawTerms) {
    if (term.length < 3) continue;
    if (nameLower.includes(term)) score += 4; // name hit = strongest signal
    else if (descLower.includes(term)) score += 1;
    if (allTags.some((t) => t.includes(term))) score += 1.5;
  }

  return score;
}

// ── Search result type ────────────────────────────────────────────────────────
export interface SearchResult {
  product: Product;
  score: number;
  /** Terms found in product name or tags — used for highlighting */
  matchedTerms: string[];
}

// ── Main semantic search ──────────────────────────────────────────────────────
export function semanticSearch(
  query: string,
  allProducts: Product[],
  limit = 8
): SearchResult[] {
  if (!query.trim()) return [];

  const intent = parseQueryIntent(query);

  return allProducts
    .map((product) => {
      const score = scoreProduct(product, intent);
      const matchedTerms = intent.rawTerms.filter(
        (t) =>
          t.length >= 3 &&
          (product.name.toLowerCase().includes(t) ||
            product.tags.some((tag) => tag.toLowerCase().includes(t)))
      );
      return { product, score, matchedTerms };
    })
    .filter((r) => Number.isFinite(r.score) && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ── Suggested query chips shown when search is empty ─────────────────────────
export const SUGGESTED_QUERIES = [
  "Wedding guest",
  "Office look",
  "Summer casual",
  "Trail running",
  "Cozy winter",
] as const;

// ── Smart related products (co-occurrence + similarity scoring) ───────────────
export function getSimilarProducts(
  product: Product,
  allProducts: Product[],
  limit = 4
): Product[] {
  const others = allProducts.filter((p) => p.id !== product.id);

  const scored = others.map((p) => {
    let score = 0;

    // Same type = very strong signal
    if (p.type === product.type) score += 5;

    // Same material
    if (p.material === product.material) score += 3;

    // Tag co-occurrence
    const sharedTags = p.tags.filter((t) => product.tags.includes(t));
    score += sharedTags.length * 2;

    // Same gender category
    if (
      p.category === product.category ||
      p.category === "unisex" ||
      product.category === "unisex"
    )
      score += 2;

    // Same productCategory
    if (p.productCategory === product.productCategory) score += 2;

    // Collection overlap (excluding "all")
    const sharedCollections = p.collections.filter(
      (c) => product.collections.includes(c) && c !== "all"
    );
    score += sharedCollections.length;

    // Similar price range
    const priceDiff = Math.abs(p.price - product.price) / product.price;
    if (priceDiff <= 0.15) score += 2;
    else if (priceDiff <= 0.3) score += 1;

    return { product: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
}
