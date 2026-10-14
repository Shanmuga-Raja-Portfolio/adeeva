export const INGREDIENT_SHAPES = [
  "bulb",
  "root",
  "round",
  "chilli",
  "leaf",
  "block",
  "bottle",
  "grain",
  "powder",
  "pasta",
  "egg",
  "drumstick",
  "sheet",
  "cob",
  "long",
  "pepper",
  "jar",
] as const;
export type IngredientShape = (typeof INGREDIENT_SHAPES)[number];

export const INGREDIENT_GROUPS = [
  "shared",
  "italian",
  "indian",
  "japanese",
  "mexican",
  "french",
  "west-african",
] as const;
export type IngredientGroup = (typeof INGREDIENT_GROUPS)[number];

export interface IngredientDef {
  readonly id: string;
  readonly name: string;
  readonly group: IngredientGroup;
  readonly costTenths: number;
  readonly shape: IngredientShape;
  readonly colour: string;
  readonly accent: string;
}

function ingredient<const I extends string>(
  id: I,
  name: string,
  group: IngredientGroup,
  costTenths: number,
  shape: IngredientShape,
  colour: string,
  accent: string,
): IngredientDef & { readonly id: I } {
  return { id, name, group, costTenths, shape, colour, accent };
}

export const INGREDIENTS = [
  ingredient("onion", "Onion", "shared", 3, "bulb", "#e9c38a", "#b7743c"),
  ingredient("garlic", "Garlic", "shared", 2, "bulb", "#f4ecdc", "#c9b48f"),
  ingredient("ginger", "Ginger", "shared", 3, "root", "#d8ad6a", "#a0743a"),
  ingredient("tomato", "Tomato", "shared", 4, "round", "#e0482f", "#4f8a3c"),
  ingredient("fresh-chilli", "Fresh chilli", "shared", 2, "chilli", "#d9342b", "#4f8a3c"),
  ingredient("lime", "Lime", "shared", 3, "round", "#7fb23a", "#4f7a22"),
  ingredient("lemon", "Lemon", "shared", 3, "round", "#f3d23f", "#c9a227"),
  ingredient("coriander-leaf", "Coriander", "shared", 2, "leaf", "#5c9e45", "#2f6b2a"),
  ingredient("butter", "Butter", "shared", 4, "block", "#f6dd7a", "#d1b04c"),
  ingredient("eggs", "Eggs", "shared", 5, "egg", "#f4e6cf", "#d9b98a"),
  ingredient("chicken", "Chicken", "shared", 16, "drumstick", "#e9b48c", "#b97a4c"),
  ingredient("olive-oil", "Olive oil", "shared", 3, "bottle", "#b5b33a", "#6f7a1f"),
  ingredient("spaghetti", "Spaghetti", "italian", 5, "pasta", "#f0d48a", "#c9a24c"),
  ingredient("arborio-rice", "Arborio rice", "italian", 6, "grain", "#f5efe0", "#cfc3a4"),
  ingredient("pumpkin", "Pumpkin", "italian", 6, "round", "#e8822e", "#5c7a2a"),
  ingredient("parmesan", "Parmesan", "italian", 8, "block", "#f2dc9a", "#c9a85a"),
  ingredient("basil", "Basil", "italian", 3, "leaf", "#3f8f3a", "#1f5c22"),
  ingredient("potato", "Potato", "italian", 3, "root", "#d9b27a", "#9c7340"),
  ingredient("pine-nuts", "Pine nuts", "italian", 9, "grain", "#f1dfb0", "#c8a965"),
  ingredient("cannellini-beans", "Cannellini beans", "italian", 4, "grain", "#f4ecdc", "#cbbd9c"),
  ingredient("toor-dal", "Toor dal", "indian", 4, "grain", "#f0c24a", "#c99420"),
  ingredient("chickpeas", "Chickpeas", "indian", 4, "grain", "#e5c08a", "#b48a4c"),
  ingredient("tamarind", "Tamarind", "indian", 3, "jar", "#7a4a2a", "#4f2c16"),
  ingredient("curry-leaves", "Curry leaves", "indian", 2, "leaf", "#2f7a3a", "#174f22"),
  ingredient("green-peas", "Green peas", "indian", 3, "grain", "#7cbf4a", "#4f8a2a"),
  ingredient("basmati-rice", "Basmati rice", "indian", 5, "grain", "#f7f1e2", "#d4c8a8"),
  ingredient("cumin-seeds", "Cumin seeds", "indian", 2, "grain", "#a07a4a", "#6b4f2a"),
  ingredient("garam-masala", "Garam masala", "indian", 2, "powder", "#8a5a34", "#5a361c"),
  ingredient("turmeric", "Turmeric", "indian", 1, "powder", "#f0b21e", "#c08410"),
  ingredient("ghee", "Ghee", "indian", 4, "jar", "#f3d47a", "#c9a24a"),
  ingredient("short-grain-rice", "Short-grain rice", "japanese", 5, "grain", "#f8f5ec", "#d6cfbc"),
  ingredient("nori", "Nori", "japanese", 3, "sheet", "#26402e", "#122218"),
  ingredient("miso", "Miso", "japanese", 4, "jar", "#c99a5a", "#8a6230"),
  ingredient("dashi", "Dashi", "japanese", 3, "bottle", "#e2c58a", "#a8864a"),
  ingredient("tofu", "Tofu", "japanese", 6, "block", "#f8f4ea", "#d6cdb8"),
  ingredient("soy-sauce", "Soy sauce", "japanese", 2, "bottle", "#4a2a1a", "#2a160c"),
  ingredient("spring-onion", "Spring onion", "japanese", 2, "long", "#7cc04f", "#e8f2d8"),
  ingredient("salmon-flakes", "Salmon flakes", "japanese", 14, "jar", "#f08a6a", "#c45a3c"),
  ingredient("corn-tortillas", "Corn tortillas", "mexican", 5, "sheet", "#ecc35a", "#c49530"),
  ingredient("tomatillo", "Tomatillo", "mexican", 5, "round", "#9ccc5a", "#5c8a2a"),
  ingredient("avocado", "Avocado", "mexican", 9, "round", "#4f7a2a", "#c9d97a"),
  ingredient("corn-cob", "Corn cob", "mexican", 5, "cob", "#f2cc3c", "#8fb04a"),
  ingredient("queso-fresco", "Queso fresco", "mexican", 8, "block", "#fbf7ee", "#ddd3bf"),
  ingredient("queso-cotija", "Queso cotija", "mexican", 8, "block", "#f5eedc", "#d6c9a8"),
  ingredient("crema", "Crema", "mexican", 5, "bottle", "#fbf6ea", "#ddd2bc"),
  ingredient("ancho-chilli", "Ancho chilli", "mexican", 3, "chilli", "#6a2420", "#3a120e"),
  ingredient("aubergine", "Aubergine", "french", 5, "long", "#5a2f6a", "#3f7a2a"),
  ingredient("courgette", "Courgette", "french", 4, "long", "#4f8a3c", "#c9df9a"),
  ingredient("bell-pepper", "Bell pepper", "french", 4, "pepper", "#e0442a", "#4f8a3c"),
  ingredient("cream", "Cream", "french", 5, "bottle", "#fdf9f0", "#e2d8c2"),
  ingredient("gruyere", "Gruyère", "french", 10, "block", "#f3d77e", "#c9a54a"),
  ingredient("bread", "Bread", "french", 3, "block", "#e2b06a", "#a8702e"),
  ingredient("ham", "Ham", "french", 10, "block", "#f0a3a0", "#c46a6a"),
  ingredient("fines-herbes", "Fines herbes", "french", 3, "leaf", "#6aa84f", "#3a6f2a"),
  ingredient("long-grain-rice", "Long-grain rice", "west-african", 4, "grain", "#f6f0e0", "#d2c6a8"),
  ingredient("scotch-bonnet", "Scotch bonnet", "west-african", 2, "pepper", "#f08a1e", "#4f8a3c"),
  ingredient("plantain", "Plantain", "west-african", 6, "long", "#f1c43a", "#6a4a1a"),
  ingredient("black-eyed-beans", "Black-eyed beans", "west-african", 4, "grain", "#efe6d2", "#2a1d14"),
  ingredient("red-palm-oil", "Red palm oil", "west-african", 4, "bottle", "#d8452a", "#9a2a14"),
  ingredient("mustard", "Mustard", "west-african", 2, "jar", "#e3b52a", "#a8801a"),
];

export type IngredientId = (typeof INGREDIENTS)[number]["id"];
export const INGREDIENT_IDS: readonly IngredientId[] = INGREDIENTS.map((entry) => entry.id);
