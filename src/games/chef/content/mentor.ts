import type { AvatarLook } from "../../../engine/avatar";
import type { CuisineId } from "./cuisine";

export interface MentorDef {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly cuisine: CuisineId;
  readonly teaches: string;
  readonly value: string;
  readonly firstLine: string;
  readonly passLine: string;
  readonly nearMissLine: string;
  readonly look: AvatarLook;
}

export const MENTORS: readonly MentorDef[] = [
  {
    id: "lucia-ferrante",
    name: "Chef Lucia Ferrante",
    shortName: "Lucia",
    cuisine: "italian",
    teaches: "Simple sauces: few ingredients, done well.",
    value: "Patience",
    firstLine: "Good tomatoes, patience, and a taste at the end. That's the secret.",
    passLine: "Simple and good. You let the tomatoes do the talking.",
    nearMissLine: "Nearly there. Next time, taste once more before the plate.",
    look: { skinTone: "peach", hairStyle: "high-bun", hairColour: "dark-brown", outfit: "studio-apron" },
  },
  {
    id: "arjun-mehra",
    name: "Chef Arjun Mehra",
    shortName: "Arjun",
    cuisine: "indian",
    teaches: "Tempering spices and building layers of flavour.",
    value: "Listening",
    firstLine: "Listen to the cumin. When it crackles, it's ready.",
    passLine: "Layer on layer. I can taste that you listened.",
    nearMissLine: "Good start. Let each layer settle before the next one.",
    look: { skinTone: "chestnut", hairStyle: "pixie", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "haruka-moriyama",
    name: "Chef Haruka Moriyama",
    shortName: "Haruka",
    cuisine: "japanese",
    teaches: "Rice, stock and cooking with the seasons.",
    value: "Care",
    firstLine: "Rice first. Everything else can wait for the rice.",
    passLine: "Calm hands, clean flavours. Well done.",
    nearMissLine: "Slow down a little. Calm is faster in the end.",
    look: { skinTone: "sand", hairStyle: "ponytail", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "rafael-quintero",
    name: "Chef Rafael Quintero",
    shortName: "Rafael",
    cuisine: "mexican",
    teaches: "Fresh salsas and toasting on the comal.",
    value: "Tasting",
    firstLine: "Taste it. Now taste it again with lime. See?",
    passLine: "Bright and fresh! That's how it should sing.",
    nearMissLine: "So close. One more taste would have found it.",
    look: { skinTone: "amber", hairStyle: "curly-puff", hairColour: "dark-brown", outfit: "studio-apron" },
  },
  {
    id: "bastien-laurier",
    name: "Chef Bastien Laurier",
    shortName: "Bastien",
    cuisine: "french",
    teaches: "Eggs, butter and neatness.",
    value: "Neatness",
    firstLine: "A clean plate rim is a kind word to your guest.",
    passLine: "Neat, soft and golden. Très bien.",
    nearMissLine: "Good work. Wipe the rim and it will shine.",
    look: { skinTone: "porcelain", hairStyle: "pixie", hairColour: "auburn", outfit: "studio-apron" },
  },
  {
    id: "efua-mensah",
    name: "Chef Efua Mensah",
    shortName: "Efua",
    cuisine: "west-african",
    teaches: "Slow-cooked stews and rice, with heat that warms and doesn't hurt.",
    value: "Celebration",
    firstLine: "Jollof is a celebration. We cook it like one.",
    passLine: "That pot is full of joy. I can taste it.",
    nearMissLine: "Lovely! Give the pot a little more love next time.",
    look: { skinTone: "espresso", hairStyle: "braids", hairColour: "black", outfit: "studio-apron" },
  },
];
