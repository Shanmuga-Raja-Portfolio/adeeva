import type { GigBoard, Gig, LapsedGig, Offer } from "./gigBoard";
import { avatarLookParser } from "./avatar";
import { DIFFICULTY_IDS } from "./difficulty";
import type { Point } from "./geometry/point";
import {
  arrayOf,
  booleanParser,
  failed,
  integerParser,
  integerRangeParser,
  numberParser,
  objectOf,
  oneOf,
  parsed,
  rangeParser,
  refined,
  stringParser,
  type Parser,
} from "./parse";
import { COLOURS } from "./palette";
import type { ProfileBase } from "./profile";
import type { RewardLine, RewardOutcome } from "./reward";
import type { SubScore } from "./panelScore";
import type { Criterion } from "./score";
import type { StoryState } from "./story";
import { STYLE_TAGS } from "./styleTag";
import { TRAIT_IDS } from "./trait";
import { HOT_TAGS_PER_WEEK, type TrendState } from "./trendMarket";

export const dayParser = integerRangeParser(1, Number.MAX_SAFE_INTEGER);
export const countParser = integerRangeParser(0, Number.MAX_SAFE_INTEGER);
export const rngParser = integerRangeParser(-2147483648, 2147483647);
export const nonNegativeParser = rangeParser(0, Number.MAX_SAFE_INTEGER);
export const shareParser = rangeParser(0, 1);
export const styleTagParser = oneOf(STYLE_TAGS);
export const colourIdParser = oneOf(COLOURS.map((colour) => colour.id));
export const subScoreParser = objectOf<SubScore>({
  id: stringParser,
  label: stringParser,
  value: rangeParser(0, 100),
  weight: shareParser,
  detail: stringParser,
});

export function knownIdParser(lookup: (id: string) => unknown, kind: string): Parser<string> {
  return refined(stringParser, (id) => lookup(id) !== undefined, `a known ${kind} id`);
}

export function trendStateParserOf<T extends string>(tag: Parser<T>): Parser<TrendState<T>> {
  const hotTags = refined(
    arrayOf(tag),
    (tags) => tags.length === HOT_TAGS_PER_WEEK && new Set(tags).size === tags.length,
    `${HOT_TAGS_PER_WEEK} different hot tags`,
  );
  return objectOf<TrendState<T>>({ current: hotTags, next: hotTags });
}

export const trendStateParser = trendStateParserOf(styleTagParser);

export function gigBoardParser<B>(brief: Parser<B>, clientId: Parser<string>): Parser<GigBoard<B>> {
  return objectOf<GigBoard<B>>({
    offers: arrayOf(objectOf<Offer<B>>({ id: stringParser, clientId, brief, expiresDay: dayParser })),
    active: arrayOf(objectOf<Gig<B>>({ id: stringParser, clientId, brief, acceptedDay: dayParser })),
    lapsed: arrayOf(
      objectOf<LapsedGig>({ gigId: stringParser, clientId, day: dayParser, reputation: integerParser }),
    ),
    nextGigNumber: dayParser,
  });
}

export function storyStateParser(beatId: Parser<string>): Parser<StoryState> {
  return objectOf<StoryState>({
    seen: arrayOf(beatId),
    flags: arrayOf(stringParser),
    queue: arrayOf(beatId),
  });
}

export const rewardLineParser = objectOf<RewardLine>({ label: stringParser, amount: numberParser });
export const wholeRewardLineParser = objectOf<RewardLine>({ label: stringParser, amount: integerParser });

const REWARD_OUTCOMES: readonly RewardOutcome[] = ["pass", "soft-fail", "fail"];

export function trendRewardShape<T extends string>(
  trendTag: Parser<T>,
  coins: Parser<number>,
  line: Parser<RewardLine>,
) {
  return {
    outcome: oneOf(REWARD_OUTCOMES),
    coins,
    reputation: integerParser,
    buzz: integerParser,
    lines: arrayOf(line),
    trendMatches: arrayOf(trendTag),
  };
}

export function criterionParserOf<Id extends string>(
  ids: readonly Id[],
  weight: Parser<number>,
): Parser<Criterion<Id>> {
  return objectOf<Criterion<Id>>({
    id: oneOf(ids),
    label: stringParser,
    passed: booleanParser,
    detail: stringParser,
    weight,
  });
}

export const profileShape = {
  name: refined(stringParser, (name) => name.trim().length > 0, "a name"),
  look: avatarLookParser,
  trait: oneOf(TRAIT_IDS),
  difficulty: oneOf(DIFFICULTY_IDS),
} as const;

export const profileParser = objectOf<ProfileBase>(profileShape);

export function pointParser(axis: Parser<number>): Parser<Point> {
  return (input, path) => {
    const outcome = arrayOf(axis)(input, path);
    if (!outcome.ok) return outcome;
    const [x, y] = outcome.value;
    return outcome.value.length === 2 && x !== undefined && y !== undefined
      ? parsed([x, y])
      : failed(path, "a point");
  };
}
