import type { DifficultyId } from "../../../engine/difficulty";
import type { RunwayLightId } from "../content/runwayLight";
import type { RunwayMoodId } from "../content/runwayMood";
import type { ShowThemeDef } from "../content/showTheme";
import type { StyleTag } from "../../../engine/styleTag";
import { average } from "../../../engine/average";
import { trimById } from "./catalog";
import { clamp } from "../../../engine/clamp";
import { garmentTags } from "./dressTags";
import type { FinishedLook } from "./finishedLook";
import { paletteCohesion } from "./paletteCohesion";
import { pressQuote } from "./pressQuote";

export const PANEL_IDS = ["critics", "buyers", "audience"] as const;
export type PanelId = (typeof PANEL_IDS)[number];

export const WEARABLE_TAGS: readonly StyleTag[] = ["casual", "classic"];
export const WOW_TAGS: readonly StyleTag[] = ["bold", "dreamy", "regal"];
export const WOW_POINTS_PER_TRIM = 25;
export const LATE_SHOW_PENALTY = 10;
export const ORDER_SCORE_FLOOR = 55;
export const ORDER_SCORE_STEP = 4;
export const ORDER_BASE_VALUE = 40;
export const ORDER_VALUE_PER_SEASON = 10;
export const ORDER_VALUE_SEASON_CAP = 5;

export interface RunwayChoice {
  readonly order: readonly number[];
  readonly mood: RunwayMoodId;
  readonly light: RunwayLightId;
}

export interface SubScore {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly weight: number;
  readonly detail: string;
}

export interface PanelScore {
  readonly id: PanelId;
  readonly label: string;
  readonly score: number;
  readonly parts: readonly SubScore[];
}

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

function panel(id: PanelId, label: string, parts: SubScore[]): PanelScore {
  const score = Math.round(parts.reduce((sum, part) => sum + part.value * part.weight, 0));
  return { id, label, score: clamp(score, 0, 100), parts };
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

function closerStrength(looks: readonly FinishedLook[], order: readonly number[]): number {
  const scores = order.map((index) => looks[index]?.evaluation.score ?? 0);
  const best = Math.max(0, ...scores);
  const opener = scores[0] ?? 0;
  const middle = scores[1] ?? 0;
  const closer = scores[scores.length - 1] ?? 0;
  const closing = best === 0 ? 100 : (100 * closer) / best;
  const opening = opener >= middle ? 100 : 60;
  return Math.round(0.7 * closing + 0.3 * opening);
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
  const wow = Math.round(
    0.5 * clamp(averageTrims * WOW_POINTS_PER_TRIM, 0, 100) +
      50 * share(looks, (look) => look.snapshot.tags.some((tag) => WOW_TAGS.includes(tag))),
  );
  const music = (choice.mood === theme.bestMood ? 70 : 20) + (choice.light === theme.bestLight ? 30 : 10);
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

function seasonReputation(overall: number, difficulty: DifficultyId): number {
  if (overall >= 50) return Math.round((overall - 40) / 6);
  if (difficulty === "relaxed") return 0;
  return difficulty === "challenging" ? -2 : -1;
}

export function scoreRunway(
  looks: readonly FinishedLook[],
  theme: ShowThemeDef,
  choice: RunwayChoice,
  context: RunwayContext,
): RunwayResult {
  const panels = [criticsPanel(looks, theme), buyersPanel(looks, theme), audiencePanel(looks, theme, choice)];
  const latePenalty = context.late && context.difficulty !== "relaxed" ? LATE_SHOW_PENALTY : 0;
  const overall = clamp(Math.round(average(panels.map((entry) => entry.score))) - latePenalty, 0, 100);
  const orders = Math.max(0, Math.round((overall - ORDER_SCORE_FLOOR) / ORDER_SCORE_STEP));
  const orderValue =
    ORDER_BASE_VALUE + ORDER_VALUE_PER_SEASON * (Math.min(context.seasonNumber, ORDER_VALUE_SEASON_CAP) - 1);
  return {
    panels,
    latePenalty,
    overall,
    orders,
    coins: orders * orderValue,
    reputation: seasonReputation(overall, context.difficulty),
    buzz: Math.round(overall / 4),
    pressQuote: pressQuote(overall, theme.name),
  };
}
