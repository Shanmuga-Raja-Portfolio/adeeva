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
  "salon-offer",
  "intro-salon",
  "salon-open",
  "first-salon-day",
  "fair-invite",
  "first-showpiece",
  "first-fair-done",
  "gold-ribbon",
  "tent-glasshouse",
  "tent-grand",
  "otti-tea",
  "ribbon-wall",
  "every-hook-gold",
  "client-wren",
  "client-quill",
  "trendsetter-preview",
  "charmer-parlour",
  "parlour-grace",
  "fair-skipped",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryEffect = "open-salon";

export type StoryBeatDef = StoryBeat<StoryTrigger, StoryEffect>;

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
  {
    id: "pa-salon-offer",
    trigger: "salon-offer",
    title: "The Parlour Key",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Otti",
        text: "This key opens the back parlour. Tea and cake, like the old days.",
      },
      { kind: "spoken", speaker: "Otti", text: "The glasshouse fair starts soon, too." },
    ],
    choices: [
      { id: "open", label: "Open the Comet Room", setsFlag: "salon-opened", effect: "open-salon" },
      { id: "later", label: "Not yet", setsFlag: "salon-later", effect: null },
    ],
  },
  {
    id: "pa-intro-salon",
    trigger: "intro-salon",
    title: "Two Rooms, One Oven",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Otti",
        text: "The bakery and the parlour, both yours. I'll pop in for tea.",
      },
      {
        kind: "player",
        text: "Then I'd better put the kettle on.",
        byTrait: {
          dreamer: "I'll make the parlour feel like a storybook.",
          perfectionist: "Every cup and every tier, just so.",
          trendsetter: "The Comet Room is about to be the place to be.",
          charmer: "Then I'd better learn how everyone takes their tea.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-salon-open",
    trigger: "salon-open",
    title: "The Comet Room",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Dust sheets off, lamps on. The Comet Room glows." },
      {
        kind: "player",
        text: "It's perfect. Let's fill it with friends.",
        byTrait: {
          dreamer: "It's like stepping inside a teacup.",
          perfectionist: "Six tables, three tiers. I'll plan every one.",
          trendsetter: "Larkspur's newest favourite spot. I can feel it.",
          charmer: "It's perfect. I'll know every guest by name.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-first-salon-day",
    trigger: "first-salon-day",
    title: "Salon Day",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Otti", text: "Stands up, cups warm, napkins folded." },
      { kind: "spoken", speaker: "Otti", text: "Every table is a small celebration." },
      {
        kind: "player",
        text: "Then let's celebrate.",
        byTrait: {
          dreamer: "Then every stand should look like a little garden.",
          perfectionist: "Then every cup gets poured to the line.",
          trendsetter: "Then let's give them something to talk about.",
          charmer: "Then let's make every table feel like family.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-fair-invite",
    trigger: "fair-invite",
    title: "An Invitation",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Marigold Asante",
        text: "Welcome to the Fair! Bring one showpiece and your best smile.",
      },
      { kind: "spoken", speaker: "Marigold Asante", text: "Every baker goes home with a ribbon." },
    ],
    choices: [],
  },
  {
    id: "pa-first-showpiece",
    trigger: "first-showpiece",
    title: "One Step at a Time",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Otti", text: "Big bakes are just small steps, stacked. One at a time." },
    ],
    choices: [],
  },
  {
    id: "pa-first-fair",
    trigger: "first-fair-done",
    title: "Under the Glass",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The cloche lifts and the glasshouse claps." },
      {
        kind: "player",
        text: "They clapped for my cake!",
        byTrait: {
          dreamer: "It felt like the whole glasshouse was dreaming with me.",
          perfectionist: "Every line held. I'll remember this.",
          trendsetter: "Next season, they'll be queueing to see it.",
          charmer: "Did you see everyone smiling? That's the best ribbon.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "pa-gold-ribbon",
    trigger: "gold-ribbon",
    title: "Gold",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Ruth Fenwick", text: "Steady hands and a happy cake. Gold suits you." },
    ],
    choices: [],
  },
  {
    id: "pa-tent-glasshouse",
    trigger: "tent-glasshouse",
    title: "The Big Hall",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Pell",
        text: "The big hall! Mind the plants, and the sunbeams on your icing.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-tent-grand",
    trigger: "tent-grand",
    title: "The Grand Glasshouse",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Marigold Asante",
        text: "The Grand Glasshouse. Otti showed a cake here, years ago.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-otti-tea",
    trigger: "otti-tea",
    title: "How Otti Takes Tea",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Otti",
        text: "You remembered how I take my tea. The street's lucky to have you.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-ribbon-wall",
    trigger: "ribbon-wall",
    title: "The Ribbon Wall",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Ribbons hang from every season on the wall." },
      {
        kind: "spoken",
        speaker: "Otti",
        text: "Forty years, and I never filled a wall like that. Proud of you.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-every-hook-gold",
    trigger: "every-hook-gold",
    title: "Every Hook Gold",
    repeatable: false,
    lines: [{ kind: "spoken", speaker: "Otti", text: "Every hook gold. I'm framing this." }],
    choices: [],
  },
  {
    id: "pa-trait-dreamer-wren",
    trigger: "client-wren",
    title: "Weather on a Plate",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Paint drips from Wren's sleeves onto the doormat." },
      { kind: "spoken", speaker: "Wren", text: "Paint me a cake that feels like weather." },
    ],
    choices: [],
  },
  {
    id: "pa-trait-perfectionist-quill",
    trigger: "client-quill",
    title: "Exactly So",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "A pocket watch ticks as Mr. Quill steps in." },
      { kind: "spoken", speaker: "Mr. Quill", text: "I like things exactly so. I hear you do too." },
    ],
    choices: [],
  },
  {
    id: "pa-trait-trendsetter-preview",
    trigger: "trendsetter-preview",
    title: "A Step Ahead",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Marigold Asante",
        text: "You've spotted next season's themes already? You're a step ahead.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-trait-charmer-parlour",
    trigger: "charmer-parlour",
    title: "A Parlour Full of Friends",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Otti",
        text: "Half the street asked for you by name. That's a parlour full of friends.",
      },
    ],
    choices: [],
  },
  {
    id: "pa-parlour-grace",
    trigger: "parlour-grace",
    title: "Otti Lends a Hand",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Otti",
        text: "Rent day was tight, so I covered the parlour's part this time. Bake on!",
      },
    ],
    choices: [],
  },
  {
    id: "pa-fair-skipped",
    trigger: "fair-skipped",
    title: "Next Season",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Marigold Asante",
        text: "We missed you at the Fair! We saved your spot for next season.",
      },
    ],
    choices: [],
  },
];
