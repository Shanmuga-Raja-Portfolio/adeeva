import type { AvatarLook } from "../../../engine/avatar";
import type { StoryBeatDef } from "./storyBeat";

export const LANDLADY_NAME = "Mrs. Pell";

export const LANDLADY_LOOK: AvatarLook = {
  skinTone: "porcelain",
  hairStyle: "curly-puff",
  hairColour: "platinum",
  outfit: "blazer",
};

export const BOUTIQUE_LATER_FLAG = "boutique-later";

const MENTOR = "Femi";

export const BOUTIQUE_STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "tf-boutique-offer",
    trigger: "boutique-offer",
    title: "A Shop on Larkspur Row",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR, text: "Mrs. Pell's old sewing shop on Larkspur Row is empty." },
      { kind: "spoken", speaker: LANDLADY_NAME, text: "I'm retiring to my garden at last." },
      {
        kind: "spoken",
        speaker: LANDLADY_NAME,
        text: "The shop needs someone who mends things. I think that's you.",
      },
    ],
    choices: [
      { id: "open", label: "Open the boutique", setsFlag: "boutique-yes", effect: "open-boutique" },
      { id: "later", label: "Not yet, the stall is home", setsFlag: BOUTIQUE_LATER_FLAG, effect: null },
    ],
  },
  {
    id: "tf-boutique-opened",
    trigger: "boutique-opened",
    title: "The New Sign",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The new sign goes up over the door." },
      { kind: "spoken", speaker: LANDLADY_NAME, text: "First week's rent is on me. Welcome." },
      {
        kind: "player",
        text: "I'll fill this window with second chances.",
        byTrait: {
          dreamer: "I'll fill this window with second chances and stories.",
          perfectionist: "Every hem in this shop will be straight. Promise.",
          trendsetter: "Larkspur Row won't know what hit it. In a good way.",
          charmer: "Thank you, Mrs. Pell. Come by for tea any time.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-boutique-intro",
    trigger: "intro-boutique",
    title: "Walls at Last",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR, text: "You've had a stall for years. Now you've got walls!" },
      { kind: "spoken", speaker: MENTOR, text: "Same rule as ever: everything had a life before." },
      {
        kind: "player",
        text: "And it gets another one here.",
        byTrait: {
          dreamer: "And here it gets a whole new chapter.",
          perfectionist: "And here it gets another one, done properly.",
          trendsetter: "And here it gets the best window on the row.",
          charmer: "And here, everyone gets a cup of tea too.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-first-mend",
    trigger: "first-mend",
    title: "Good as New",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Nana Bea", text: "I thought this old blazer was done for." },
      {
        kind: "player",
        text: "Not while I've got thread.",
        byTrait: {
          dreamer: "Not while I've got thread and a few daydreams.",
          perfectionist: "Not while I've got thread. Tiny, even stitches.",
          trendsetter: "Not while I've got thread. Mending is the new new.",
          charmer: "Not while I've got thread, Nana Bea.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-first-window",
    trigger: "first-window",
    title: "The Window",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR, text: "A window is a promise. Show them what's inside." },
      {
        kind: "player",
        text: "Then the best pieces go up front.",
        byTrait: {
          dreamer: "Then the window gets to tell a little story.",
          perfectionist: "Then the best pieces go up front, lined up just so.",
          trendsetter: "Then the boldest pieces go up front.",
          charmer: "Then the friendliest pieces go up front.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-first-till-day",
    trigger: "first-till-day",
    title: "Till Day",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: LANDLADY_NAME, text: "The bell's been ringing all morning." },
      { kind: "spoken", speaker: MENTOR, text: "Fair prices, same as the stall." },
      {
        kind: "player",
        text: "Always.",
        byTrait: {
          dreamer: "Always. Every tag gets a tiny story too.",
          perfectionist: "Always. I've checked every tag twice.",
          trendsetter: "Always. Fair and fresh.",
          charmer: "Always. Hello to everyone who rings the bell!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-swap-and-mend",
    trigger: "swap-day",
    title: "Swap & Mend",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Tables, tea and a queue of loved things." },
      { kind: "spoken", speaker: MENTOR, text: "No coins today. Just fixing and swapping." },
      {
        kind: "player",
        text: "Best kind of day.",
        byTrait: {
          dreamer: "Best kind of day. Every table has a story.",
          perfectionist: "Best kind of day. Small fixes, done well.",
          trendsetter: "Best kind of day. Everyone leaves with something new to them.",
          charmer: "Best kind of day. I'll pour the tea.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-showcase-invite",
    trigger: "season-start",
    title: "The Upcycle Showcase",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: LANDLADY_NAME,
        text: "End of each season, the hall holds an Upcycle Showcase.",
      },
      {
        kind: "spoken",
        speaker: LANDLADY_NAME,
        text: "Up to three pieces, one theme. Everyone gets a rosette.",
      },
      {
        kind: "player",
        text: "I'll start my show shelf.",
        byTrait: {
          dreamer: "I'll start my show shelf. I can already picture it.",
          perfectionist: "I'll start my show shelf with my neatest work.",
          trendsetter: "I'll start my show shelf. Watch this space.",
          charmer: "I'll start my show shelf. Will you come and watch?",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-showcase-done",
    trigger: "showcase-done",
    title: "Applause in the Hall",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The hall claps for every piece." },
      { kind: "spoken", speaker: MENTOR, text: "You told the story of each thing. That's the craft." },
      {
        kind: "player",
        text: "Next season, even braver.",
        byTrait: {
          dreamer: "Next season, even dreamier.",
          perfectionist: "Next season, even neater.",
          trendsetter: "Next season, even braver.",
          charmer: "Next season, the whole row comes along.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-season-turn",
    trigger: "season-turn",
    title: "A New Season",
    repeatable: true,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "A new season on Larkspur Row." },
      { kind: "spoken", speaker: LANDLADY_NAME, text: "New theme on the hall noticeboard." },
    ],
    choices: [],
  },
  {
    id: "tf-kept-50",
    trigger: "kept-50",
    title: "Fifty Saved",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR, text: "Fifty things still in use because of you." },
      {
        kind: "player",
        text: "Fifty stories still going.",
        byTrait: {
          dreamer: "Fifty stories still going. And counting.",
          perfectionist: "Fifty, and every one finished properly.",
          trendsetter: "Fifty! Let's make it a hundred.",
          charmer: "Fifty neighbours with something they love back.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-kept-100",
    trigger: "kept-100",
    title: "A Hundred Saved",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Mrs. Pell hangs a hand-stitched banner over the till." },
      {
        kind: "player",
        text: "Let's make it two hundred.",
        byTrait: {
          dreamer: "Let's make it two hundred stories.",
          perfectionist: "Two hundred next. One neat stitch at a time.",
          trendsetter: "Let's make it two hundred.",
          charmer: "Let's make it two hundred, together.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "tf-trait-zuri",
    trigger: "boutique-trendsetter",
    title: "Cover Story",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Zuri", text: "Our zine wants the bravest skirt on Larkspur Row." },
      { kind: "player", text: "Then I'd better make it.", byTrait: {} },
    ],
    choices: [],
  },
  {
    id: "tf-trait-ferreira",
    trigger: "boutique-charmer",
    title: "Every Name",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Mrs. Ferreira", text: "You remember every regular. So do I." },
      { kind: "player", text: "Then we'll get on just fine.", byTrait: {} },
    ],
    choices: [],
  },
];
