import type { AvatarLook } from "../../../engine/avatar";
import type { StoryBeat } from "../../../engine/story";

export const STORY_TRIGGERS = [
  "intro",
  "first-delivery",
  "first-market-day",
  "first-week",
  "bankrupt",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, never>;

export const MENTOR_NAME = "Mr. Osei";
export const MENTOR_LOOK: AvatarLook = {
  skinTone: "cocoa",
  hairStyle: "pixie",
  hairColour: "platinum",
  outfit: "studio-apron",
};

export const BEAT_BUZZ: Readonly<Record<string, number>> = { "jb-charmer": 2 };

export const STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "jb-key",
    trigger: "intro",
    title: "Lanterns On",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The lanterns of Thimble Lane Arcade blink on, one by one.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Here's the key to the Lantern Bench. Steady hands, big ideas.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Gran Mina's order tag is already pinned up. She's a dear.",
      },
      {
        kind: "player",
        text: "I'll make her something lovely.",
        byTrait: {
          dreamer: "I can already see it: a little moon of a pendant.",
          perfectionist: "I'll make every edge exact. Promise.",
          trendsetter: "This bench is going to be the talk of the arcade.",
          charmer: "I'll make it, and stay for tea when I deliver it!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-delivery",
    trigger: "first-delivery",
    title: "The Little Box",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "You tie the ribbon on your very first gift box.",
      },
      { kind: "spoken", speaker: MENTOR_NAME, text: "Now it's part of someone's story." },
      {
        kind: "player",
        text: "I made that, start to finish.",
        byTrait: {
          dreamer: "It's carrying a little bit of my daydream with it.",
          perfectionist: "Every claw was snug. I checked twice.",
          trendsetter: "Wait until the arcade sees it.",
          charmer: "I hope they wave at me from across the arcade!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-market",
    trigger: "first-market-day",
    title: "Market Morning",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The arcade fills with lanterns, music and strolling shoppers.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "It's Market Day! Set out up to three pieces on your stall tray.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Rent is due tonight. The upgrade catalogue is on my counter, too.",
      },
      {
        kind: "player",
        text: "Time to make my tray shine.",
        byTrait: {
          dreamer: "I'll set them out like a little night sky.",
          perfectionist: "Centre piece first. Then everything lined up.",
          trendsetter: "I know exactly what they'll want to see.",
          charmer: "I'll say hello to every single shopper.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-dreamer",
    trigger: "trait-dreamer",
    title: "Moon in a Teacup",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Late at night, you sketch a crescent moon pendant by lamplight.",
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Next morning, a note is pinned to your bench. It's from Juniper.",
      },
      { kind: "spoken", speaker: "Juniper", text: "I heard you make tiny pieces of the night sky." },
      {
        kind: "player",
        text: "I think I do!",
        byTrait: { dreamer: "The moon has been waiting for someone to ask." },
      },
    ],
    choices: [],
  },
  {
    id: "jb-perfectionist",
    trigger: "trait-perfectionist",
    title: "True as a Lens",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Farouk",
        text: "This lens took me a month. Every curve is exact.",
      },
      { kind: "spoken", speaker: "Mr. Farouk", text: "Could your claws be that exact?" },
      {
        kind: "player",
        text: "Let's find out.",
        byTrait: { perfectionist: "Bring me the order. I'll measure twice and cut once." },
      },
    ],
    choices: [],
  },
  {
    id: "jb-trendsetter",
    trigger: "trait-trendsetter",
    title: "Window Glints",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Walking the arcade, you notice which windows shoppers stop at.",
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Next week's favourites now appear early on your chalkboard.",
      },
      {
        kind: "player",
        text: "I can see what's coming.",
        byTrait: { trendsetter: "Next week's favourites, chalked up early. Perfect." },
      },
    ],
    choices: [],
  },
  {
    id: "jb-charmer",
    trigger: "trait-charmer",
    title: "Tea at the Stall",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The other stallholders stop by with tea and biscuits.",
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "One of them tells three friends about your bench. Your buzz grows by 2.",
      },
      {
        kind: "player",
        text: "Thank you, everyone!",
        byTrait: { charmer: "Come back any time. The kettle's always on!" },
      },
    ],
    choices: [],
  },
  {
    id: "jb-lean-week",
    trigger: "bankrupt",
    title: "A Quiet Week",
    repeatable: true,
    lines: [
      { kind: "spoken", speaker: MENTOR_NAME, text: "Every maker has a quiet week. Don't worry." },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "The Bead Barn needs a sorter. A day there fills the coin jar.",
      },
      {
        kind: "player",
        text: "I'll sort some beads and keep going.",
        byTrait: {
          dreamer: "Beads are just tiny stars in jars, really.",
          perfectionist: "I'll sort them by colour and by size.",
          trendsetter: "Quiet weeks don't last. Next week is mine.",
          charmer: "I'll make friends at the Bead Barn too.",
        },
      },
    ],
    choices: [],
  },
];
