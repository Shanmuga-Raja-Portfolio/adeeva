import { average } from "../../../engine/average";
import type { DifficultyId } from "../../../engine/difficulty";
import { paletteCohesion } from "../../../engine/paletteCohesion";
import {
  overallScore,
  panel as weighPanel,
  subScore as part,
  type PanelScore,
  type SubScore,
} from "../../../engine/panelScore";
import {
  lateShowPenalty,
  showDemand,
  showReputation,
  stagingScore,
  type ShowDemandTerms,
} from "../../../engine/showDay";
import { closerStrength } from "../../../engine/showOrder";
import type { RunwayLightId } from "../../adeeva/content/runwayLight";
import type { MusicMoodId } from "../../../engine/musicMood";
import { ROSETTES, type RosetteId } from "../content/rosette";
import type { SeasonDef } from "../content/season";
import { SHOW_PANELS, type ShowPanelId } from "../content/showPanel";
import type { RackPiece } from "./rackPiece";

export const ROLLING_RAILS_FLOW = 10;
export const REQUEST_FLOOR = 50;
export const REQUEST_STEP = 5;
export const REQUEST_BASE_VALUE = 30;
export const REQUEST_VALUE_PER_SEASON = 8;
export const REQUEST_SEASON_CAP = 5;

const REQUEST_TERMS: ShowDemandTerms = {
  floor: REQUEST_FLOOR,
  step: REQUEST_STEP,
  baseValue: REQUEST_BASE_VALUE,
  valuePerSeason: REQUEST_VALUE_PER_SEASON,
  seasonCap: REQUEST_SEASON_CAP,
};
export const TIP_BELOW = 70;
export const MANY_FINDS = 4;
const RANGE_BY_RECIPES = [0, 40, 70, 100] as const;

export interface ShowPanelScore extends PanelScore<ShowPanelId> {
  readonly praise: string;
  readonly tip: string | null;
}

