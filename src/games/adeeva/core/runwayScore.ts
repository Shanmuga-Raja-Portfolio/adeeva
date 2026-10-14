import type { DifficultyId } from "../../../engine/difficulty";
import type { RunwayLightId } from "../content/runwayLight";
import type { RunwayMoodId } from "../content/runwayMood";
import type { ShowThemeDef } from "../content/showTheme";
import type { StyleTag } from "../../../engine/styleTag";
import { average } from "../../../engine/average";
import {
  overallScore,
  panel,
  type PanelScore as EnginePanelScore,
  type SubScore,
} from "../../../engine/panelScore";
import {
  LATE_SHOW_PENALTY,
  lateShowPenalty,
  showDemand,
  showReputation,
  stagingScore,
  type ShowDemandTerms,
  type ShowSetbacks,
} from "../../../engine/showDay";
import { closerStrength as showCloser } from "../../../engine/showOrder";
import { WOW_POINTS_PER_TRIM, WOW_TAGS, wowScore } from "../../../engine/wowScore";
import { trimById } from "./catalog";
import { clamp } from "../../../engine/clamp";
import { garmentTags } from "./dressTags";
import type { FinishedLook } from "./finishedLook";
import { paletteCohesion } from "../../../engine/paletteCohesion";
import { pressQuote } from "./pressQuote";

export const PANEL_IDS = ["critics", "buyers", "audience"] as const;
export type PanelId = (typeof PANEL_IDS)[number];

export const WEARABLE_TAGS: readonly StyleTag[] = ["casual", "classic"];
export { WOW_POINTS_PER_TRIM, WOW_TAGS };
export type { SubScore };
export { LATE_SHOW_PENALTY };
export const ORDER_SCORE_FLOOR = 55;
export const ORDER_SCORE_STEP = 4;
export const ORDER_BASE_VALUE = 40;
export const ORDER_VALUE_PER_SEASON = 10;
export const ORDER_VALUE_SEASON_CAP = 5;

const ORDER_TERMS: ShowDemandTerms = {
  floor: ORDER_SCORE_FLOOR,
  step: ORDER_SCORE_STEP,
  baseValue: ORDER_BASE_VALUE,
  valuePerSeason: ORDER_VALUE_PER_SEASON,
  seasonCap: ORDER_VALUE_SEASON_CAP,
};

const RUNWAY_SETBACKS: ShowSetbacks = { relaxed: 0, standard: -1, challenging: -2 };

export interface RunwayChoice {
  readonly order: readonly number[];
  readonly mood: RunwayMoodId;
  readonly light: RunwayLightId;
}

export type PanelScore = EnginePanelScore<PanelId>;

export interface RunwayResult {
  readonly panels: readonly PanelScore[];
  readonly latePenalty: number;
  readonly overall: number;
  readonly orders: number;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly pressQuote: string;
}

export interface RunwayContext {
  readonly seasonNumber: number;
  readonly late: boolean;
  readonly difficulty: DifficultyId;
}

function share(looks: readonly FinishedLook[], test: (look: FinishedLook) => boolean): number {
  return looks.length === 0 ? 0 : looks.filter(test).length / looks.length;
}

function criticsPanel(looks: readonly FinishedLook[], theme: ShowThemeDef): PanelScore {
  const quality = Math.round(average(looks.map((look) => look.evaluation.quality.quality)));
  const themeFit = Math.round(
    100 *
      average(
        looks.map(
          (look) =>
            theme.requiredTags.filter((tag) => look.snapshot.tags.includes(tag)).length /
            theme.requiredTags.length,
        ),
      ),
  );
  const cohesion = Math.round(100 * paletteCohesion(looks.map((look) => look.snapshot.colours)));
  return panel("critics", "Critics", [
    { id: "quality", label: "Craft", value: quality, weight: 0.5, detail: `Average quality ${quality}.` },
    {
      id: "theme",
      label: "Theme",
      value: themeFit,
      weight: 0.3,
      detail: `${themeFit}% of the ${theme.requiredTags.join(" and ")} brief carried through.`,
    },
    {
      id: "cohesion",
      label: "Cohesion",
      value: cohesion,
      weight: 0.2,
      detail: `The looks share ${cohesion}% of their palette.`,
    },
  ]);
}

function buyersPanel(looks: readonly FinishedLook[], theme: ShowThemeDef): PanelScore {
  const wearable = Math.round(
    100 *
      share(looks, (look) => garmentTags(look.snapshot.design).some((tag) => WEARABLE_TAGS.includes(tag))),
  );
  const averageSpend = Math.round(average(looks.map((look) => look.snapshot.spend)));
  const cost = Math.round(clamp(100 * (1.5 - averageSpend / theme.budget), 0, 100));
  return panel("buyers", "Buyers", [
    {
      id: "wearability",
      label: "Wearability",
      value: wearable,
      weight: 0.6,
      detail: `${wearable}% of looks feel casual or classic enough to wear every day.`,
    },
    {
      id: "cost",
      label: "Sensible cost",
      value: cost,
      weight: 0.4,
      detail: `Average materials ${averageSpend} coins against a budget of ${theme.budget}.`,
    },
  ]);
}

export function closerStrength(looks: readonly FinishedLook[], order: readonly number[]): number {
  return showCloser(order.map((index) => looks[index]?.evaluation.score ?? 0));
}

export function wowTrimCount(look: FinishedLook): number {
  const trims = new Set(look.snapshot.decorations.map((decoration) => decoration.trimId));
  return [...trims].filter((trimId) => trimById(trimId).tags.some((tag) => WOW_TAGS.includes(tag))).length;
}

function audiencePanel(
  looks: readonly FinishedLook[],
  theme: ShowThemeDef,
  choice: RunwayChoice,
): PanelScore {
  const averageTrims = average(looks.map(wowTrimCount));
  const wow = wowScore(looks.map((look) => ({ wowTrims: wowTrimCount(look), tags: look.snapshot.tags })));
  const music = stagingScore(choice.mood === theme.bestMood, choice.light === theme.bestLight);
  const closer = closerStrength(looks, choice.order);
  return panel("audience", "Audience", [
    {
      id: "wow",
      label: "Wow",
      value: wow,
      weight: 0.4,
      detail: `${averageTrims.toFixed(1)} different bold, dreamy or regal trims per look.`,
    },
    {
      id: "music",
      label: "Music and light",
      value: music,
      weight: 0.3,
      detail:
        choice.mood === theme.bestMood
          ? "The music suited the theme perfectly."
          : "The music pulled a little against the theme.",
    },
    {
      id: "closer",
      label: "Show flow",
      value: closer,
      weight: 0.3,
      detail:
        closer >= 100 ? "The strongest look closed the show." : "A stronger look could have closed the show.",
    },
  ]);
}

export function scoreRunway(
  looks: readonly FinishedLook[],
  theme: ShowThemeDef,
  choice: RunwayChoice,
  context: RunwayContext,
): RunwayResult {
  const panels = [criticsPanel(looks, theme), buyersPanel(looks, theme), audiencePanel(looks, theme, choice)];
  const latePenalty = lateShowPenalty(context.late, context.difficulty);
  const overall = overallScore(panels, latePenalty);
  const demand = showDemand(overall, context.seasonNumber, ORDER_TERMS);
  return {
    panels,
    latePenalty,
    overall,
    orders: demand.count,
    coins: demand.coins,
    reputation: showReputation(overall, context.difficulty, RUNWAY_SETBACKS),
    buzz: Math.round(overall / 4),
    pressQuote: pressQuote(overall, theme.name),
  };
}
