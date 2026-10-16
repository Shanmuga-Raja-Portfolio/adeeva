import { fixedRecordOf, objectOf } from "../../../engine/parse";
import { countParser } from "../../../engine/stateParsers";
import { DECOR_IDS } from "../content/decor";
import { FLOOR_IDS } from "../content/floor";
import { FURNITURE_IDS } from "../content/furniture";
import { LIGHT_IDS } from "../content/light";
import { PAINT_IDS } from "../content/paint";
import type { Stock } from "./stock";

export const stockParser = objectOf<Stock>({
  furniture: fixedRecordOf(FURNITURE_IDS, countParser),
  paints: fixedRecordOf(PAINT_IDS, countParser),
  floors: fixedRecordOf(FLOOR_IDS, countParser),
  lights: fixedRecordOf(LIGHT_IDS, countParser),
  decor: fixedRecordOf(DECOR_IDS, countParser),
});
