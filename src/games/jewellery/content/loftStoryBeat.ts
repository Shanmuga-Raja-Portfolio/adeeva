import { MENTOR_NAME } from "./mentor";
import { KEMI_NAME } from "./panelMember";
import type { StoryBeatDef } from "./storyBeat";

export const LOFT_OFFER_BEAT = "jb-loft-offer";
export const LOFT_LATER_FLAG = "loft-later";
export const LOFT_YES_FLAG = "loft-yes";

export const LOFT_STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: LOFT_OFFER_BEAT,
    trigger: "loft-offer",
    title: "The Spiral Stair",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Mr. Osei leads you up the little spiral stair above the arcade gate.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "The loft upstairs is empty. Room for a whole collection of your own.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "The loft adds a little to your weekly rent. You can rest your line any season and pay bench rent only.",
      },
      {
        kind: "player",
        text: "A whole collection? Of my own?",
        byTrait: {
          dreamer: "I can already see a line of little moons on velvet.",
          perfectionist: "Every piece matching, every edge exact. Oh, yes.",
          trendsetter: "A line with my name on it. The arcade will love it.",
          charmer: "And everyone in the arcade could come and see it!",
        },
      },
    ],
    choices: [
      { id: "launch", label: "Launch my own collection", setsFlag: LOFT_YES_FLAG, effect: "open-loft" },
      { id: "later", label: "Not yet", setsFlag: LOFT_LATER_FLAG, effect: null },
    ],
  },
  {
    id: "jb-intro-loft",
    trigger: "intro-loft",
    title: "Lanterns Up High",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The lanterns of Thimble Lane Arcade blink on. Above the gate, a round window glows.",
      },
      { kind: "spoken", speaker: MENTOR_NAME, text: "Bench downstairs, loft upstairs. Both yours." },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Gran Mina's order tag is already pinned up. Start there, then plan your line.",
      },
      {
        kind: "player",
        text: "A bench and a loft. Let's make something wonderful.",
        byTrait: {
          dreamer: "The loft window looks like a full moon. I love it already.",
          perfectionist: "I'll start with one perfect piece, then a perfect line.",
          trendsetter: "My own line, my own launch. This is going to be big.",
          charmer: "I'll wave to everyone from the round window!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-loft-open",
    trigger: "loft-opened",
    title: "Dust Sheets Off",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Dust sheets off; the round window glows over the arcade.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Here's my old starter drawer: a wide silver sheet and two fine chains.",
      },
      {
        kind: "player",
        text: "My own loft. Thank you, Mr. Osei.",
        byTrait: {
          dreamer: "I'll hang paper stars from every beam.",
          perfectionist: "Tools on the left, metals on the right. Perfect.",
          trendsetter: "This window is the best view in Thimble Lane.",
          charmer: "You'll come up for tea every week, won't you?",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-board",
    trigger: "first-board",
    title: "One Idea, Told a Few Times",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "A collection is one idea, told a few times. Same motif, same metal.",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Watch the Harmony meter. It glows when the pieces belong together.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-kemi-hello",
    trigger: "first-gem-market",
    title: "Pebble & Prism",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: KEMI_NAME,
        text: "Welcome to Pebble & Prism! Hold them to the light. Pale, true or deep?",
      },
      {
        kind: "spoken",
        speaker: KEMI_NAME,
        text: "Stones with the same tint make a line look like a family.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-line-sheet",
    trigger: "first-line-sheet",
    title: "Around the Gaps",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: MENTOR_NAME, text: "Plan around the gaps. A tidy sheet is a happy sheet." },
    ],
    choices: [],
  },
  {
    id: "jb-first-twin",
    trigger: "first-twin",
    title: "Twin Glow",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Two little glows rise together." },
      {
        kind: "player",
        text: "Two seams, one glow!",
        byTrait: {
          dreamer: "Like two stars switching on at once.",
          perfectionist: "Both seams, matched to the moment. Lovely.",
          trendsetter: "Twice the shine in half the time.",
          charmer: "I have to tell Mr. Osei!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-lookbook",
    trigger: "first-lookbook",
    title: "Good Light",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Good light tells the story before anyone reads the card.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-launch-invite",
    trigger: "launch-invite",
    title: "Lantern Night Is Coming",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "June Hale",
        text: "Lantern Night is ours! Every maker gets a lantern ribbon.",
      },
      {
        kind: "spoken",
        speaker: "June Hale",
        text: "Bring your line to the stage on day 13 of the season. We'll light it up.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-launch",
    trigger: "first-launch",
    title: "The Lid Opens",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The plinth lid opens and the whole arcade claps." },
      {
        kind: "player",
        text: "They loved my line!",
        byTrait: {
          dreamer: "It felt like the lanterns were dreaming with me.",
          perfectionist: "Every piece shone exactly as planned.",
          trendsetter: "Everyone will be talking about it tomorrow.",
          charmer: "I want to hug every single person here.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-first-popup",
    trigger: "first-popup",
    title: "Your Own Window",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Your own window. I always hoped someone would light it up.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-copy-request",
    trigger: "copy-request",
    title: "One More Like That",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mrs. Lune",
        text: "Could you make one more like the one in your window?",
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "A copy request is pinned up with your order tags.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-gold-lantern",
    trigger: "gold-lantern",
    title: "Something Special",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Bea Okafor",
        text: "I've sorted beads forty years. That line is something special.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-spot-stage",
    trigger: "spot-stage",
    title: "The Arcade Stage",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "June Hale",
        text: "The Arcade Stage! The lanterns hang lowest there, just for you.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-spot-grand",
    trigger: "spot-grand",
    title: "The Grand Lantern Stage",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "The Grand Lantern Stage. My music boxes played here, long ago.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-launch-skipped",
    trigger: "launch-skipped",
    title: "Next Lantern Night",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "June Hale",
        text: "We kept your plinth warm. See you next Lantern Night!",
      },
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Your pieces, stones and sheets are all waiting. Same theme, more time.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-tight-season",
    trigger: "tight-season",
    title: "A Lean Fortnight",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Lean fortnight? I'll cover some of the rent this once.",
      },
      {
        kind: "player",
        text: "Thank you. I'll make it count.",
        byTrait: {
          dreamer: "Next season's line will make up for it. I can feel it.",
          perfectionist: "I'll plan the next line even more carefully.",
          trendsetter: "Quiet weeks don't last. Watch this space.",
          charmer: "You're the kindest landlord in the whole town.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "jb-lantern-garland",
    trigger: "lantern-garland",
    title: "The Garland Glows",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Every lantern on the garland glows." },
      { kind: "spoken", speaker: MENTOR_NAME, text: "Proudest loft in Thimble Lane." },
    ],
    choices: [],
  },
  {
    id: "jb-every-lantern-gold",
    trigger: "every-lantern-gold",
    title: "Gold on Every Lantern",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: MENTOR_NAME,
        text: "Gold on every lantern. I'm winding up every music box I own.",
      },
    ],
    choices: [],
  },
  {
    id: "jb-trait-abebe",
    trigger: "abebe-offer",
    title: "A Ring That Sings",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Abebe",
        text: "They say you're the friendliest jeweller in the arcade. Make me a ring that sings!",
      },
    ],
    choices: [],
  },
  {
    id: "jb-trait-zara",
    trigger: "zara-offer",
    title: "Comic Launch",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Zara", text: "My comic needs the boldest piece in the arcade. Ready?" },
    ],
    choices: [],
  },
];
