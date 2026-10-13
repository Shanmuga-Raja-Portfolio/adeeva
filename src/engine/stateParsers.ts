import type { GigBoard, Gig, LapsedGig, Offer } from "./gigBoard";
import {
  arrayOf,
  integerParser,
  integerRangeParser,
  objectOf,
  oneOf,
  refined,
  stringParser,
  type Parser,
} from "./parse";
import { COLOURS } from "./palette";
import type { StoryState } from "./story";
import { STYLE_TAGS } from "./styleTag";
import { HOT_TAGS_PER_WEEK, type TrendState } from "./trendMarket";

export const dayParser = integerRangeParser(1, Number.MAX_SAFE_INTEGER);
export const countParser = integerRangeParser(0, Number.MAX_SAFE_INTEGER);
export const rngParser = integerRangeParser(-2147483648, 2147483647);
export const styleTagParser = oneOf(STYLE_TAGS);
export const colourIdParser = oneOf(COLOURS.map((colour) => colour.id));

export function knownIdParser(lookup: (id: string) => unknown, kind: string): Parser<string> {
  return refined(stringParser, (id) => lookup(id) !== undefined, `a known ${kind} id`);
}

const hotTagsParser = refined(
  arrayOf(styleTagParser),
  (tags) => tags.length === HOT_TAGS_PER_WEEK,
  `${HOT_TAGS_PER_WEEK} hot tags`,
);

export const trendStateParser = objectOf<TrendState>({ current: hotTagsParser, next: hotTagsParser });

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
