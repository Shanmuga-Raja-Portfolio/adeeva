import type { StoryBeat } from "../../../engine/story";

export const STORY_TRIGGERS = [
  "intro-student",
  "intro-label",
  "first-delivery",
  "first-week",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
  "showcase-offer",
  "label-launched",
  "season-start",
  "runway-done",
  "bankrupt",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, "launch-label">;

export const STORY_BEATS: readonly StoryBeatDef[] = [
  {
    id: "thread-one",
    trigger: "intro-student",
    title: "Thread One",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Your bedroom is officially a studio now. A sewing machine on the desk, fabric scraps under the bed.",
      },
      {
        kind: "spoken",
        speaker: "Mom",
        text: "I cleared a shelf for your fabric. Please don't tell your sister.",
      },
      {
        kind: "player",
        text: "Thank you. The first dress starts tonight.",
        byTrait: {
          dreamer: "I can already see the first dress. It sort of glows, and it definitely twirls.",
          perfectionist: "First a tidy workspace, then a perfect first dress. In that order.",
          trendsetter: "Bedroom today, front row tomorrow. Let's go.",
          charmer: "You're the best. The first thing I make is basically yours, you know that.",
        },
      },
      { kind: "spoken", speaker: "Narrator", text: "Your phone buzzes. Someone already needs a dress." },
    ],
    choices: [],
  },
  {
    id: "doors-open",
    trigger: "intro-label",
    title: "Doors Open",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The atelier smells of fresh paint and steamed wool. Your name is on the door.",
      },
      {
        kind: "spoken",
        speaker: "Wren, studio manager",
        text: "Rent is weekly, the buyers are curious, and the first show is in two weeks. No pressure at all.",
      },
      {
        kind: "player",
        text: "Two weeks is plenty. Let's make something people remember.",
        byTrait: {
          dreamer: "Two weeks to turn a daydream into three real looks. I've waited my whole life for this.",
          perfectionist: "Then we plan every look down to the last button. Starting now.",
          trendsetter: "Curious buyers are my favourite kind. Let's give them something to talk about.",
          charmer: "Wren, I already like you. Coffee first, then world domination?",
        },
      },
    ],
    choices: [],
  },
  {
    id: "out-the-door",
    trigger: "first-delivery",
    title: "Out the Door",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The dress is folded in tissue paper and handed over. It belongs to the world now.",
      },
      {
        kind: "player",
        text: "My first real delivery. I made that.",
        byTrait: {
          dreamer: "It's strange to let it go. Like sending a sketch off on its own adventure.",
          perfectionist: "I already know three things I'd do differently. That's a good sign, right?",
          trendsetter: "First delivery, done. Somebody frame that receipt.",
          charmer: "Did you see their face? I want to see that face on every client.",
        },
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Later, your phone lights up: a thank-you, three hearts and a slightly blurry photo.",
      },
    ],
    choices: [],
  },
  {
    id: "seven-days",
    trigger: "first-week",
    title: "Seven Days",
    repeatable: false,
    lines: [
      { kind: "spoken", speaker: "Narrator", text: "One whole week of thread, pins and late-night ideas." },
      {
        kind: "player",
        text: "A week down. The pincushion has seen things.",
        byTrait: {
          dreamer: "A week already? The days keep slipping between the stitches.",
          perfectionist: "Seven days, zero lost pins. Mostly zero.",
          trendsetter: "Week one: complete. Week two: louder.",
          charmer: "A week of new friends and borrowed scissors. I'll return them. Probably.",
        },
      },
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Rent is settled, the kettle is on, and next week's trends are already whispering.",
      },
    ],
    choices: [],
  },
  {
    id: "the-sketch-that-wouldnt-sleep",
    trigger: "trait-dreamer",
    title: "The Sketch That Wouldn't Sleep",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Iris",
        text: "I saw your sketchbook at art club. The dress with stars stitched into the hem. Is it real yet?",
      },
      {
        kind: "player",
        text: "Not yet. It keeps changing every time I look at it.",
        byTrait: {
          dreamer: "Not yet. Every night it grows another star. I think it's waiting for the right person.",
        },
      },
      { kind: "spoken", speaker: "Iris", text: "Then maybe it's waiting for my gallery opening." },
    ],
    choices: [
      { id: "show-sketch", label: "Show Iris the sketch", setsFlag: "iris-saw-sketch", effect: null },
      { id: "keep-secret", label: "Keep it secret for now", setsFlag: "sketch-kept-secret", effect: null },
    ],
  },
  {
    id: "measure-twice",
    trigger: "trait-perfectionist",
    title: "Measure Twice",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Aunt Odile",
        text: "I hear you sew now. Show me your seam allowance. No, the real one.",
      },
      {
        kind: "player",
        text: "It's exactly one and a half centimetres.",
        byTrait: { perfectionist: "One and a half centimetres. I measured it three times. Four, actually." },
      },
      {
        kind: "spoken",
        speaker: "Aunt Odile",
        text: "Hm. Good. I have a recital coming up, and I am very hard to impress.",
      },
    ],
    choices: [
      { id: "ask-lesson", label: "Ask for a lesson", setsFlag: "odile-lesson", effect: null },
      { id: "show-seam", label: "Show her your best seam", setsFlag: "odile-impressed", effect: null },
    ],
  },
  {
    id: "front-row",
    trigger: "trait-trendsetter",
    title: "Front Row",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Jaz",
        text: "Okay, your feed? Obsessed. My followers keep asking who made that jacket you posted.",
      },
      {
        kind: "player",
        text: "That was me. Thanks for noticing.",
        byTrait: { trendsetter: "Me. Obviously. I was hoping someone with taste would spot it." },
      },
      { kind: "spoken", speaker: "Jaz", text: "Collab? I'm thinking big colour, bigger sparkle." },
    ],
    choices: [
      { id: "say-yes", label: "Say yes immediately", setsFlag: "jaz-collab-eager", effect: null },
      { id: "play-cool", label: "Play it cool", setsFlag: "jaz-collab-cool", effect: null },
    ],
  },
  {
    id: "curtain-call",
    trigger: "trait-charmer",
    title: "Curtain Call",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Mr. Abara",
        text: "Our costume volunteer moved away, the show opens soon, and our queen is wearing a bedsheet.",
      },
      {
        kind: "player",
        text: "A queen in a bedsheet? We can't have that.",
        byTrait: { charmer: "A queen in a bedsheet? Absolutely not. Tell me everything about her." },
      },
      { kind: "spoken", speaker: "Mr. Abara", text: "I had a feeling you'd say that." },
    ],
    choices: [
      { id: "offer-help", label: "Offer to help", setsFlag: "abara-helped", effect: null },
      { id: "ask-play", label: "Ask about the play first", setsFlag: "abara-chat", effect: null },
    ],
  },
  {
    id: "student-showcase",
    trigger: "showcase-offer",
    title: "The Student Showcase",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Dela, showcase organiser",
        text: "Your name keeps coming up. Five happy clients, glowing reviews, a very proud mom.",
      },
      {
        kind: "spoken",
        speaker: "Dela, showcase organiser",
        text: "We'd love to give you a slot to launch your own label. Small atelier, real runway.",
      },
      {
        kind: "player",
        text: "My own label?",
        byTrait: {
          dreamer: "My own label. I've drawn that logo in so many margins.",
          perfectionist: "My own label. I'd need a proper cutting table. And a plan. Mostly a plan.",
          trendsetter: "My own label. I mean, it was only a matter of time.",
          charmer: "My own label? Dela, I could hug you. Can I hug you?",
        },
      },
    ],
    choices: [
      {
        id: "launch",
        label: "Launch your label",
        setsFlag: "label-launch-accepted",
        effect: "launch-label",
      },
      { id: "not-yet", label: "Not yet", setsFlag: "label-launch-later", effect: null },
    ],
  },
  {
    id: "a-name-on-the-door",
    trigger: "label-launched",
    title: "A Name on the Door",
    repeatable: false,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The bedroom studio is packed into boxes. The atelier keys feel heavier than they look.",
      },
      {
        kind: "player",
        text: "Same scissors, bigger table. Let's begin.",
        byTrait: {
          dreamer: "Same scissors, bigger dreams. The walls here are begging for sketches.",
          perfectionist: "Same scissors, bigger table, stricter standards.",
          trendsetter: "Same scissors, way better lighting. Content is going to be incredible.",
          charmer: "Same scissors, new neighbours. I'll bake something and say hello.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "new-season",
    trigger: "season-start",
    title: "New Season",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Wren, studio manager",
        text: "The theme is set and the venue is booked. Three looks, fourteen days.",
      },
      {
        kind: "player",
        text: "Pin up the mood board. We start today.",
        byTrait: {
          dreamer: "Pin up the mood board. I can already hear the music.",
          perfectionist: "Pin up the mood board and the schedule. Mostly the schedule.",
          trendsetter: "Pin up the mood board. This season, we set the trend.",
          charmer: "Pin up the mood board, and put the kettle on. It's going to be a good one.",
        },
      },
    ],
    choices: [],
  },
  {
    id: "after-the-lights",
    trigger: "runway-done",
    title: "After the Lights",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "The last model turns at the end of the runway. Applause rolls in like a wave.",
      },
      {
        kind: "player",
        text: "We did it. Every stitch walked out there.",
        byTrait: {
          dreamer: "For a moment it looked exactly like the sketch. Then even better.",
          perfectionist: "Every hem held. Every single one.",
          trendsetter: "Did you hear that applause? Write it down. Season one of many.",
          charmer: "I need to thank every single person backstage. Twice.",
        },
      },
      { kind: "spoken", speaker: "Wren, studio manager", text: "The reviews are in. Want to read them?" },
    ],
    choices: [],
  },
  {
    id: "tight-week",
    trigger: "bankrupt",
    title: "Tight Week",
    repeatable: true,
    lines: [
      {
        kind: "spoken",
        speaker: "Narrator",
        text: "Rent cleared, and the coin jar rattles with nothing at all.",
      },
      {
        kind: "player",
        text: "Okay. A few shifts will steady things. Then back to the machine.",
        byTrait: {
          dreamer: "Okay. A few shifts, and I'll sketch on the napkins between orders.",
          perfectionist: "Okay. A budget, a few shifts and a spreadsheet. We recover.",
          trendsetter: "Okay. Even icons take a side job. Comeback arc starts now.",
          charmer: "Okay. A few shifts means a few new regulars. I can work with that.",
        },
      },
    ],
    choices: [],
  },
];
