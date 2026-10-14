export const COMPONENT_ROLES = ["base", "hero", "sauce", "garnish"] as const;
export type ComponentRole = (typeof COMPONENT_ROLES)[number];

export const GARNISH_COLOURS = ["green", "red", "white", "yellow", "orange", "dark"] as const;
export type GarnishColour = (typeof GARNISH_COLOURS)[number];

export const COMPONENT_ARTS = [
  "bowl",
  "rice-bed",
  "twirl",
  "medley",
  "dumplings",
  "mound",
  "swirl",
  "beads",
  "cubes",
  "rice-balls",
  "roll",
  "topping",
  "dip",
  "cob",
  "spiral",
  "toast",
  "layers",
  "stew",
  "swoosh",
  "dots",
  "drizzle",
  "leaf",
  "shavings",
  "drops",
  "scatter",
  "rings",
  "strip",
  "wedge",
  "fan",
  "coins",
  "sprinkle",
] as const;
export type ComponentArt = (typeof COMPONENT_ARTS)[number];

export interface PlateComponentDef {
  readonly id: string;
  readonly name: string;
  readonly role: ComponentRole;
  readonly width: number;
  readonly height: number;
  readonly art: ComponentArt;
  readonly colour: string;
  readonly colour2: string;
  readonly garnishColour: GarnishColour | null;
}

function part<const I extends string>(
  id: I,
  name: string,
  role: ComponentRole,
  size: readonly [number, number],
  art: ComponentArt,
  colours: readonly [string, string],
  garnishColour: GarnishColour | null = null,
): PlateComponentDef & { readonly id: I } {
  return {
    id,
    name,
    role,
    width: size[0],
    height: size[1],
    art,
    colour: colours[0],
    colour2: colours[1],
    garnishColour,
  };
}

