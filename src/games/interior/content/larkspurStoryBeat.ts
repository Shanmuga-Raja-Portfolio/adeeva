import type { AvatarLook } from "../../../engine/avatar";
import type { StoryBeatDef } from "./storyBeat";

export const BUILDER_NAME = "Ms. Achebe";
export const BUILDER_LOOK: AvatarLook = {
  skinTone: "amber",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "blazer",
};

export const LARKSPUR_LATER_FLAG = "larkspur-later";
export const CREW_SPEAKER = "Your crew";

const VALE = "Ms. Vale";

export const LARKSPUR_STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "is-larkspur-offer",
    trigger: "larkspur-offer",
    title: "Six Front Doors",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Ms. Achebe walks you down a brand-new street of six front doors.",
      },
      { kind: "spoken", speaker: BUILDER_NAME, text: "Six new homes, all empty and waiting." },
      { kind: "spoken", speaker: BUILDER_NAME, text: "Will you make them feel like home?" },
    ],
    choices: [
      { id: "take-keys", label: "Take the keys", setsFlag: "larkspur-yes", effect: "open-larkspur" },
      { id: "not-yet", label: "Not yet", setsFlag: LARKSPUR_LATER_FLAG, effect: null },
    ],
  },
  {
    id: "is-larkspur-intro",
    trigger: "intro-development",
    title: "Keys to Larkspur Close",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "A little site cabin sits at the top of a new street called Larkspur Close.",
      },
      { kind: "spoken", speaker: VALE, text: "The loft's still yours, and now a whole street." },
      {
        kind: "spoken",
        speaker: BUILDER_NAME,
        text: "Start with the Garden Flat. I've left a story or two.",
      },
      {
        kind: "player",
        text: "A whole street of homes. Let's begin!",
        byTrait: {
          dreamer: "I can already see six porches glowing at dusk.",
          perfectionist: "Every room, every door, every edge. I'm ready.",
          trendsetter: "Larkspur Close is about to be the street everyone talks about.",
          charmer: "I'll bake biscuits for every family on Bellwind's list!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-larkspur-keys",
    trigger: "larkspur-opened",
    title: "The Site Cabin",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Six front doors, six key tags, one site cabin." },
      { kind: "spoken", speaker: BUILDER_NAME, text: "The builders have gone home. The rest is yours." },
      {
        kind: "player",
        text: "From one room to a whole street. Let's go!",
        byTrait: {
          dreamer: "Each door is a new story waiting to be told.",
          perfectionist: "I'll make a plan for every single room.",
          trendsetter: "The street of the year starts today.",
          charmer: "I can't wait to meet the families on Bellwind's list.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-first-plot",
    trigger: "first-project",
    title: "Start at the Front Door",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: BUILDER_NAME,
        text: "Start at the front door. Every room leads to the next.",
      },
      {
        kind: "spoken",
        speaker: BUILDER_NAME,
        text: "Decide who lives where, pick one palette, then make each room.",
      },
    ],
    choices: [],
  },
  {
    id: "is-crew-hello",
    trigger: "first-crew",
    title: "A New Crew Mate",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: CREW_SPEAKER, text: "Point me at a wall. I'll make you proud." },
      {
        kind: "spoken",
        speaker: BUILDER_NAME,
        text: "Crew jobs finish overnight. Paint first, then floor, then light.",
      },
    ],
    choices: [],
  },
  {
    id: "is-first-coaching",
    trigger: "first-coaching",
    title: "Show Me How",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: CREW_SPEAKER, text: "Oh, like that! I'll do it your way." },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Your crew will copy your best work for the rest of this home.",
      },
    ],
    choices: [],
  },
  {
    id: "is-first-open-house",
    trigger: "first-open-house",
    title: "The Doors Swing Open",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The door swings open and the street walks in." },
      {
        kind: "player",
        text: "Every room was ready for them.",
        byTrait: {
          dreamer: "It felt like watching a story come alive.",
          perfectionist: "I watched every footstep. Not one bump.",
          trendsetter: "Did you see their faces? The whole street will talk.",
          charmer: "I said hello to every single visitor!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-gold-key",
    trigger: "gold-key",
    title: "A Golden Key",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Oyelaran",
        text: "I've walked every street in town. That home just works.",
      },
      { kind: "spoken", speaker: BUILDER_NAME, text: "Hang it high. You earned that one." },
    ],
    choices: [],
  },
  {
    id: "is-plot-four",
    trigger: "plot-four",
    title: "Twin Gables",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: BUILDER_NAME, text: "Four rooms now. Your crew will be busy." },
      { kind: "spoken", speaker: BUILDER_NAME, text: "Choose your hero room and make it yourself." },
    ],
    choices: [],
  },
  {
    id: "is-vale-visits",
    trigger: "third-project",
    title: "Ms. Vale Visits",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Ms. Vale strolls up the Close with a flask of tea." },
      {
        kind: "spoken",
        speaker: VALE,
        text: "I painted sets for forty years. Yours are homes people live in.",
      },
    ],
    choices: [],
  },
  {
    id: "is-street-end",
    trigger: "street-end",
    title: "Larkspur End",
    repeatable: false,
    lines: [{ kind: "spoken", speaker: BUILDER_NAME, text: "The last house on the Close. Make it sing." }],
    choices: [],
  },
  {
    id: "is-street-of-homes",
    trigger: "street-of-homes",
    title: "A Street of Homes",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Every porch light on Larkspur Close is glowing." },
      { kind: "spoken", speaker: BUILDER_NAME, text: "You made a street into a neighbourhood." },
    ],
    choices: [],
  },
  {
    id: "is-every-gold",
    trigger: "every-gold",
    title: "Six Gold Keys",
    repeatable: false,
    lines: [{ kind: "spoken", speaker: VALE, text: "Six gold keys. I'm hanging them by the loft door." }],
    choices: [],
  },
  {
    id: "is-doors-opened",
    trigger: "doors-opened",
    title: "We Opened the Doors",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: BUILDER_NAME,
        text: "We opened the doors for you. Visitors still came to look around.",
      },
      { kind: "spoken", speaker: BUILDER_NAME, text: "The next home will be ready when you are." },
    ],
    choices: [],
  },
  {
    id: "is-sister-home",
    trigger: "sister-home",
    title: "The Home Next Door",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: BUILDER_NAME,
        text: "The home next door needs you too. Same size, new story.",
      },
    ],
    choices: [],
  },
  {
    id: "is-trait-trendsetter-solenne",
    trigger: "letter-solenne",
    title: "Window Dresser",
    repeatable: false,
    lines: [{ kind: "spoken", speaker: "Solenne", text: "You always know what's next. Help me show it." }],
    choices: [],
  },
  {
    id: "is-trait-charmer-hollins",
    trigger: "letter-hollins",
    title: "Biscuits Downstairs",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Mrs. Hollin", text: "You've had biscuits with us for weeks. Our turn." },
    ],
    choices: [],
  },
];
