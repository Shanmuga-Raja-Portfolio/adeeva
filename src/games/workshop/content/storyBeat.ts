import type { StoryBeat } from "../../../engine/story";

export const STORY_TRIGGERS = [
  "intro",
  "first-delivery",
  "first-week",
  "bankrupt",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, never>;

export const BEAT_BUZZ: Readonly<Record<string, number>> = { "ww-charmer": 2 };

export const STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "ww-key",
    trigger: "intro",
    title: "Sawdust and Sunlight",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Morning sun pours through the open garage door on Larkspur Road.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Here's the key. Goggles on, ideas out. Rent is due each week, mind.",
      },
      {
        kind: "player",
        text: "I'll make this garage smell of fresh sawdust every day.",
        byTrait: {
          dreamer: "I can already see a hundred things I want to build in here.",
          perfectionist: "I'll keep every line straight and every joint snug.",
          trendsetter: "Soon the whole road will want a piece from this garage.",
          charmer: "I'll put the kettle on and learn every neighbour's name.",
        },
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Look, your first note is already pinned to the door.",
      },
    ],
    choices: [],
  },
  {
    id: "ww-first-delivery",
    trigger: "first-delivery",
    title: "First Coat",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "You watch your first piece leave the garage." },
      { kind: "spoken", speaker: "Uncle Bram", text: "Now it's part of someone's home." },
      {
        kind: "player",
        text: "I made that, from plain boards!",
        byTrait: {
          dreamer: "It was just a doodle on Monday. Now it's real!",
          perfectionist: "Every joint held. I checked twice.",
          trendsetter: "Wait till the neighbours see that.",
          charmer: "I hope they invite me over to see it in place!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-first-week",
    trigger: "first-week",
    title: "Rent and Rafters",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Uncle Bram drops by with two mugs of cocoa.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Rent's in the tin, thank you. Now, have you seen this upgrade catalogue?",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Sturdy sawhorses, a clamp rack, a skylight. Save up, and the garage grows with you.",
      },
      {
        kind: "player",
        text: "One week down. Lots more to build.",
        byTrait: {
          dreamer: "A skylight! I could build under the stars.",
          perfectionist: "A clamp rack would make my joints even tighter.",
          trendsetter: "Next week, bigger orders. I can feel it.",
          charmer: "Same time next week? I'll bring the biscuits.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-dreamer",
    trigger: "trait-dreamer",
    title: "Blueprints at Bedtime",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Late at night you sketch a stool shaped like a crescent moon.",
      },
      {
        kind: "spoken",
        speaker: "Luna",
        text: "I saw your moon doodle in the garage window. Could you make me something starry?",
      },
      {
        kind: "player",
        text: "A piece of the night sky? I'd love to.",
        byTrait: { dreamer: "A piece of the night sky? That's exactly my kind of job." },
      },
    ],
    choices: [],
  },
  {
    id: "ww-perfectionist",
    trigger: "trait-perfectionist",
    title: "A Hair's Width",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Lindqvist",
        text: "See this tiny clock gear? Every tooth fits just so.",
      },
      {
        kind: "spoken",
        speaker: "Mr. Lindqvist",
        text: "Are your joints that true? I have a job for careful hands.",
      },
      {
        kind: "player",
        text: "I'll take my time and make every joint snug.",
        byTrait: { perfectionist: "Snug as a clock gear. I promise." },
      },
    ],
    choices: [],
  },
  {
    id: "ww-trendsetter",
    trigger: "trait-trendsetter",
    title: "Window Shopping",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "On a walk down Larkspur Road you notice what the neighbours are starting to like.",
      },
      {
        kind: "player",
        text: "I'll chalk next week's favourites on the board right now.",
        byTrait: { trendsetter: "Got it. Next week's favourites go on the chalkboard today." },
      },
    ],
    choices: [],
  },
  {
    id: "ww-charmer",
    trigger: "trait-charmer",
    title: "Tea on the Workbench",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Neighbours drop by the open garage door to chat.",
      },
      {
        kind: "spoken",
        speaker: "Grandpa Teodor",
        text: "I've told three friends about you. Expect some notes on the door!",
      },
      {
        kind: "player",
        text: "Thank you! Mind the sawdust, and have a biscuit.",
        byTrait: { charmer: "More tea, anyone? There's always room on the workbench." },
      },
    ],
    choices: [],
  },
  {
    id: "ww-lean-week",
    trigger: "bankrupt",
    title: "A Lean Week",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Every maker has a lean week. No shame in it.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Pell's yard needs a sweeper. That's thirty coins for a day.",
      },
      {
        kind: "player",
        text: "I'll sweep, save up and keep building.",
        byTrait: {
          dreamer: "Sweeping is a good time for daydreams anyway.",
          perfectionist: "I'll make that yard spotless.",
          trendsetter: "Every big maker started with a broom.",
          charmer: "I'll meet everyone at the yard while I'm at it.",
        },
      },
    ],
    choices: [],
  },
];
