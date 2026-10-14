import { arrayOf, booleanParser, integerRangeParser, objectOf, oneOf } from "../../../engine/parse";
import { countParser, dayParser, knownIdParser } from "../../../engine/stateParsers";
import type { ItemId, MustHave } from "../content/client";
import { DECOR_IDS } from "../content/decor";
import { FURNITURE_IDS } from "../content/furniture";
import { LIGHT_IDS } from "../content/light";
import { ROOM_COLOUR_IDS } from "../content/roomColour";
import { ROOM_IDS } from "../content/roomTemplate";
import { ROOM_TAGS } from "../content/roomTag";
import type { Brief } from "./brief";
import { clientById } from "./catalog";

export const clientIdParser = knownIdParser(clientById, "client");
export const roomTagParser = oneOf(ROOM_TAGS);
const roomColourParser = oneOf(ROOM_COLOUR_IDS);

const ITEM_IDS: readonly ItemId[] = [...FURNITURE_IDS, ...DECOR_IDS, ...LIGHT_IDS];

const mustHaveParser = objectOf<MustHave>({
  itemId: oneOf(ITEM_IDS),
  count: integerRangeParser(1, 9),
});

export const briefParser = objectOf<Brief>({
  clientId: clientIdParser,
  roomId: oneOf(ROOM_IDS),
  showHome: booleanParser,
  deadlineDay: dayParser,
  budget: countParser,
  fee: countParser,
  requiredTags: arrayOf(roomTagParser),
  favouredColours: arrayOf(roomColourParser),
  avoidColours: arrayOf(roomColourParser),
  mustHaves: arrayOf(mustHaveParser),
  mood: oneOf(["warm", "cool", "any"] as const),
  minQuality: integerRangeParser(0, 100),
});
