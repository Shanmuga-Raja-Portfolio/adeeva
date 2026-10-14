import type { AvatarLook } from "../../../engine/avatar";
import { requireById } from "../../../engine/catalog";
import type { StoryBeat } from "../../../engine/story";
import { STORY_BEATS as SHARED_BEATS } from "../../adeeva/content/storyBeat";

export const STORY_TRIGGERS = [
  "intro",
  "first-delivery",
  "first-stall-day",
  "first-week",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
  "ten-flips",
  "bankrupt",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, never>;

export const MENTOR_NAME = "Femi";

export const MENTOR_LOOK: AvatarLook = {
  skinTone: "cocoa",
  hairStyle: "short-bob",
  hairColour: "platinum",
  outfit: "cardigan",
};

const tightWeek = requireById(SHARED_BEATS, "tight-week", "story beat");

export const STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "tf-intro",
    trigger: "intro",
    title: "The Striped Stall",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR_NAME, text: "This stall was mine for twenty years. Now it's yours." },
      { kind: "spoken", speaker: MENTOR_NAME, text: "Everything here had a life before. Give it another." },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Take my scrap tin too. Every scrap is a patch waiting.",
      },
      {
        kind: "player",
        text: "I won't let a single button go to waste.",
        byTrait: {
          dreamer: "I can already see it: a whole rail of second lives.",
          perfectionist: "Every seam neat, every button saved. Promise.",
          trendsetter: "By next week, everyone will want a flip from this stall.",
          charmer: "Thank you, Femi. I'll keep the kettle on for the regulars.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-first-delivery",
    trigger: "first-delivery",
    title: "Walking Past",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Your first flip walks past the stall on its new owner." },
      {
        kind: "player",
        text: "That was a curtain last week!",
        byTrait: {
          dreamer: "Last week it was a tired old thing. Look at it now!",
          perfectionist: "The seams held. Every single one.",
          trendsetter: "First flip out in the wild. More coming soon.",
          charmer: "They waved at me! I'm going to cry a bit.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-first-stall-day",
    trigger: "first-stall-day",
    title: "Stall Day",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR_NAME, text: "Awning up, tags out. Today the rack does the talking." },
      { kind: "spoken", speaker: MENTOR_NAME, text: "Fair prices bring people back." },
      {
        kind: "player",
        text: "Then fair it is.",
        byTrait: {
          dreamer: "Fair prices, and every piece gets a little story tag.",
          perfectionist: "Fair it is. I'll check every tag twice.",
          trendsetter: "Fair prices and the freshest rack in the lane.",
          charmer: "Fair it is. And a smile for everyone who stops by.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-first-week",
    trigger: "first-week",
    title: "Rent Day",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR_NAME, text: "Stall rent day. Every stall pays it." },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "If the till is ever thin, the swap shop needs sorters.",
      },
      {
        kind: "player",
        text: "Good to know. I'll keep flipping.",
        byTrait: {
          dreamer: "Good to know. My head is full of ideas anyway.",
          perfectionist: "Good to know. I'll plan the week properly.",
          trendsetter: "Good to know. This week is going to be big.",
          charmer: "Good to know. I'll say hello at the swap shop too.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-trait-dreamer",
    trigger: "trait-dreamer",
    title: "The Scrap Box",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "You lay leftovers side by side until they sing." },
      {
        kind: "spoken",
        speaker: "Marisol",
        text: "Now that's a colour story. Call me when you've got time.",
      },
    ],
    choices: [],
  },
  {
    id: "tf-trait-perfectionist",
    trigger: "trait-perfectionist",
    title: "Straight and True",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Halvorsen",
        text: "Small pulls, steady hands. You've done this before.",
      },
      {
        kind: "player",
        text: "Only in my head, a hundred times.",
        byTrait: {},
      },
    ],
    choices: [],
  },
  {
    id: "tf-trait-trendsetter",
    trigger: "trait-trendsetter",
    title: "Rail Whispers",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Shopper", text: "Has anyone got hats like that?" },
      {
        kind: "player",
        text: "Not yet. By next week, I will.",
        byTrait: {},
      },
    ],
    choices: [],
  },
  {
    id: "tf-trait-charmer",
    trigger: "trait-charmer",
    title: "Regulars",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Same faces every Stall Day. That's your fair prices working.",
      },
      {
        kind: "player",
        text: "Regulars come back. I like that.",
        byTrait: {},
      },
    ],
    choices: [],
  },
  {
    id: "tf-rack-of-ten",
    trigger: "ten-flips",
    title: "Ten Rescued",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Ten things that nearly got thrown out. Here's a rosette for the awning.",
      },
      {
        kind: "player",
        text: "And ten that didn't.",
        byTrait: {
          dreamer: "And ten that got a whole new story.",
          perfectionist: "And ten that didn't. Every one finished properly.",
          trendsetter: "And ten that didn't. Next stop, twenty.",
          charmer: "And ten new friends wearing them.",
        },
      },
    ],
    choices: [],
  },
  { ...tightWeek, trigger: "bankrupt", choices: [] },
];
