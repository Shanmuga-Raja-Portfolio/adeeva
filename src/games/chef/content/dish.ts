import type { CuisineId } from "./cuisine";
import type { IngredientId } from "./ingredient";
import type { ComponentId } from "./plateComponent";
import type { TastePoint } from "./seasoning";
import type { TasteTag } from "./tasteTag";

export const STEP_KINDS = ["chop", "sizzle", "simmer", "taste", "plate"] as const;
export type StepKind = (typeof STEP_KINDS)[number];
export type CookStepKind = Exclude<StepKind, "plate">;

export interface DishStepDef {
  readonly kind: StepKind;
  readonly weight: number;
}

export const CUT_KINDS = ["slice", "dice", "mince"] as const;
export type CutKind = (typeof CUT_KINDS)[number];

export interface ChopItemDef {
  readonly ingredient: IngredientId;
  readonly cut: CutKind;
  readonly marks: number;
  readonly tempo: number;
}

export const PIECE_KINDS = [
  "chicken",
  "plantain",
  "gnocchi",
  "egg",
  "bread",
  "seeds",
  "corn",
  "onion",
  "tortilla",
] as const;
export type PieceKind = (typeof PIECE_KINDS)[number];

export interface SizzleDef {
  readonly piece: PieceKind;
  readonly count: number;
  readonly idealDots: number;
  readonly flips: number;
}

export const SIMMER_PATHS = ["circle", "figure-eight", "zigzag"] as const;
export type SimmerPath = (typeof SIMMER_PATHS)[number];

export interface SimmerDef {
  readonly path: SimmerPath;
  readonly colour: string;
  readonly laps: number;
  readonly startLevel: number;
  readonly targetLevel: number;
}

export interface TasteDef {
  readonly start: TastePoint;
  readonly target: TastePoint;
  readonly savoury: number;
}

export interface PlateDef {
  readonly base: ComponentId | null;
  readonly hero: ComponentId;
  readonly sauce: ComponentId | null;
  readonly garnishes: readonly ComponentId[];
  readonly garnishCount: number;
}

export const UNLOCK_LEVELS = ["learner", "confident", "expert"] as const;
export type UnlockLevel = (typeof UNLOCK_LEVELS)[number];

export interface DishDef {
  readonly id: string;
  readonly name: string;
  readonly cuisine: CuisineId;
  readonly region: string;
  readonly blurb: string;
  readonly unlock: UnlockLevel;
  readonly ingredients: readonly IngredientId[];
  readonly tags: readonly [TasteTag, TasteTag];
  readonly steps: readonly DishStepDef[];
  readonly chop: readonly ChopItemDef[];
  readonly sizzle: SizzleDef | null;
  readonly simmer: SimmerDef | null;
  readonly taste: TasteDef | null;
  readonly plate: PlateDef;
}

const STEP_LETTERS: Readonly<Record<string, StepKind>> = {
  C: "chop",
  Z: "sizzle",
  S: "simmer",
  T: "taste",
  P: "plate",
};

function steps(pattern: string): DishStepDef[] {
  return pattern.split(" ").map((token) => {
    const kind = STEP_LETTERS[token.charAt(0)];
    if (kind === undefined) throw new Error(`Unknown step ${token}`);
    return { kind, weight: Number(token.slice(1)) };
  });
}

function cut(ingredient: IngredientId, kind: CutKind, marks: number, tempo: number): ChopItemDef {
  return { ingredient, cut: kind, marks, tempo };
}

function simmer(path: SimmerPath, laps: number, targetLevel: number, colour: string): SimmerDef {
  return { path, colour, laps, startLevel: 0.86, targetLevel };
}

function taste(start: TastePoint, target: TastePoint, savoury: number): TasteDef {
  return { start, target, savoury };
}

function sizzle(piece: PieceKind, count: number, idealDots: number, flips = 1): SizzleDef {
  return { piece, count, idealDots, flips };
}