export const PLATE_COMPONENTS = [
  part("tomato-broth-bowl", "Tomato broth", "base", [224, 224], "bowl", ["#d9563a", "#f3efe6"]),
  part("golden-broth-bowl", "Golden broth", "base", [224, 224], "bowl", ["#e8a72e", "#f3efe6"]),
  part("miso-broth-bowl", "Miso broth", "base", [224, 224], "bowl", ["#d9b37a", "#2e3a40"]),
  part("rice-bowl", "Bowl of rice", "base", [216, 216], "bowl", ["#f7f3ea", "#2e5f8a"]),
  part("rice-bed", "Bed of rice", "base", [216, 150], "rice-bed", ["#f6f1e4", "#e3d9c2"]),
  part("spaghetti-twirl", "Spaghetti twirl", "hero", [146, 132], "twirl", ["#f0cf7a", "#d9472b"]),
  part("minestrone-veg", "Minestrone vegetables", "hero", [139, 123], "medley", ["#e8822e", "#4f8a3c"]),
  part("gnocchi-pile", "Gnocchi", "hero", [146, 118], "dumplings", ["#f3dfb0", "#4f9a3c"]),
  part("pumpkin-risotto", "Pumpkin risotto", "hero", [151, 132], "mound", ["#f0a23c", "#fff2c8"]),
  part("dal-swirl", "Dal swirl", "hero", [142, 127], "swirl", ["#f2bf3a", "#b9561c"]),
  part("chana-mound", "Chana masala", "hero", [146, 125], "beads", ["#c98a3a", "#8a3a1c"]),
  part("sambar-veg", "Sambar vegetables", "hero", [139, 123], "medley", ["#6a3a6a", "#e0482f"]),
  part("biryani-dome", "Biryani", "hero", [156, 132], "mound", ["#f6e2a8", "#e8a72e"]),
  part("tofu-cubes", "Tofu cubes", "hero", [132, 113], "cubes", ["#fbf8ef", "#e0d6c0"]),
  part("onigiri-pair", "Onigiri", "hero", [160, 118], "rice-balls", ["#fbf9f2", "#1f3326"]),
  part("tamagoyaki-roll", "Tamagoyaki", "hero", [156, 99], "roll", ["#f6d24a", "#e9b62a"]),
  part("oyako-topping", "Chicken and egg", "hero", [153, 132], "topping", ["#f6d76a", "#d99a5a"]),
  part("guacamole-bowl", "Guacamole", "hero", [144, 132], "dip", ["#8fbf4a", "#5f8f2a"]),
  part("elote-cob", "Elote", "hero", [177, 90], "cob", ["#f4c93a", "#c98a2a"]),
  part("tortilla-soup-top", "Tortilla strips", "hero", [139, 123], "medley", ["#ecc35a", "#4f7a2a"]),
  part("enchilada-rolls", "Enchiladas", "hero", [175, 123], "roll", ["#f2e3b8", "#6fae3c"]),
  part("omelette-fold", "Omelette", "hero", [168, 109], "roll", ["#f8dc6a", "#6aa84f"]),
  part("ratatouille-spiral", "Ratatouille", "hero", [153, 153], "spiral", ["#7a3f8a", "#e0482f"]),
  part("croque-toast", "Croque-monsieur", "hero", [153, 130], "toast", ["#e7b45a", "#f6d77e"]),
  part("gratin-slice", "Gratin slice", "hero", [149, 113], "layers", ["#f4e2b0", "#d79a3a"]),
  part("jollof-mound", "Jollof rice", "hero", [158, 132], "mound", ["#e0612a", "#f6b84a"]),
  part("kelewele-pile", "Kelewele", "hero", [146, 120], "cubes", ["#e9862a", "#b85a1c"]),
  part("red-red-beans", "Red-red", "hero", [149, 127], "beads", ["#c9402a", "#f4ead2"]),
  part("yassa-chicken", "Yassa chicken", "hero", [156, 127], "stew", ["#d99a5a", "#f3dfa0"]),
  part("tomato-swoosh", "Tomato swoosh", "sauce", [175, 47], "swoosh", ["#d9472b", "#f08a6a"]),
  part("pesto-swoosh", "Pesto swoosh", "sauce", [175, 47], "swoosh", ["#4f9a3c", "#8fc46a"]),
  part("masala-swoosh", "Masala swoosh", "sauce", [175, 47], "swoosh", ["#b9561c", "#e8822e"]),
  part("salsa-verde-swoosh", "Salsa verde", "sauce", [175, 47], "swoosh", ["#6fae3c", "#a8d46a"]),
  part("onion-sauce-swoosh", "Onion sauce", "sauce", [175, 47], "swoosh", ["#e9c06a", "#c98a3a"]),
  part("soy-dots", "Soy dots", "sauce", [134, 40], "dots", ["#4a2a1a", "#7a4a2a"]),
  part("crema-drizzle", "Crema drizzle", "sauce", [157, 40], "drizzle", ["#fbf6ea", "#e8dfcc"]),
  part("basil-leaf", "Basil leaf", "garnish", [55, 55], "leaf", ["#3f8f3a", "#6fbf5a"], "green"),
  part("coriander-sprig", "Coriander sprig", "garnish", [55, 55], "leaf", ["#5c9e45", "#8fcf6a"], "green"),
  part("curry-leaf", "Curry leaf", "garnish", [53, 53], "leaf", ["#2f7a3a", "#5fa86a"], "green"),
  part("salad-leaves", "Salad leaves", "garnish", [64, 60], "leaf", ["#7cc04f", "#b8e08a"], "green"),
  part(
    "parmesan-shavings",
    "Parmesan shavings",
    "garnish",
    [57, 51],
    "shavings",
    ["#f2dc9a", "#c9a85a"],
    "yellow",
  ),
  part("olive-oil-drops", "Olive oil drops", "garnish", [60, 46], "drops", ["#b5b33a", "#e6e07a"], "yellow"),
  part("pine-nut-scatter", "Pine nuts", "garnish", [57, 51], "scatter", ["#f1dfb0", "#c8a965"], "white"),
  part("peas-scatter", "Green peas", "garnish", [57, 51], "scatter", ["#7cbf4a", "#4f8a2a"], "green"),
  part("cotija-crumble", "Cotija crumble", "garnish", [57, 51], "scatter", ["#f5eedc", "#d6c9a8"], "white"),
  part("queso-crumble", "Queso fresco", "garnish", [57, 51], "scatter", ["#fbf7ee", "#ddd3bf"], "white"),
  part("chilli-rings", "Chilli rings", "garnish", [55, 51], "rings", ["#d9342b", "#f6d0a0"], "red"),
  part("onion-rings", "Crispy onions", "garnish", [57, 53], "rings", ["#c98a3a", "#f3d79a"], "orange"),
  part("spring-onion-rings", "Spring onion", "garnish", [55, 48], "rings", ["#7cc04f", "#e8f2d8"], "green"),
  part("pepper-rings", "Pepper rings", "garnish", [57, 53], "rings", ["#e0442a", "#f6b0a0"], "red"),
  part("nori-strip", "Nori strip", "garnish", [67, 39], "strip", ["#26402e", "#3f5f48"], "dark"),
  part("lime-wedge", "Lime wedge", "garnish", [55, 46], "wedge", ["#7fb23a", "#e6f2b0"], "green"),
  part("lemon-slice", "Lemon slice", "garnish", [53, 53], "wedge", ["#f3d23f", "#fff6c0"], "yellow"),
  part("totopos-fan", "Totopos", "garnish", [69, 57], "fan", ["#ecc35a", "#c49530"], "yellow"),
  part("avocado-cubes", "Avocado cubes", "garnish", [57, 51], "scatter", ["#9cc85a", "#4f7a2a"], "green"),
  part("plantain-coins", "Plantain coins", "garnish", [62, 53], "coins", ["#f1b83a", "#a8601a"], "orange"),
  part("herb-sprinkle", "Fresh herbs", "garnish", [57, 51], "sprinkle", ["#6aa84f", "#3a6f2a"], "green"),
  part("salmon-flakes", "Salmon flakes", "garnish", [57, 51], "scatter", ["#f08a6a", "#c45a3c"], "orange"),
];

export type ComponentId = (typeof PLATE_COMPONENTS)[number]["id"];
export const COMPONENT_IDS: readonly ComponentId[] = PLATE_COMPONENTS.map((entry) => entry.id);

export const PLATE_COLOURS = ["white", "slate", "sand", "glaze-blue"] as const;
export type PlateColour = (typeof PLATE_COLOURS)[number];