export interface ShowcaseResult {
  readonly panels: readonly ShowPanelScore[];
  readonly latePenalty: number;
  readonly overall: number;
  readonly rosette: RosetteId;
  readonly requests: number;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export interface ShowcaseStaging {
  readonly mood: MusicMoodId;
  readonly light: RunwayLightId;
}

export interface ShowcaseContext {
  readonly season: SeasonDef;
  readonly seasonNumber: number;
  readonly late: boolean;
  readonly difficulty: DifficultyId;
  readonly rollingRails: boolean;
}

const TIPS: Readonly<Record<string, string>> = {
  craft: "Next time, try a slower, steadier seam on each piece.",
  finishing: "Next time, try two or more finishing touches on every piece.",
  theme: "Next time, try pieces that carry the season's feel.",
  leaves: "Next time, try using more of each old find.",
  finds: "Next time, try mixing more different finds across the show.",
  saved: "Next time, try a scrap patch or a saved button on each piece.",
  range: "Next time, try showing a mix of different makes.",
  cohesion: "Next time, try pieces that share a colour or two.",
  music: "Next time, try the season's own music and light.",
  flow: "Next time, try saving your strongest piece for last.",
};

function share(pieces: readonly RackPiece[], test: (piece: RackPiece) => boolean): number {
  return pieces.length === 0 ? 0 : Math.round((100 * pieces.filter(test).length) / pieces.length);
}

function panel(id: ShowPanelId, parts: SubScore[]): ShowPanelScore {
  const def = SHOW_PANELS.find((entry) => entry.id === id) ?? SHOW_PANELS[0];
  const scored = weighPanel(id, def?.name ?? id, parts);
  const score = scored.score;
  const weakest = [...parts].sort((a, b) => a.value - b.value)[0];
  const tip = score < TIP_BELOW && weakest !== undefined ? (TIPS[weakest.id] ?? null) : null;
  return { ...scored, praise: def?.praise ?? "", tip };
}

function savedBits(piece: RackPiece): boolean {
  return piece.finishes.some(
    (finish) =>
      finish.item.kind === "patch" || (finish.item.kind === "trim" && finish.item.source === "saved"),
  );
}

function craftCircle(pieces: readonly RackPiece[], season: SeasonDef): ShowPanelScore {
  const craft = average(pieces.map((piece) => piece.quality));
  const finishing = share(pieces, (piece) => piece.finishes.length >= 2);
  const theme =
    100 *
    average(
      pieces.map(
        (piece) => season.tags.filter((tag) => piece.tags.includes(tag)).length / season.tags.length,
      ),
    );
  return panel("craft-circle", [
    part("craft", "Craft", craft, 0.6, `Neat work: an average quality of ${Math.round(craft)}.`),
    part(
      "finishing",
      "Finishing touches",
      finishing,
      0.2,
      `${finishing}% of pieces wore two or more finishes.`,
    ),
    part(
      "theme",
      "Theme",
      theme,
      0.2,
      `The pieces carried ${Math.round(theme)}% of the ${season.name} feel.`,
    ),
  ]);
}

function greenThread(pieces: readonly RackPiece[]): ShowPanelScore {
  const leaves = average(pieces.map((piece) => piece.leaves));
  const finds = new Set(pieces.flatMap((piece) => piece.findIds)).size;
  const many = 100 * Math.min(1, finds / MANY_FINDS);
  const saved = share(pieces, savedBits);
  return panel("green-thread", [
    part("leaves", "Leaves", leaves, 0.5, `An average of ${Math.round(leaves)} leaves per piece.`),
    part(
      "finds",
      "Many finds",
      many,
      0.3,
      `${finds} different ${finds === 1 ? "find" : "finds"} found a new life.`,
    ),
    part("saved", "Saved bits", saved, 0.2, `${saved}% of pieces used a scrap or a saved button.`),
  ]);
}

function storyTable(
  pieces: readonly RackPiece[],
  staging: ShowcaseStaging,
  context: ShowcaseContext,
): ShowPanelScore {
  const recipes = new Set(pieces.map((piece) => piece.recipeId)).size;
  const range = RANGE_BY_RECIPES[Math.min(3, recipes)] ?? 0;
  const cohesion = pieces.length < 2 ? 100 : 100 * paletteCohesion(pieces.map((piece) => piece.colours));
  const bestMood = staging.mood === context.season.bestMood;
  const bestLight = staging.light === context.season.bestLight;
  const music = stagingScore(bestMood, bestLight);
  const flow = Math.min(
    100,
    closerStrength(pieces.map((piece) => piece.quality)) + (context.rollingRails ? ROLLING_RAILS_FLOW : 0),
  );
  return panel("story-table", [
    part(
      "range",
      "Range",
      range,
      0.3,
      `${recipes} different ${recipes === 1 ? "make" : "makes"} in the show.`,
    ),
    part(
      "cohesion",
      "Cohesion",
      cohesion,
      0.3,
      `The pieces shared ${Math.round(cohesion)}% of their colours.`,
    ),
    part(
      "music",
      "Music and light",
      music,
      0.2,
      bestMood && bestLight
        ? "The music and light suited the season perfectly."
        : "The hall enjoyed the music and lights.",
    ),
    part(
      "flow",
      "Show flow",
      flow,
      0.2,
      flow >= 100 ? "Your strongest piece closed the show." : "A lovely walk.",
    ),
  ]);
}

export function rosetteFor(overall: number): RosetteId {
  return (
    (ROSETTES.find((rosette) => overall >= rosette.minOverall) ?? ROSETTES[ROSETTES.length - 1])?.id ??
    "thank-you-ribbon"
  );
}

export function scoreShowcase(
  pieces: readonly RackPiece[],
  staging: ShowcaseStaging,
  context: ShowcaseContext,
): ShowcaseResult {
  const panels = [
    craftCircle(pieces, context.season),
    greenThread(pieces),
    storyTable(pieces, staging, context),
  ];
  const latePenalty = lateShowPenalty(context.late, context.difficulty);
  const overall = overallScore(panels, latePenalty);
  const demand = showDemand(overall, context.seasonNumber, REQUEST_TERMS);
  return {
    panels,
    latePenalty,
    overall,
    rosette: rosetteFor(overall),
    requests: demand.count,
    coins: demand.coins,
    reputation: showReputation(overall, context.difficulty),
    buzz: Math.round(overall / 4),
  };
}
