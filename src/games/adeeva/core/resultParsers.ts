import { RUNWAY_LIGHTS } from "../content/runwayLight";
import { RUNWAY_MOODS } from "../content/runwayMood";
import { colourIdParser, materialIdParser, styleTagParser, themeIdParser } from "./catalogIdParsers";
import { CRITERION_IDS } from "./criterion";
import type { QualityBreakdown } from "./dressQuality";
import {
  decorationParser,
  designParser,
  nonNegativeParser,
  runPurposeParser,
  shareParser,
} from "./dressRunParser";
import type { DressSnapshot, PieceResult, SeamResult } from "./dressSnapshot";
import type { Evaluation } from "./evaluate";
import type { FinishedLook } from "./finishedLook";
import type { LogEntry } from "./gameState";
import { LOOKS_PER_SEASON, type LabelSeason } from "./labelSeason";
import type { Reward } from "./rewards";
import { isWalkOrder } from "./runway";
import {
  PANEL_IDS,
  type PanelScore,
  type RunwayChoice,
  type RunwayResult,
  type SubScore,
} from "./runwayScore";
import {
  criterionParserOf,
  dayParser,
  rewardLineParser,
  trendRewardShape,
} from "../../../engine/stateParsers";
import {
  arrayOf,
  booleanParser,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  refined,
  stringParser,
} from "../../../engine/parse";

const scoreParser = rangeParser(0, 100);

const pieceResultParser = objectOf<PieceResult>({
  pieceId: stringParser,
  fabricId: nullable(stringParser),
  cut: booleanParser,
  assembled: booleanParser,
  cutAccuracy: shareParser,
  grainScore: shareParser,
});

const seamResultParser = objectOf<SeamResult>({
  seamId: stringParser,
  progress: shareParser,
  accuracy: shareParser,
});

const snapshotParser = objectOf<DressSnapshot>({
  design: designParser,
  pieces: arrayOf(pieceResultParser),
  seams: arrayOf(seamResultParser),
  decorations: arrayOf(decorationParser),
  spend: nonNegativeParser,
  tags: arrayOf(styleTagParser),
  colours: arrayOf(colourIdParser),
  materials: arrayOf(materialIdParser),
});

const criterionParser = criterionParserOf(CRITERION_IDS, nonNegativeParser);

const qualityParser = objectOf<QualityBreakdown>({
  cut: shareParser,
  seams: shareParser,
  grain: shareParser,
  materialFit: shareParser,
  quality: scoreParser,
});

const evaluationParser = objectOf<Evaluation>({
  criteria: arrayOf(criterionParser),
  quality: qualityParser,
  favouredColoursUsed: integerRangeParser(0, 16),
  score: scoreParser,
  stars: integerRangeParser(1, 5),
  passed: booleanParser,
  feedback: arrayOf(stringParser),
});

const rewardParser = objectOf<Reward>(trendRewardShape(styleTagParser, nonNegativeParser, rewardLineParser));

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  purpose: runPurposeParser,
  clientId: nullable(stringParser),
  day: dayParser,
  evaluation: evaluationParser,
  reward: nullable(rewardParser),
});

const finishedLookParser = objectOf<FinishedLook>({
  runId: stringParser,
  snapshot: snapshotParser,
  evaluation: evaluationParser,
});

const runwayChoiceParser = objectOf<RunwayChoice>({
  order: refined(arrayOf(integerParser), isWalkOrder, "a walk order using each look once"),
  mood: oneOf(RUNWAY_MOODS.map((mood) => mood.id)),
  light: oneOf(RUNWAY_LIGHTS.map((light) => light.id)),
});

const subScoreParser = objectOf<SubScore>({
  id: stringParser,
  label: stringParser,
  value: scoreParser,
  weight: shareParser,
  detail: stringParser,
});

const panelParser = objectOf<PanelScore>({
  id: oneOf(PANEL_IDS),
  label: stringParser,
  score: scoreParser,
  parts: arrayOf(subScoreParser),
});

const runwayResultParser = objectOf<RunwayResult>({
  panels: arrayOf(panelParser),
  latePenalty: nonNegativeParser,
  overall: scoreParser,
  orders: nonNegativeParser,
  coins: nonNegativeParser,
  reputation: integerParser,
  buzz: nonNegativeParser,
  pressQuote: stringParser,
});

export const labelSeasonParser = objectOf<LabelSeason>({
  number: dayParser,
  themeId: themeIdParser,
  venue: stringParser,
  startDay: dayParser,
  deadlineDay: dayParser,
  looks: refined(
    arrayOf(nullable(finishedLookParser)),
    (looks) => looks.length === LOOKS_PER_SEASON,
    `${LOOKS_PER_SEASON} look slots`,
  ),
  runway: nullable(runwayChoiceParser),
  result: nullable(runwayResultParser),
});
