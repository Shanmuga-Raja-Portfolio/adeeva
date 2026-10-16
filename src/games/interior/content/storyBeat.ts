import type { AvatarLook } from "../../../engine/avatar";
import type { StoryBeat } from "../../../engine/story";
import { LARKSPUR_STORY_BEATS } from "./larkspurStoryBeat";

export const STORY_TRIGGERS = [
  "intro",
  "first-delivery",
  "first-week",
  "bankrupt",
  "first-show-home",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
  "larkspur-offer",
  "intro-development",
  "larkspur-opened",
  "first-project",
  "first-crew",
  "first-coaching",
  "first-open-house",
  "gold-key",
  "plot-four",
  "third-project",
  "street-end",
  "street-of-homes",
  "every-gold",
  "doors-opened",
  "sister-home",
  "letter-solenne",
  "letter-hollins",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export const STORY_EFFECTS = ["open-larkspur"] as const;
export type StoryEffect = (typeof STORY_EFFECTS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, StoryEffect>;

export const MENTOR_NAME = "Ms. Vale";
export const MENTOR_LOOK: AvatarLook = {
  skinTone: "porcelain",
  hairStyle: "high-bun",
  hairColour: "platinum",
  outfit: "dungarees",
};

export const BEAT_BUZZ: Readonly<Record<string, number>> = { "is-charmer": 2 };

const LOFT_STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "is-keys",
    trigger: "intro",
    title: "Keys to the Loft",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Morning sun pours into the little loft above Hollin's Hardware.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Here's your key. Every room has a story. Find it.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Nana Pearl's note is already in your inbox. She's a dear.",
      },
      {
        kind: "player",
        text: "I'll make her a room she loves.",
        byTrait: {
          dreamer: "I can already picture it: soft light and a sage wall.",
          perfectionist: "Crisp edges, snug floors. I'll get every detail right.",
          trendsetter: "Marigold Row is about to have a new favourite designer.",
          charmer: "I'll bring biscuits to the reveal!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-first-reveal",
    trigger: "first-delivery",
    title: "The Big Reveal",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Your very first client opens their eyes and gasps.",
      },
      { kind: "spoken", speaker: MENTOR_NAME, text: "That face is why we do this." },
      {
        kind: "player",
        text: "I made that room, start to finish.",
        byTrait: {
          dreamer: "It looked just like the picture in my head.",
          perfectionist: "Not one wobbly edge. I checked twice.",
          trendsetter: "Wait until the street sees it.",
          charmer: "I think I'll be invited for tea every week now!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-first-week",
    trigger: "first-week",
    title: "Rent and Rollers",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Ms. Vale knocks with her rent book and a smile." },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "A week already! The upgrade catalogue is on the warehouse counter.",
      },
      {
        kind: "player",
        text: "Here's the rent. On to week two!",
        byTrait: {
          dreamer: "Week two will be even more colourful.",
          perfectionist: "Rent paid on time. Exactly as planned.",
          trendsetter: "Next week, the whole street books me.",
          charmer: "Stay for a cuppa, Ms. Vale?",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-dreamer",
    trigger: "trait-dreamer",
    title: "A Ceiling Full of Stars",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Late at night, you doodle a bedroom under a painted night sky.",
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Next morning, a letter arrives from Orla, the puppet maker.",
      },
      { kind: "spoken", speaker: "Orla", text: "I heard you make rooms that feel like dreams." },
      {
        kind: "player",
        text: "I think I do!",
        byTrait: { dreamer: "The stars have been waiting for someone to ask." },
      },
    ],
    choices: [],
  },
  {
    id: "is-perfectionist",
    trigger: "trait-perfectionist",
    title: "Straight as a Plumb Line",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Dr. Imogen Faraday",
        text: "Who painted such crisp edges at the Bluebell Café?",
      },
      { kind: "spoken", speaker: "Dr. Imogen Faraday", text: "My study needs that kind of care." },
      {
        kind: "player",
        text: "Let's make it just so.",
        byTrait: { perfectionist: "Bring me the brief. Every edge will be straight." },
      },
    ],
    choices: [],
  },
  {
    id: "is-trendsetter",
    trigger: "trait-trendsetter",
    title: "Window Displays",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Walking Marigold Row, you notice which shop windows people stop at.",
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Next week's favourites now pin to your mood board early.",
      },
      {
        kind: "player",
        text: "I can see what's coming.",
        byTrait: { trendsetter: "Next week's looks, pinned up early. Perfect." },
      },
    ],
    choices: [],
  },
  {
    id: "is-charmer",
    trigger: "trait-charmer",
    title: "The Open Door",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Neighbours pop up to the loft for biscuits and a chat." },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "They tell their friends about you. Your buzz grows by 2.",
      },
      {
        kind: "player",
        text: "Thank you, everyone!",
        byTrait: { charmer: "The kettle's always on. Come back any time!" },
      },
    ],
    choices: [],
  },
  {
    id: "is-show-home",
    trigger: "first-show-home",
    title: "Bellwind Calling",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The loft phone rings. It's Bellwind Homes." },
      {
        kind: "spoken",
        speaker: "Ms. Delphine Achebe",
        text: "We have a show home and an open house. Make it what people love this week.",
      },
      {
        kind: "player",
        text: "A whole show home? Yes, please!",
        byTrait: {
          dreamer: "I'll dress it like a page from a storybook.",
          perfectionist: "Every corner will be ready for visitors.",
          trendsetter: "I know exactly what the street loves right now.",
          charmer: "I'll greet every visitor at the door.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "is-quiet-week",
    trigger: "bankrupt",
    title: "A Quiet Week",
    repeatable: true,
    lines: [
      { kind: "spoken", speaker: MENTOR_NAME, text: "Every studio has a quiet week. Don't worry." },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Hollin's needs a shelf stacker. A day there fills the tin.",
      },
      {
        kind: "player",
        text: "I'll stack some shelves and keep going.",
        byTrait: {
          dreamer: "Shelves are just tiny rooms for paint tins, really.",
          perfectionist: "Every tin will face the front. Neatly.",
          trendsetter: "Quiet weeks don't last. Next week is mine.",
          charmer: "I'll make friends with every customer at Hollin's.",
        },
      },
    ],
    choices: [],
  },
];

export const STORY_BEATS: readonly StoryBeatDef[] = [...LOFT_STORY_BEATS, ...LARKSPUR_STORY_BEATS];
