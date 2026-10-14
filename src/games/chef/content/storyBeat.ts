import type { StoryBeat, StoryLine } from "../../../engine/story";

export const STORY_TRIGGERS = [
  "intro",
  "first-lesson",
  "first-taste-solved",
  "six-lessons",
  "first-week",
  "bankrupt",
  "graduation-passed",
  "first-service",
  "first-team-finish",
  "station-test-passed",
  "sous-start",
  "first-special-sold-out",
  "sous-service-5",
  "tasting-day",
  "head-chef-start",
  "first-menu-written",
  "trait-dreamer",
  "trait-perfectionist",
  "trait-trendsetter",
  "trait-charmer",
] as const;
export type StoryTrigger = (typeof STORY_TRIGGERS)[number];

export type StoryBeatDef = StoryBeat<StoryTrigger, never>;

export const BEAT_BUZZ: Readonly<Record<string, number>> = { "ch-trait-charmer": 2 };

function said(speaker: string, text: string): StoryLine {
  return { kind: "spoken", speaker, text };
}

function you(text: string, dreamer: string, perfectionist: string, trendsetter: string, charmer: string) {
  return {
    kind: "player",
    text,
    byTrait: { dreamer, perfectionist, trendsetter, charmer },
  } as const satisfies StoryLine;
}

function reply(text: string): StoryLine {
  return { kind: "player", text, byTrait: {} };
}

function beat(id: string, trigger: StoryTrigger, title: string, lines: readonly StoryLine[]): StoryBeatDef {
  return { id, trigger, title, repeatable: trigger === "bankrupt", lines, choices: [] };
}

export const STORY_BEATS: readonly StoryBeatDef[] = [
  beat("ch-intro", "intro", "Six Kitchens", [
    said("Wen", "Welcome to Larkspur Cookery School. Six chefs, six kitchens, one you."),
    said("Wen", "Each mentor will teach you one lesson. Check the class board every morning."),
    you(
      "I'm ready to learn all six.",
      "Six kitchens? I want to taste every colour.",
      "I'll learn every step until it's right.",
      "Six cuisines. I'll learn what Larkspur loves first.",
      "Six chefs to meet. I'll learn every name.",
    ),
  ]),
  beat("ch-first-lesson", "first-lesson", "Your First Ticket", [
    said("Narrator", "Your first ticket, clipped above the board."),
    said("Arjun", "Listen to the cumin. When it crackles, it's ready."),
  ]),
  beat("ch-first-taste", "first-taste-solved", "Taste As You Go", [
    said("Arjun", "You tasted before you guessed. That's a cook's habit."),
  ]),
  beat("ch-all-mentors", "six-lessons", "All Six", [
    said("Wen", "All six. They've all asked to have you on their line."),
    said("Wen", "When you're ready, the Graduation Practical is waiting on the class board."),
  ]),
  beat("ch-first-week", "first-week", "Board Day", [
    said("Wen", "Board is due on day seven. The Hall always needs pot-washers."),
  ]),
  beat("ch-graduation", "graduation-passed", "Your Own Apron", [
    said("Wen", "Here's your apron. It's yours now."),
    you(
      "My own apron. I'll look after it.",
      "It's going to collect so many colours.",
      "Clean, pressed, and ready for the line.",
      "Next stop: the busiest counter at the Hall.",
      "Thank you, Wen. Thank you, everyone.",
    ),
  ]),
  beat("ch-first-service", "first-service", "Tickets In, Plates Out", [
    said("Lucia", "Tickets come in, plates go out. Breathe between them."),
  ]),
  beat("ch-team-finish", "first-team-finish", "Together", [
    said("Teo", "We finished them together. That's what a line is for."),
  ]),
  beat("ch-station-test", "station-test-passed", "Your Counter", [
    said("Rafael", "Your counter tonight, chef. I'll be eating."),
  ]),
  beat("ch-sous", "sous-start", "Sous Chef", [
    said("Hollis", "Sous chef. You'll lead the shift and write the special."),
    you(
      "I'll lead, and I'll listen.",
      "A daily special? I've got ideas already.",
      "Every station ready, every ticket on time.",
      "The specials board is mine. Watch this space.",
      "I'll lead with a thank-you for every plate.",
    ),
  ]),
  beat("ch-first-special", "first-special-sold-out", "Sold Out!", [
    said("Teo", "Your special sold out! Write it on the board again tomorrow?"),
  ]),
  beat("ch-kind-call", "sous-service-5", "A Kind Call", [
    said("Bastien", "You said thank you to every plate today. The team noticed."),
  ]),
  beat("ch-tasting-day", "tasting-day", "Tasting Day", [
    said("Hollis", "Three plates. Show me who you are."),
  ]),
  beat("ch-head-chef", "head-chef-start", "Head Chef", [
    said("Efua", "Head chef. Your kitchen, your menu. We're all proud."),
    you(
      "Our kitchen. Let's make it a kind one.",
      "My menu is going to look like a sunset.",
      "A menu with no weak dish on it.",
      "The menu will be what the town craves next.",
      "Our kitchen. Everyone gets a seat at family meal.",
    ),
  ]),
  beat("ch-first-menu", "first-menu-written", "A Menu Is a Promise", [
    said("Haruka", "A menu is a promise. Keep it small and keep it well."),
  ]),
  beat("ch-trait-dreamer", "trait-dreamer", "Moonlight", [
    said("Isadora", "Cook me a plate that looks like moonlight."),
    reply("Pale rice, a silver sauce, one bright star of chilli."),
  ]),
  beat("ch-trait-perfectionist", "trait-perfectionist", "On the Beat", [
    said("Bastien", "Every cut on the beat. Again tomorrow?"),
    reply("Every day."),
  ]),
  beat("ch-trait-trendsetter", "trait-trendsetter", "The Poster", [
    said("Dami", "You always know what Larkspur's craving. Make the plate for our poster?"),
    reply("I know just the dish."),
  ]),
  beat("ch-trait-charmer", "trait-charmer", "Thursday Table", [
    said("Mrs. Bell", "It's just a few of us on Thursdays. Would you cook?"),
    reply("I'd love to. I'll bring extra."),
  ]),
  beat("ch-bankrupt", "bankrupt", "Coin Jar", [
    said("Hollis", "Coin jar's empty. Pot-washing pays, and it's honest work."),
    reply("A few pot-wash days, then back to the line."),
  ]),
];