function plate(
  hero: ComponentId,
  base: ComponentId | null,
  sauce: ComponentId | null,
  garnishes: readonly ComponentId[],
  garnishCount: number,
): PlateDef {
  return { base, hero, sauce, garnishes, garnishCount };
}

function dish<const I extends string>(
  definition: DishDef & { readonly id: I },
): DishDef & { readonly id: I } {
  return definition;
}

export const DISHES = [
  dish({
    id: "spaghetti-al-pomodoro",
    name: "Spaghetti al pomodoro",
    cuisine: "italian",
    region: "Italy",
    blurb: "Pasta in a bright tomato sauce, finished with basil.",
    unlock: "learner",
    ingredients: ["spaghetti", "tomato", "garlic", "basil", "olive-oil"],
    tags: ["comforting", "fresh"],
    steps: steps("C20 S35 T25 P20"),
    chop: [cut("tomato", "dice", 4, 80), cut("basil", "mince", 2, 100)],
    sizzle: null,
    simmer: simmer("figure-eight", 3, 0.42, "#d9472b"),
    taste: taste([-3, -2], [-1, 0], 1),
    plate: plate("spaghetti-twirl", null, "tomato-swoosh", ["basil-leaf", "parmesan-shavings"], 1),
  }),
  dish({
    id: "minestrone",
    name: "Minestrone",
    cuisine: "italian",
    region: "Italy",
    blurb: "A thick soup of beans and garden vegetables.",
    unlock: "learner",
    ingredients: ["onion", "potato", "cannellini-beans", "tomato", "courgette"],
    tags: ["hearty", "colourful"],
    steps: steps("C35 S30 T20 P15"),
    chop: [cut("onion", "dice", 4, 72), cut("potato", "dice", 4, 66), cut("courgette", "slice", 6, 76)],
    sizzle: null,
    simmer: simmer("circle", 3, 0.48, "#d9663a"),
    taste: taste([-2, -3], [-1, -2], 1),
    plate: plate("minestrone-veg", "tomato-broth-bowl", null, ["basil-leaf", "olive-oil-drops"], 1),
  }),
  dish({
    id: "gnocchi-al-pesto",
    name: "Gnocchi al pesto",
    cuisine: "italian",
    region: "Italy (Liguria-style pesto)",
    blurb: "Soft potato gnocchi, golden in the pan, with green pesto.",
    unlock: "confident",
    ingredients: ["potato", "basil", "pine-nuts", "parmesan", "garlic"],
    tags: ["fresh", "comforting"],
    steps: steps("C30 Z20 T25 P25"),
    chop: [cut("potato", "slice", 6, 66), cut("basil", "mince", 2, 100)],
    sizzle: sizzle("gnocchi", 4, 3),
    simmer: null,
    taste: taste([-4, 1], [0, 1], 2),
    plate: plate("gnocchi-pile", null, "pesto-swoosh", ["pine-nut-scatter", "basil-leaf"], 2),
  }),
  dish({
    id: "risotto-alla-zucca",
    name: "Risotto alla zucca",
    cuisine: "italian",
    region: "Italy (northern)",
    blurb: "Creamy rice with sweet roasted pumpkin.",
    unlock: "expert",
    ingredients: ["arborio-rice", "pumpkin", "onion", "parmesan", "butter"],
    tags: ["comforting", "hearty"],
    steps: steps("C20 S40 T20 P20"),
    chop: [cut("pumpkin", "dice", 4, 60), cut("onion", "dice", 4, 72)],
    sizzle: null,
    simmer: simmer("zigzag", 4, 0.36, "#f0b04c"),
    taste: taste([3, -1], [2, 1], 1),
    plate: plate("pumpkin-risotto", null, null, ["parmesan-shavings", "herb-sprinkle"], 2),
  }),
  dish({
    id: "dal-tadka",
    name: "Dal tadka",
    cuisine: "indian",
    region: "India (north)",
    blurb: "Golden lentils topped with sizzling cumin and garlic.",
    unlock: "learner",
    ingredients: ["toor-dal", "ghee", "cumin-seeds", "garlic", "turmeric"],
    tags: ["comforting", "warming"],
    steps: steps("C15 S35 Z20 T20 P10"),
    chop: [cut("garlic", "mince", 2, 100)],
    sizzle: sizzle("seeds", 3, 2),
    simmer: simmer("zigzag", 3, 0.44, "#f2bf3a"),
    taste: taste([-2, -1], [1, -1], 1),
    plate: plate("dal-swirl", "golden-broth-bowl", null, ["coriander-sprig", "chilli-rings"], 2),
  }),
  dish({
    id: "chana-masala",
    name: "Chana masala",
    cuisine: "indian",
    region: "India (Punjab)",
    blurb: "Chickpeas in a warm, spiced tomato and onion sauce.",
    unlock: "learner",
    ingredients: ["chickpeas", "onion", "tomato", "ginger", "garam-masala"],
    tags: ["warming", "hearty"],
    steps: steps("C25 S30 T30 P15"),
    chop: [cut("onion", "dice", 4, 72), cut("ginger", "slice", 5, 64)],
    sizzle: null,
    simmer: simmer("figure-eight", 3, 0.4, "#b9561c"),
    taste: taste([-1, -3], [-1, 0], 1),
    plate: plate("chana-mound", null, "masala-swoosh", ["coriander-sprig", "onion-rings"], 1),
  }),
  dish({
    id: "sambar",
    name: "Sambar",
    cuisine: "indian",
    region: "India (Tamil Nadu and across South India)",
    blurb: "A tangy lentil and vegetable stew with tamarind.",
    unlock: "confident",
    ingredients: ["toor-dal", "tamarind", "aubergine", "curry-leaves", "tomato"],
    tags: ["warming", "zesty"],
    steps: steps("C30 S35 T20 P15"),
    chop: [cut("aubergine", "dice", 4, 74), cut("tomato", "slice", 5, 80)],
    sizzle: null,
    simmer: simmer("zigzag", 3, 0.46, "#c9762a"),
    taste: taste([-3, 0], [0, -2], 1),
    plate: plate("sambar-veg", "golden-broth-bowl", null, ["curry-leaf", "coriander-sprig"], 1),
  }),
  dish({
    id: "vegetable-biryani",
    name: "Vegetable biryani",
    cuisine: "indian",
    region: "India (many regional styles)",
    blurb: "Fragrant layered rice with peas and crispy onions.",
    unlock: "expert",
    ingredients: ["basmati-rice", "onion", "green-peas", "garam-masala", "ghee"],
    tags: ["warming", "colourful"],
    steps: steps("C30 Z20 S20 T15 P15"),
    chop: [cut("onion", "slice", 8, 72)],
    sizzle: sizzle("onion", 3, 3),
    simmer: simmer("circle", 2, 0.38, "#f6e2a8"),
    taste: taste([2, -2], [0, 2], 1),
    plate: plate("biryani-dome", null, null, ["onion-rings", "peas-scatter", "coriander-sprig"], 2),
  }),
  dish({
    id: "miso-soup",
    name: "Miso soup",
    cuisine: "japanese",
    region: "Japan",
    blurb: "A gentle broth with soft tofu and spring onion.",
    unlock: "learner",
    ingredients: ["dashi", "miso", "tofu", "spring-onion"],
    tags: ["delicate", "comforting"],
    steps: steps("C30 S35 T20 P15"),
    chop: [cut("tofu", "dice", 3, 88), cut("spring-onion", "slice", 8, 90)],
    sizzle: null,
    simmer: simmer("circle", 2, 0.5, "#d9b37a"),
    taste: taste([2, 0], [0, 0], 2),
    plate: plate("tofu-cubes", "miso-broth-bowl", null, ["spring-onion-rings", "nori-strip"], 1),
  }),
  dish({
    id: "onigiri",
    name: "Onigiri",
    cuisine: "japanese",
    region: "Japan",
    blurb: "Rice shaped by hand around salmon, wrapped in nori.",
    unlock: "learner",
    ingredients: ["short-grain-rice", "nori", "salmon-flakes"],
    tags: ["delicate", "fresh"],
    steps: steps("C25 T35 P40"),
    chop: [cut("nori", "slice", 4, 84)],
    sizzle: null,
    simmer: null,
    taste: taste([-3, 0], [0, 0], 1),
    plate: plate("onigiri-pair", null, null, ["salmon-flakes", "nori-strip"], 1),
  }),
  dish({
    id: "tamagoyaki",
    name: "Tamagoyaki",
    cuisine: "japanese",
    region: "Japan",
    blurb: "A rolled omelette made of thin, golden layers.",
    unlock: "confident",
    ingredients: ["eggs", "dashi", "soy-sauce"],
    tags: ["delicate", "comforting"],
    steps: steps("Z55 T20 P25"),
    chop: [],
    sizzle: sizzle("egg", 2, 2, 2),
    simmer: null,
    taste: taste([-1, -2], [1, 0], 1),
    plate: plate("tamagoyaki-roll", null, "soy-dots", ["spring-onion-rings", "salad-leaves"], 1),
  }),
  dish({
    id: "oyakodon",
    name: "Oyakodon",
    cuisine: "japanese",
    region: "Japan",
    blurb: "Chicken and soft egg simmered and spooned over rice.",
    unlock: "expert",
    ingredients: ["chicken", "eggs", "onion", "dashi", "short-grain-rice"],
    tags: ["hearty", "comforting"],
    steps: steps("C25 S25 Z20 T15 P15"),
    chop: [cut("chicken", "dice", 4, 68), cut("onion", "slice", 6, 72)],
    sizzle: sizzle("chicken", 3, 3),
    simmer: simmer("circle", 2, 0.42, "#d9b06a"),
    taste: taste([-2, 1], [1, -1], 1),
    plate: plate("oyako-topping", "rice-bowl", null, ["spring-onion-rings", "nori-strip"], 2),
  }),
  dish({
    id: "guacamole-con-totopos",
    name: "Guacamole con totopos",
    cuisine: "mexican",
    region: "Mexico",
    blurb: "Smashed avocado with lime, onion and crisp tortilla chips.",
    unlock: "learner",
    ingredients: ["avocado", "lime", "onion", "coriander-leaf", "corn-tortillas"],
    tags: ["fresh", "crunchy"],
    steps: steps("C45 T35 P20"),
    chop: [
      cut("avocado", "dice", 4, 84),
      cut("onion", "dice", 3, 72),
      cut("coriander-leaf", "mince", 2, 100),
    ],
    sizzle: null,
    simmer: null,
    taste: taste([-3, 1], [0, -1], 1),
    plate: plate("guacamole-bowl", null, null, ["totopos-fan", "lime-wedge", "coriander-sprig"], 2),
  }),
  dish({
    id: "elote",
    name: "Elote",
    cuisine: "mexican",
    region: "Mexico (street food)",
    blurb: "Charred corn on the cob with crema, cheese and lime.",
    unlock: "learner",
    ingredients: ["corn-cob", "crema", "queso-cotija", "fresh-chilli", "lime"],
    tags: ["smoky", "bold"],
    steps: steps("Z45 T25 P30"),
    chop: [],
    sizzle: sizzle("corn", 2, 4),
    simmer: null,
    taste: taste([-2, -2], [0, -1], 1),
    plate: plate("elote-cob", null, "crema-drizzle", ["cotija-crumble", "lime-wedge", "chilli-rings"], 2),
  }),
  dish({
    id: "sopa-de-tortilla",
    name: "Sopa de tortilla",
    cuisine: "mexican",
    region: "Mexico (central)",
    blurb: "A rich tomato and chilli soup with crisp tortilla strips.",
    unlock: "confident",
    ingredients: ["tomato", "ancho-chilli", "corn-tortillas", "avocado", "crema"],
    tags: ["warming", "crunchy"],
    steps: steps("C25 S35 T25 P15"),
    chop: [cut("corn-tortillas", "slice", 8, 80), cut("avocado", "dice", 3, 84)],
    sizzle: null,
    simmer: simmer("circle", 3, 0.44, "#c9402a"),
    taste: taste([1, -3], [1, 1], 1),
    plate: plate("tortilla-soup-top", "tomato-broth-bowl", null, ["avocado-cubes", "queso-crumble"], 2),
  }),
  dish({
    id: "enchiladas-verdes",
    name: "Enchiladas verdes",
    cuisine: "mexican",
    region: "Mexico",
    blurb: "Rolled tortillas filled with chicken under a green tomatillo sauce.",
    unlock: "expert",
    ingredients: ["tomatillo", "chicken", "corn-tortillas", "crema", "queso-fresco"],
    tags: ["zesty", "hearty"],
    steps: steps("C20 S30 Z15 T15 P20"),
    chop: [cut("tomatillo", "dice", 4, 78), cut("chicken", "slice", 6, 68)],
    sizzle: sizzle("tortilla", 2, 2),
    simmer: simmer("figure-eight", 2, 0.4, "#6fae3c"),
    taste: taste([3, 2], [1, -2], 1),
    plate: plate("enchilada-rolls", null, "salsa-verde-swoosh", ["queso-crumble", "coriander-sprig"], 2),
  }),
  dish({
    id: "omelette-aux-fines-herbes",
    name: "Omelette aux fines herbes",
    cuisine: "french",
    region: "France",
    blurb: "A soft folded omelette full of fresh herbs.",
    unlock: "learner",
    ingredients: ["eggs", "butter", "fines-herbes"],
    tags: ["delicate", "fresh"],
    steps: steps("C25 Z45 T10 P20"),
    chop: [cut("fines-herbes", "mince", 2, 100)],
    sizzle: sizzle("egg", 2, 2),
    simmer: null,
    taste: taste([-1, -1], [1, 0], 1),
    plate: plate("omelette-fold", null, null, ["herb-sprinkle", "salad-leaves"], 1),
  }),
  dish({
    id: "ratatouille",
    name: "Ratatouille",
    cuisine: "french",
    region: "France (Provence)",
    blurb: "Summer vegetables cooked slowly in tomato.",
    unlock: "learner",
    ingredients: ["aubergine", "courgette", "bell-pepper", "tomato", "olive-oil"],
    tags: ["colourful", "fresh"],
    steps: steps("C45 S25 T15 P15"),
    chop: [
      cut("aubergine", "dice", 4, 74),
      cut("courgette", "slice", 6, 76),
      cut("bell-pepper", "slice", 5, 78),
    ],
    sizzle: null,
    simmer: simmer("figure-eight", 3, 0.44, "#c9472b"),
    taste: taste([-2, 1], [1, 0], 1),
    plate: plate("ratatouille-spiral", null, "tomato-swoosh", ["basil-leaf", "olive-oil-drops"], 1),
  }),
  dish({
    id: "croque-monsieur",
    name: "Croque-monsieur",
    cuisine: "french",
    region: "France (Paris café)",
    blurb: "A toasted ham and Gruyère sandwich under a creamy sauce.",
    unlock: "confident",
    ingredients: ["bread", "ham", "gruyere", "butter", "cream"],
    tags: ["comforting", "crunchy"],
    steps: steps("C15 S25 Z40 P20"),
    chop: [cut("bread", "slice", 4, 80), cut("ham", "slice", 4, 76)],
    sizzle: sizzle("bread", 2, 3),
    simmer: simmer("figure-eight", 2, 0.46, "#f6ecd2"),
    taste: null,
    plate: plate("croque-toast", null, null, ["salad-leaves", "herb-sprinkle"], 1),
  }),
  dish({
    id: "gratin-dauphinois",
    name: "Gratin dauphinois",
    cuisine: "french",
    region: "France (Dauphiné)",
    blurb: "Thin potato slices baked soft in cream.",
    unlock: "expert",
    ingredients: ["potato", "cream", "garlic", "butter"],
    tags: ["comforting", "hearty"],
    steps: steps("C45 S25 T15 P15"),
    chop: [cut("potato", "slice", 8, 66), cut("garlic", "mince", 2, 100)],
    sizzle: null,
    simmer: simmer("figure-eight", 2, 0.4, "#f6ecd2"),
    taste: taste([2, -2], [0, -2], 1),
    plate: plate("gratin-slice", null, null, ["herb-sprinkle", "salad-leaves"], 1),
  }),
  dish({
    id: "jollof-rice",
    name: "Jollof rice",
    cuisine: "west-african",
    region:
      "West Africa (roots in the Senegambia region; Ghana, Nigeria, Senegal and others each have a style)",
    blurb: "Rice cooked in a rich tomato and pepper sauce. A dish for celebrations.",
    unlock: "learner",
    ingredients: ["long-grain-rice", "tomato", "bell-pepper", "scotch-bonnet", "onion"],
    tags: ["warming", "colourful"],
    steps: steps("C20 S40 T25 P15"),
    chop: [cut("onion", "dice", 4, 72), cut("bell-pepper", "dice", 3, 78)],
    sizzle: null,
    simmer: simmer("circle", 3, 0.38, "#e0612a"),
    taste: taste([-1, -2], [0, 1], 1),
    plate: plate("jollof-mound", null, null, ["pepper-rings", "onion-rings", "herb-sprinkle"], 2),
  }),
  dish({
    id: "kelewele",
    name: "Kelewele",
    cuisine: "west-african",
    region: "Ghana",
    blurb: "Spiced plantain cubes, crisp and golden.",
    unlock: "learner",
    ingredients: ["plantain", "ginger", "fresh-chilli"],
    tags: ["bold", "crunchy"],
    steps: steps("C30 Z40 T15 P15"),
    chop: [cut("plantain", "dice", 4, 70), cut("ginger", "mince", 2, 100)],
    sizzle: sizzle("plantain", 5, 4),
    simmer: null,
    taste: taste([-2, -1], [0, 1], 1),
    plate: plate("kelewele-pile", null, null, ["chilli-rings", "lime-wedge"], 1),
  }),
  dish({
    id: "red-red",
    name: "Red-red",
    cuisine: "west-african",
    region: "Ghana",
    blurb: "Black-eyed beans in a red palm oil stew, with fried plantain.",
    unlock: "confident",
    ingredients: ["black-eyed-beans", "red-palm-oil", "tomato", "onion", "plantain"],
    tags: ["hearty", "comforting"],
    steps: steps("C20 S35 Z20 T15 P10"),
    chop: [cut("onion", "dice", 3, 72), cut("plantain", "slice", 6, 70)],
    sizzle: sizzle("plantain", 3, 3),
    simmer: simmer("zigzag", 3, 0.42, "#c9402a"),
    taste: taste([2, 0], [0, 2], 1),
    plate: plate("red-red-beans", null, null, ["plantain-coins", "onion-rings"], 1),
  }),
  dish({
    id: "poulet-yassa",
    name: "Poulet yassa",
    cuisine: "west-african",
    region: "Senegal",
    blurb: "Chicken with a tangy lemon, onion and mustard sauce.",
    unlock: "expert",
    ingredients: ["chicken", "onion", "lemon", "mustard"],
    tags: ["zesty", "bold"],
    steps: steps("C30 Z25 S20 T15 P10"),
    chop: [cut("onion", "slice", 8, 72), cut("lemon", "slice", 4, 82)],
    sizzle: sizzle("chicken", 4, 4),
    simmer: simmer("figure-eight", 2, 0.4, "#e9c06a"),
    taste: taste([-3, 1], [1, -1], 1),
    plate: plate("yassa-chicken", "rice-bed", "onion-sauce-swoosh", ["lemon-slice", "chilli-rings"], 2),
  }),
];

export type Dish = (typeof DISHES)[number];
export type DishId = Dish["id"];
export const DISH_IDS: readonly DishId[] = DISHES.map((entry) => entry.id);
