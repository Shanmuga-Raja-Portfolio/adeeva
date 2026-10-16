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
import { countParser, dayParser, shareParser, subScoreParser } from "../../../engine/stateParsers";
import { DAYS_PER_WEEK } from "../../../engine/week";
import { BOOTH_BACKDROP_IDS } from "../content/boothBackdrop";
import { CUSHION_FABRIC_IDS } from "../content/cushionFabric";
import { FAIR_BOOTH_NUMBERS } from "../content/fairBooth";
import { FAIR_MUSIC_IDS } from "../content/fairMusic";
import { FAIR_THEME_IDS } from "../content/fairTheme";
import { JOINT_KINDS } from "../content/jointKind";
import { MAKERS_NOTE_IDS } from "../content/makersNote";
import { FAIR_PANEL_IDS } from "../content/panelMember";
import { PRODUCT_IDS } from "../content/product";
import { ROSETTE_IDS } from "../content/rosette";
import { SET_TEMPLATE_IDS } from "../content/setTemplate";
import { WOOD_IDS } from "../content/wood";
import type { ApprenticeState } from "./apprentice";
import { isFairThemeId } from "./catalog";
import { QUARTER_TURNS } from "./commissionRun";
import type { FairPanelScore, FairPlan, FairResult, FairState } from "./fairState";
import {
  clientIdParser,
  finishParser,
  optionsParser,
  placedExtraParser,
  scoreParser,
  shadeParser,
  woodTagParser,
} from "./runParser";
import type { FloorPiece, FloorSet, FloorSpot, SetStats, ShowroomState } from "./showroomState";

const setIdParser = refined(stringParser, (id) => /^set-\d+$/.test(id), "a set id");

const spotParser = objectOf<FloorSpot>({
  x: integerRangeParser(-50, 400),
  y: integerRangeParser(-50, 400),
  rotation: oneOf(QUARTER_TURNS),
});

const pieceParser = objectOf<FloorPiece>({
  productId: oneOf(PRODUCT_IDS),
  quality: scoreParser,
  tags: arrayOf(woodTagParser),
  extras: arrayOf(placedExtraParser),
  spot: spotParser,
});

const statsParser = objectOf<SetStats>({
  quality: scoreParser,
  jointAccuracy: shareParser,
  sandScore: shareParser,
  matchedFaces: nullable(shareParser),
  evenness: scoreParser,
  hardware: scoreParser,
  harmony: scoreParser,
  colours: arrayOf(shadeParser),
  tags: arrayOf(woodTagParser),
});

const floorSetParser = objectOf<FloorSet>({
  setId: setIdParser,
  templateId: oneOf(SET_TEMPLATE_IDS),
  madeDay: dayParser,
  seasonNumber: dayParser,
  themeId: nullable(oneOf(FAIR_THEME_IDS)),
  woodId: oneOf(WOOD_IDS),
  options: optionsParser,
  finish: finishParser,
  cushion: nullable(oneOf(CUSHION_FABRIC_IDS)),
  setJoint: oneOf(JOINT_KINDS),
  pieces: refined(
    arrayOf(pieceParser),
    (pieces) => pieces.length >= 2 && pieces.length <= 4,
    "2 to 4 pieces",
  ),
  stats: statsParser,
  price: countParser,
  mode: oneOf(["sale", "show"] as const),
  bay: integerRangeParser(0, 2),
});

export const showroomStateParser = refined(
  objectOf<ShowroomState>({
    seasonStartDay: refined(dayParser, (day) => day % DAYS_PER_WEEK === 1, "a season that starts a new week"),
    seasonNumber: dayParser,
    themeId: nullable(oneOf(FAIR_THEME_IDS)),
    rested: booleanParser,
    floor: arrayOf(floorSetParser),
    salePick: nullable(setIdParser),
    graceSeason: countParser,
    nextSetNumber: dayParser,
  }),
  (showroom) =>
    new Set(showroom.floor.map((set) => set.bay)).size === showroom.floor.length &&
    new Set(showroom.floor.map((set) => set.setId)).size === showroom.floor.length,
  "one set per bay",
);

const planParser = objectOf<FairPlan>({
  setId: setIdParser,
  order: arrayOf(integerRangeParser(0, 3)),
  backdrop: oneOf(BOOTH_BACKDROP_IDS),
  music: oneOf(FAIR_MUSIC_IDS),
  note: oneOf(MAKERS_NOTE_IDS),
});

const panelParser = objectOf<FairPanelScore>({
  id: oneOf(FAIR_PANEL_IDS),
  label: stringParser,
  score: scoreParser,
  parts: arrayOf(subScoreParser),
  note: stringParser,
});

const resultParser = objectOf<FairResult>({
  day: dayParser,
  seasonNumber: dayParser,
  themeId: oneOf(FAIR_THEME_IDS),
  booth: oneOf(FAIR_BOOTH_NUMBERS),
  plan: planParser,
  panels: arrayOf(panelParser),
  latePenalty: countParser,
  overall: scoreParser,
  rosette: oneOf(ROSETTE_IDS),
  coins: countParser,
  reputation: integerParser,
  buzz: countParser,
  tip: stringParser,
  boothAfter: oneOf(FAIR_BOOTH_NUMBERS),
  visitor: clientIdParser,
});

export const fairStateParser = objectOf<FairState>({
  booth: oneOf(FAIR_BOOTH_NUMBERS),
  pickSetId: nullable(setIdParser),
  visitors: arrayOf(clientIdParser),
  result: nullable(resultParser),
  boothOffer: booleanParser,
  rosetteRail: keyedRecordOf(isFairThemeId, oneOf(ROSETTE_IDS)),
  rosettesBySet: recordOf((key) => /^set-\d+$/.test(key), oneOf(ROSETTE_IDS)),
});

export const apprenticeStateParser = objectOf<ApprenticeState>({
  hired: booleanParser,
  paidThroughDay: countParser,
  jobsDone: countParser,
  jobsToday: integerRangeParser(0, 3),
});
