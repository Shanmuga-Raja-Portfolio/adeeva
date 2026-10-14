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
  "crossroads",
  "restaurant-start",
  "first-critic-visit",
  "first-restaurant-week",
  "three-path-awards",
  "truck-start",
  "first-festival-favourite",
  "three-ribbons-eight-festivals",
  "tv-start",
  "first-letter",
  "book-launched",
  "larkspur-ladle",
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
  beat("ch-crossroads", "crossroads", "Three Doors", [
    said(
      "Hollis",
      "Three doors, chef. A table of your own, a truck and the open road, or a studio kitchen and a book.",
    ),
    said("Hollis", "Peek through each door once. When you choose, it's yours for this save."),
  ]),
  beat("rs-keys", "restaurant-start", "Your Name Over the Door", [
    said("Narrator", "Quayside Lane. Your name, painted over the door."),
    you(
      "My name, my table. Let's cook.",
      "I can already see the lamps glowing at night.",
      "Every table set the same. Every rim wiped.",
      "Quayside Lane is about to get busy.",
      "I hope the neighbours pop in to say hello.",
    ),
  ]),
  beat("rs-first-critic", "first-critic-visit", "Table 7", [
    said("Narrator", "Table 7 has a notebook."),
    said("Esme", "Same as always, chef. Clean rims."),
  ]),
  beat("rs-first-week-money", "first-restaurant-week", "This Week's Money", [
    said("Hollis", "Money in, money out, and what's left keeps the lights on. You did fine."),
  ]),
  beat("rs-chapter-end", "three-path-awards", "To Quayside Lane!", [
    said("All mentors", "To Quayside Lane!"),
    you(
      "To everyone who cooked here with me.",
      "To every plate that looked like a little painting.",
      "To five good nights a week, every week.",
      "To the next thing Larkspur falls for.",
      "To every guest who came back and said hi.",
    ),
  ]),
  beat("tr-clementine", "truck-start", "Clementine", [
    said("Narrator", "Clementine coughs, then purrs. Your truck."),
    you(
      "Come on, Clementine. Let's go feed some festivals.",
      "She's the colour of a sunrise. Let's go!",
      "Fridge checked, hatch checked. Ready to roll.",
      "Every festival in town is about to know us.",
      "Hello, Clementine. Let's go meet everybody.",
    ),
  ]),
  beat("tr-first-ribbon", "first-festival-favourite", "A Blue Ribbon", [
    said("Narrator", "A blue ribbon, tied to the hatch by a kid in a kite hat."),
  ]),
  beat("tr-chapter-end", "three-ribbons-eight-festivals", "Eight Festivals", [
    said("Rafael", "Eight festivals. You fed the whole town, chef."),
  ]),
  beat("tv-first-segment", "tv-start", "Spoon & Story", [
    said("Producer Mo", "Just cook and talk like you'd teach a friend."),
  ]),
  beat("tv-first-letter", "first-letter", "A Letter in Crayon", [
    said("Narrator", 'A letter in crayon: "My aunt and me tasted as we went. Our soup was good!"'),
  ]),
  beat("tv-chapter-end", "book-launched", "On the Library Shelf", [
    said("Haruka", "Your book is on the library shelf, next to mine."),
    you(
      "Right next to yours? I'll take good care of it.",
      "My plates, on paper, on a shelf. Like a dream.",
      "Every card tested. Every tip a kind one.",
      "I hope every kid in town borrows it.",
      "Next to yours. That's the nicest shelf in town.",
    ),
  ]),
  beat("ch-ladle", "larkspur-ladle", "The Larkspur Ladle", [
    said("Hollis", "All three, chef. This brass ladle has been waiting for a wall like yours."),
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
