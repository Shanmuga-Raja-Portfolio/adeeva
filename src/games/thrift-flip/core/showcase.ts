import { applyStanding } from "../../../engine/standing";
import { RUNWAY_LIGHTS, type RunwayLightId } from "../../adeeva/content/runwayLight";
import { MUSIC_MOODS, type MusicMoodId } from "../../../engine/musicMood";
import { SHOWCASE_LAST_DAY } from "../content/season";
import type { ShowcasePlan } from "./boutique";
import { fillShelf } from "./capsuleShelf";
import { findById, seasonById } from "./catalog";
import type { GameState } from "./gameState";
import type { RackPiece } from "./rackPiece";
import { shelfPieces } from "./rackRoom";
import { isLateShowcaseDay, isShowcaseDay, seasonDay } from "./seasonCalendar";
import { scoreShowcase, type ShowcaseResult } from "./showcaseScore";
import { queueStoryTrigger } from "./storyQueue";

export const FRESH_START_CARD = "fresh";
export const FRESH_START_LINE = "A fresh start";
const MAX_FIND_CARDS = 2;

export interface StoryCard {
  readonly id: string;
  readonly findId: RackPiece["findIds"][number] | null;
  readonly line: string;
}

export function storyCardsFor(piece: RackPiece): StoryCard[] {
  const finds = [...new Set(piece.findIds)].slice(0, MAX_FIND_CARDS).map((findId) => ({
    id: `find:${findId}`,
    findId,
    line: findById(findId).backstory,
  }));
  return [...finds, { id: FRESH_START_CARD, findId: null, line: FRESH_START_LINE }];
}

export function hallTip(
  state: GameState,
): { readonly mood: MusicMoodId; readonly light: RunwayLightId } | null {
  const boutique = state.boutique;
  if (boutique === null) return null;
  if (boutique.rosettes.length === 0 && state.profile.difficulty !== "relaxed") return null;
  const season = seasonById(boutique.season.themeId);
  return { mood: season.bestMood, light: season.bestLight };
}

function samePieces(order: readonly string[], shelf: readonly RackPiece[]): boolean {
  return (
    order.length === shelf.length &&
    shelf.every((piece) => order.includes(piece.id)) &&
    new Set(order).size === order.length
  );
}

export function showcaseIssues(state: GameState, plan: ShowcasePlan): string[] {
  const boutique = state.boutique;
  if (boutique === null) return ["The Upcycle Showcase is for the boutique."];
  if (boutique.season.showcase !== null) return ["This season's show is already done."];
  if (!isShowcaseDay(state)) return ["The hall hosts the Showcase on days 22 to 27 of the season."];
  const shelf = shelfPieces(state);
  if (shelf.length === 0) return ["Put at least one piece on the show shelf."];
  const reasons: string[] = [];
  if (!samePieces(plan.order, shelf)) reasons.push("Choose a walking order for every shelf piece.");
  if (!MUSIC_MOODS.some((mood) => mood.id === plan.mood)) reasons.push("Pick the music.");
  if (!RUNWAY_LIGHTS.some((light) => light.id === plan.light)) reasons.push("Pick the lights.");
  const cardsOk = shelf.every((piece) => {
    const card = Object.hasOwn(plan.cards, piece.id) ? plan.cards[piece.id] : undefined;
    return card !== undefined && storyCardsFor(piece).some((entry) => entry.id === card);
  });
  if (!cardsOk) reasons.push("Pick a story card for every piece.");
  return reasons;
}

export function showcaseResultFor(state: GameState, plan: ShowcasePlan): ShowcaseResult | null {
  const boutique = state.boutique;
  if (boutique === null) return null;
  const pieces = plan.order.flatMap((id) => state.rack.filter((piece) => piece.id === id));
  return scoreShowcase(pieces, plan, {
    season: seasonById(boutique.season.themeId),
    seasonNumber: boutique.season.number,
    late: isLateShowcaseDay(state),
    difficulty: state.profile.difficulty,
    rollingRails: state.upgrades.includes("rolling-rails"),
  });
}

export function stageShowcase(state: GameState, plan: ShowcasePlan): GameState {
  const boutique = state.boutique;
  if (boutique === null || showcaseIssues(state, plan).length > 0) return state;
  const result = showcaseResultFor(state, plan);
  if (result === null) return state;
  const season = boutique.season;
  const pieces = plan.order.flatMap((id) => state.rack.filter((piece) => piece.id === id));
  const shown = new Set(plan.order);
  const staged: GameState = {
    ...state,
    rack: state.rack.map((piece) =>
      shown.has(piece.id) ? { ...piece, showcaseSeason: season.number } : piece,
    ),
    boutique: {
      ...boutique,
      rosettes: [
        ...boutique.rosettes,
        { season: season.number, themeId: season.themeId, rosette: result.rosette, overall: result.overall },
      ],
      season: {
        ...season,
        capsule: [],
        showcase: {
          day: state.calendar.day,
          plan: { order: [...plan.order], mood: plan.mood, light: plan.light, cards: { ...plan.cards } },
          pieces,
          result,
        },
      },
    },
  };
  return queueStoryTrigger(
    applyStanding(staged, { coins: result.coins, reputation: result.reputation, buzz: result.buzz }),
    "showcase-done",
  );
}

export function autoPlan(state: GameState): ShowcasePlan | null {
  const boutique = state.boutique;
  if (boutique === null) return null;
  const shelf = shelfPieces(state);
  if (shelf.length === 0) return null;
  const season = seasonById(boutique.season.themeId);
  const order = [...shelf]
    .sort((a, b) => a.quality - b.quality || a.id.localeCompare(b.id))
    .map((piece) => piece.id);
  const cards = Object.fromEntries(
    shelf.map((piece) => [piece.id, storyCardsFor(piece)[0]?.id ?? FRESH_START_CARD]),
  );
  return { order, mood: season.bestMood, light: season.bestLight, cards };
}

export function autoStageShowcase(state: GameState): GameState {
  const boutique = state.boutique;
  if (boutique === null || state.profile.difficulty !== "relaxed") return state;
  if (boutique.season.showcase !== null || seasonDay(state) !== SHOWCASE_LAST_DAY) return state;
  const filled = fillShelf(state);
  const plan = autoPlan(filled);
  return plan === null ? state : stageShowcase(filled, plan);
}
