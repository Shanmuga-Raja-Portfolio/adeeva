import type { StoryBeat } from "../../../engine/story";

export const STORY_TRIGGERS = [
  "intro",
  "first-delivery",
  "first-counter-day",
  "first-week",
  "bankrupt",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, never>;

export const STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "pa-intro",
    trigger: "intro",
    title: "The Keys to Crumb & Comet",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Otti", text: "Forty years I opened this door at six. Your turn now." },
      {
        kind: "spoken",
        speaker: "Otti",
        text: "The oven's old but honest. Watch the colour, not the clock.",
      },
      {
        kind: "player",
        text: "I'll keep the bell on the door ringing.",
        byTrait: {
          dreamer: "I'll fill that window with cakes nobody's dreamed of yet.",
          perfectionist: "I'll learn this oven to the minute.",
          trendsetter: "Larkspur Street won't know what hit it.",
          charmer: "I'll keep the bell ringing and learn every name.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-first-delivery",
    trigger: "first-delivery",
    title: "Down the Street",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Through the window you see your bake carried down the street like treasure.",
      },
      {
        kind: "player",
        text: "I made that!",
        byTrait: {
          dreamer: "It looked like a cloud floating down the street!",
          perfectionist: "I made that. Every gram of it.",
          trendsetter: "Everyone on the street saw that box.",
          charmer: "I made that! I hope they share it.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-first-counter",
    trigger: "first-counter-day",
    title: "Counter Day",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Otti", text: "Counter Day. Trays out, boxes ready, smile on." },
      { kind: "spoken", speaker: "Otti", text: "Whatever's left goes to the neighbours. Nothing wasted." },
      {
        kind: "player",
        text: "Then everyone wins.",
        byTrait: {
          dreamer: "Then every tray is a little gift.",
          perfectionist: "Then I'll count exactly what they love.",
          trendsetter: "Then I'll see what the street picks first.",
          charmer: "Then everyone wins. I'll wrap them nicely.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-first-week",
    trigger: "first-week",
    title: "Rent Day",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Otti", text: "Rent day. Every shop on Larkspur pays it." },
      { kind: "spoken", speaker: "Otti", text: "Short on coins? The café always needs a tray washer." },
      {
        kind: "player",
        text: "Good to know. Back to the oven.",
        byTrait: {
          dreamer: "Good to know. Now, back to my sketches.",
          perfectionist: "Noted. I'll plan next week to the hour.",
          trendsetter: "Good to know. Next week's menu is in my head.",
          charmer: "Good to know. I'll say hi to the café team.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-bankrupt",
    trigger: "bankrupt",
    title: "An Empty Coin Jar",
    repeatable: true,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Rent paid. The coin jar is empty." },
      {
        kind: "player",
        text: "A few café shifts, then back to the oven.",
        byTrait: {
          dreamer: "I'll doodle cakes on the café napkins.",
          perfectionist: "A plan, a few shifts, and we're steady.",
          trendsetter: "Every great bakery has a comeback week.",
          charmer: "Shifts mean new regulars. I can work with that.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-trait-dreamer",
    trigger: "trait-dreamer",
    title: "Sugar Clouds",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "You sketch a cake with a sky inside it." },
      { kind: "spoken", speaker: "Otti", text: "Only a dreamer bakes weather. Keep going." },
    ],
    choices: [],
  },
  {
    id: "pa-trait-perfectionist",
    trigger: "trait-perfectionist",
    title: "To the Gram",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Otti",
        text: "You let go of the scoop just early enough. Who taught you that?",
      },
      { kind: "player", text: "Nobody. I just watched the needle.", byTrait: {} },
    ],
    choices: [],
  },
  {
    id: "pa-trait-trendsetter",
    trigger: "trait-trendsetter",
    title: "Menu Board",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Saffi peers in through the window." },
      {
        kind: "spoken",
        speaker: "Saffi",
        text: "You always know what the town wants next. Let's work together.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-trait-charmer",
    trigger: "trait-charmer",
    title: "Number Nine",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Mr. Bramwell", text: "...You wave at everyone. Even me." },
      { kind: "player", text: "Especially you. The whole street's glad you're here.", byTrait: {} },
    ],
    choices: [],
  },
];
