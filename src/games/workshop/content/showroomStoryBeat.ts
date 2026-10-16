import type { StoryBeatDef } from "./storyBeat";

export const SHOWROOM_OFFER_BEAT = "ww-showroom-offer";
export const SHOWROOM_LATER_FLAG = "showroom-later";

export const SHOWROOM_BEATS: readonly StoryBeatDef[] = [
  {
    id: SHOWROOM_OFFER_BEAT,
    trigger: "showroom-offer",
    title: "A Second Key",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Uncle Bram leans on the garage door, jingling a second key.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "The old bicycle shop next door is empty. Fancy a showroom?",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Matched sets on the floor, an apprentice to help, and a booth at the Larkspur Craft Fair.",
      },
      {
        kind: "player",
        text: "A whole shop for my furniture? Let me think.",
        byTrait: {
          dreamer: "I can already picture a reading corner in that window.",
          perfectionist: "Sets mean every piece must match. I like that.",
          trendsetter: "A shop window on Larkspur Road? Everyone will see it.",
          charmer: "A shop means more neighbours dropping by. Yes, please!",
        },
      },
    ],
    choices: [
      { id: "open", label: "Open the showroom", setsFlag: "showroom-yes", effect: "open-showroom" },
      { id: "later", label: "Not yet", setsFlag: SHOWROOM_LATER_FLAG, effect: null },
    ],
  },
  {
    id: "ww-intro-showroom",
    trigger: "intro-showroom",
    title: "Two Keys on Larkspur Road",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Morning light fills the garage and the little shop next door.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Garage for making, shop for showing. Both yours.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "There's a pile of my spare boards by the bench. Help yourself.",
      },
      {
        kind: "player",
        text: "Two keys, one big idea. Let's make something lovely.",
        byTrait: {
          dreamer: "I'll fill that shop window with sets from my sketchbook.",
          perfectionist: "Every set will match, right down to the knobs.",
          trendsetter: "This shop will set the style for the whole road.",
          charmer: "I'll keep the kettle on in both rooms!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-showroom-open",
    trigger: "showroom-opened",
    title: "Dust Sheets Off",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Dust sheets off. The bell over the door rings." },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "I left you a pile of spare boards. Seasons start on a Monday, Fair and all.",
      },
      {
        kind: "player",
        text: "The Larkspur Road Showroom is open!",
        byTrait: {
          dreamer: "It smells of fresh wood and big ideas.",
          perfectionist: "First, a perfectly straight shop sign.",
          trendsetter: "Watch this window. It's going to be famous.",
          charmer: "Come in, come in! Mind the sawdust.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-ren-hello",
    trigger: "ren-hello",
    title: "Keen as Mustard",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Uncle Bram", text: "This is Ren. Keen as mustard." },
      { kind: "spoken", speaker: "Ren", text: "I can fetch boards and sand. I'll learn the rest." },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Take Ren on from the card in the shop, whenever you're ready.",
      },
      {
        kind: "player",
        text: "Welcome to the bench, Ren!",
        byTrait: {
          dreamer: "Welcome! I'll show you my sketchbook.",
          perfectionist: "Welcome! We'll take it slow and steady.",
          trendsetter: "Welcome to the team that sets the style!",
          charmer: "Welcome! Tea first, then sawdust.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-first-set",
    trigger: "first-set",
    title: "One Idea, Told a Few Times",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "A set is one idea, told a few times. Same wood, same finish.",
      },
      {
        kind: "player",
        text: "Matching pieces, all from one plan.",
        byTrait: {
          dreamer: "Like a little family of furniture!",
          perfectionist: "Matching means twice the care. Good.",
          trendsetter: "A whole look, not just one piece. Brilliant.",
          charmer: "They'll keep each other company on the floor.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-first-open-house",
    trigger: "first-open-house",
    title: "Open House",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Visitors run their hands along your work." },
      {
        kind: "player",
        text: "They like it! They really like it.",
        byTrait: {
          dreamer: "Every set has a story, and they heard it.",
          perfectionist: "They noticed how smooth it is.",
          trendsetter: "Told you this window would turn heads.",
          charmer: "So many new friends in one evening.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-fair-invite",
    trigger: "fair-invite",
    title: "An Invitation from Hattie",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Hattie Rowe",
        text: "One booth, one set, and tea all day. Every maker gets a rosette.",
      },
      {
        kind: "spoken",
        speaker: "Hattie Rowe",
        text: "Fair Day is day 13 of each season. Pick a theme and bring a set you made.",
      },
      {
        kind: "player",
        text: "A booth on the village green? I'll be there!",
        byTrait: {
          dreamer: "I'll bring a set that tells a story.",
          perfectionist: "I'll bring my very best joints.",
          trendsetter: "The green won't know what hit it.",
          charmer: "And I'll bring biscuits for the whole panel.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-first-fair",
    trigger: "first-fair",
    title: "Sheets Off on the Green",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "The dust sheet lifts and the green claps." },
      {
        kind: "player",
        text: "My first Fair! I can't stop smiling.",
        byTrait: {
          dreamer: "It felt like a dream with bunting.",
          perfectionist: "Next season, even neater.",
          trendsetter: "Everyone was taking notes. I saw them!",
          charmer: "I made friends at every booth.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-gold-rosette",
    trigger: "gold-rosette",
    title: "Gold on the Green",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Mr. Pell", text: "Boards from my yard never looked so fine." },
      {
        kind: "player",
        text: "A Gold Rosette! Thank you, Mr. Pell.",
        byTrait: {
          dreamer: "Gold, like sunlight on fresh wood.",
          perfectionist: "All those careful cuts paid off.",
          trendsetter: "Gold suits the showroom window.",
          charmer: "Your boards deserve half of it!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-booth-canopy",
    trigger: "booth-canopy",
    title: "The Big Canopy",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Hattie Rowe", text: "The Big Canopy! Room for a whole family's table." },
      {
        kind: "player",
        text: "Three pieces under one canopy. Let's go!",
        byTrait: {
          dreamer: "A whole room on the green!",
          perfectionist: "Three matching pieces. I'm ready.",
          trendsetter: "Big canopy, bigger ideas.",
          charmer: "More room for visitors, too.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-booth-pavilion",
    trigger: "booth-pavilion",
    title: "The Oak Pavilion",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "The Oak Pavilion. I showed a rocking chair here, long ago.",
      },
      {
        kind: "player",
        text: "In the same pavilion as you, Bram!",
        byTrait: {
          dreamer: "I wonder what you dreamed about back then.",
          perfectionist: "I'll make you proud.",
          trendsetter: "The pavilion is ours now.",
          charmer: "Tell me all about that rocking chair.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-ren-level-2",
    trigger: "ren-level-2",
    title: "Ren Gets Steady",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Ren", text: "I can sand with my eyes nearly closed. Nearly." },
      {
        kind: "player",
        text: "Keep them open, Ren! But well done.",
        byTrait: {
          dreamer: "One day you'll have your own showroom.",
          perfectionist: "Smooth work. I checked.",
          trendsetter: "You're getting famous on the road.",
          charmer: "That calls for cake.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-ren-level-3",
    trigger: "ren-level-3",
    title: "Snug as Anything",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Ren", text: "Peg joints snug as anything. Thanks for showing me." },
      {
        kind: "player",
        text: "You did the learning, Ren. I just pointed.",
        byTrait: {
          dreamer: "Now we can dream up bigger sets together.",
          perfectionist: "Snug and true. Lovely work.",
          trendsetter: "Best apprentice on Larkspur Road.",
          charmer: "The whole street says you're a natural.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-fair-skipped",
    trigger: "fair-skipped",
    title: "Next Season",
    repeatable: true,
    lines: [
      { kind: "spoken", speaker: "Hattie Rowe", text: "We kept your pitch warm. See you next season!" },
      {
        kind: "player",
        text: "Next season, I'll bring a set.",
        byTrait: {
          dreamer: "I've already started sketching it.",
          perfectionist: "A set worth the wait.",
          trendsetter: "Next season, they won't miss me.",
          charmer: "Save me a cup of tea, Hattie!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-tight-season",
    trigger: "tight-season",
    title: "A Lean Fortnight",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Lean fortnight? I'll cover the shop half of the rent this once.",
      },
      {
        kind: "spoken",
        speaker: "Uncle Bram",
        text: "Resting the shop for a season is fine too. So is stacking boards at Pell's.",
      },
      {
        kind: "player",
        text: "Thank you, Bram. I'll find my feet.",
        byTrait: {
          dreamer: "Quiet weeks are good for new sketches.",
          perfectionist: "I'll plan the next fortnight carefully.",
          trendsetter: "Every big shop has a quiet patch.",
          charmer: "I owe you a whole tin of biscuits.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-rosette-rail",
    trigger: "rosette-rail",
    title: "The Rosette Rail",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "Rosettes hang along the whole rail." },
      { kind: "spoken", speaker: "Uncle Bram", text: "Proudest garage on Larkspur Road." },
      {
        kind: "player",
        text: "Every season, a rosette. We did it!",
        byTrait: {
          dreamer: "Four seasons, four stories on the rail.",
          perfectionist: "Not one hook left bare.",
          trendsetter: "The rail is the talk of the road.",
          charmer: "Everyone who helped is on that rail too.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-every-hook-gold",
    trigger: "every-hook-gold",
    title: "Gold on Every Hook",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Uncle Bram", text: "Gold on every hook. I'm telling the whole street." },
      {
        kind: "player",
        text: "Gold on every hook. What a ride.",
        byTrait: {
          dreamer: "And still so many sets left to dream.",
          perfectionist: "Every theme, done just right.",
          trendsetter: "Larkspur Road will remember this.",
          charmer: "Let's throw a tea party on the green!",
        },
      },
    ],
    choices: [],
  },
  {
    id: "ww-trait-kit-zara",
    trigger: "kit-zara-offer",
    title: "Something Bold",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Kit", text: "Our zine wants the boldest piece on Larkspur Road." },
      { kind: "spoken", speaker: "Zara", text: "We'll put it on the cover. Promise." },
      {
        kind: "player",
        text: "Bold? I can do bold.",
        byTrait: { trendsetter: "Bold is my favourite colour." },
      },
    ],
    choices: [],
  },
  {
    id: "ww-trait-esi",
    trigger: "esi-offer",
    title: "Sunday Lunch",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Grandma Esi", text: "A table big enough for the whole street's stories." },
      {
        kind: "player",
        text: "A table for stories? I'd love to make it.",
        byTrait: { charmer: "Only if I'm invited to Sunday lunch!" },
      },
    ],
    choices: [],
  },
];
