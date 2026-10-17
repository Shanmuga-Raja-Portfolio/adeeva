import type { ClientLines, PersonDef } from "./client";

const COPY_LINES: ClientLines = {
  request: "Could you make one more like the one in your window?",
  delighted: "It's just like the one in the window. We love it!",
  nearMiss: "It's lovely, thank you! It's a little different from the window one.",
};

export const POPUP_VISITORS: readonly PersonDef[] = [
  {
    id: "mrs-lune",
    name: "Mrs. Lune and her son Theo",
    relation: "Stopped by your Pop-up Window",
    look: { skinTone: "peach", hairStyle: "long-waves", hairColour: "blonde", outfit: "cardigan" },
    scene: "kitchen",
    avoidNote: "",
    lines: COPY_LINES,
  },
  {
    id: "mr-castell",
    name: "Mr. Castell",
    relation: "Mends umbrellas by the arcade gate",
    look: { skinTone: "amber", hairStyle: "short-bob", hairColour: "brown", outfit: "blazer" },
    scene: "shop",
    avoidNote: "",
    lines: COPY_LINES,
  },
  {
    id: "ms-oduya",
    name: "Ms. Oduya",
    relation: "Teaches pottery on Thursdays",
    look: { skinTone: "espresso", hairStyle: "locs", hairColour: "black", outfit: "dungarees" },
    scene: "shop",
    avoidNote: "",
    lines: COPY_LINES,
  },
  {
    id: "the-whitlocks",
    name: "Mr. and Mrs. Whitlock",
    relation: "Run the tea shop at the corner",
    look: { skinTone: "porcelain", hairStyle: "high-bun", hairColour: "platinum", outfit: "cardigan" },
    scene: "kitchen",
    avoidNote: "",
    lines: COPY_LINES,
  },
  {
    id: "mr-haddad",
    name: "Mr. Haddad and his daughter Lina",
    relation: "Strolled past the Pop-up Window",
    look: { skinTone: "honey", hairStyle: "pixie", hairColour: "dark-brown", outfit: "denim-jacket" },
    scene: "garden",
    avoidNote: "",
    lines: COPY_LINES,
  },
  {
    id: "ms-varga",
    name: "Ms. Varga",
    relation: "Plays cello in the town orchestra",
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "auburn", outfit: "blazer" },
    scene: "foyer",
    avoidNote: "",
    lines: COPY_LINES,
  },
];
