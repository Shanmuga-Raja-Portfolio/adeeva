import {
  arrayOf,
  booleanParser,
  integerParser,
  integerRangeParser,
  keyedRecordOf,
  nullable,
  objectOf,
  oneOf,
  recordOf,
  refined,
  stringParser,
} from "../../../engine/parse";
import {
  colourIdParser,
  countParser,
  dayParser,
  nonNegativeParser,
  shareParser,
  styleTagParser,
} from "../../../engine/stateParsers";
import { FAIR_MUSIC_IDS } from "../content/fairMusic";
import { FAIR_TENT_NUMBERS } from "../content/fairTent";
import { FAIR_THEME_IDS } from "../content/fairTheme";
import { FLOURISH_IDS } from "../content/flourish";
import { PLAQUE_WORDS } from "../content/letterPath";
import { FAIR_PANEL_IDS } from "../content/panelMember";
import { RIBBON_IDS } from "../content/ribbon";
import { TABLE_CLOTH_IDS } from "../content/tableCloth";
import { clientIdParser, designParser, placedToppingParser } from "./bakeRunParser";
import { isFairThemeId } from "./catalog";
import type { FairEntry, FairPanelScore, FairPlan, FairResult, FairState, TouchScore } from "./fairState";
import type { SubScore } from "../../../engine/panelScore";
import { DAYS_PER_WEEK } from "../../../engine/week";

const scoreParser = integerRangeParser(0, 100);

const entryParser = objectOf<FairEntry>({
  runId: stringParser,
  design: designParser,
  toppings: arrayOf(placedToppingParser),
  tags: arrayOf(styleTagParser),
  colours: arrayOf(colourIdParser),
  spend: countParser,
  budget: countParser,
  quality: scoreParser,
  touches: arrayOf(objectOf<TouchScore>({ flourish: oneOf(FLOURISH_IDS), accuracy: shareParser })),
  flair: scoreParser,
  word: nullable(oneOf(PLAQUE_WORDS)),
});

const planParser = objectOf<FairPlan>({
  sidePlates: refined(arrayOf(stringParser), (plates) => plates.length <= 2, "at most two side plates"),
  order: arrayOf(integerRangeParser(0, 2)),
  cloth: oneOf(TABLE_CLOTH_IDS),
  music: oneOf(FAIR_MUSIC_IDS),
});

const partParser = objectOf<SubScore>({
  id: stringParser,
  label: stringParser,
  value: scoreParser,
  weight: nonNegativeParser,
  detail: stringParser,
});

const panelParser = objectOf<FairPanelScore>({
  id: oneOf(FAIR_PANEL_IDS),
  label: stringParser,
  score: scoreParser,
  parts: arrayOf(partParser),
  note: stringParser,
});

const resultParser = objectOf<FairResult>({
  day: dayParser,
  themeId: oneOf(FAIR_THEME_IDS),
  tent: oneOf(FAIR_TENT_NUMBERS),
  plan: planParser,
  panels: arrayOf(panelParser),
  latePenalty: countParser,
  overall: scoreParser,
  ribbon: oneOf(RIBBON_IDS),
  coins: countParser,
  reputation: integerParser,
  buzz: countParser,
  tip: stringParser,
  tentAfter: oneOf(FAIR_TENT_NUMBERS),
});

export const fairStateParser = objectOf<FairState>({
  seasonStartDay: refined(dayParser, (day) => day % DAYS_PER_WEEK === 1, "a season that starts a new week"),
  seasonNumber: dayParser,
  tent: oneOf(FAIR_TENT_NUMBERS),
  themeId: nullable(oneOf(FAIR_THEME_IDS)),
  visitors: arrayOf(clientIdParser),
  entry: nullable(entryParser),
  result: nullable(resultParser),
  tentOffer: booleanParser,
  shownRunIds: arrayOf(stringParser),
  ribbonWall: keyedRecordOf(isFairThemeId, oneOf(RIBBON_IDS)),
  ribbonsByRun: recordOf(() => true, oneOf(RIBBON_IDS)),
});
