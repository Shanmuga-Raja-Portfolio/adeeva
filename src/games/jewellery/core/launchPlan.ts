import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { MUSIC_MOODS } from "../../../engine/musicMood";
import { overallScore } from "../../../engine/panelScore";
import { lateShowPenalty } from "../../../engine/showDay";
import { applyStanding } from "../../../engine/standing";
import { starsForScore } from "../../../engine/score";
import { LANTERN_COLOURS } from "../content/lanternColour";
import { awardById, launchThemeById, optionById, productById } from "./catalog";
import type { CollectionState } from "./collectionState";
import type { GameState } from "./gameState";
import { addKeepsakes, type KeepsakeEntry } from "./keepsakeCase";
import { atLeast, everyLanternGold, garlandGlows, hangLantern } from "./lanternGarland";
import { LATE_LAUNCH_HOURS } from "./launchEndDay";
import { launchKeepsakeId } from "./launchedSlots";
import { launchPanels, launchTip } from "./launchPanels";
import { biggerSpot, launchPrize } from "./launchPrize";
import type { LaunchPlan, LaunchResult, LaunchState } from "./launchState";
import { launchReady } from "./launchStatus";
import { isLanternNight, isPopupDay, loftCollection } from "./seasonCalendar";
import { keepBenchStones, returnPotStones } from "./stonePot";
import { queueStoryTrigger } from "./storyQueue";

const CARDS = 3;

function launchCollection(state: GameState): CollectionState | null {
  const collection = loftCollection(state);
  if (collection === null || state.launch === null || collection.themeId === null) return null;
  return launchReady(state, collection) ? collection : null;
}

export function launchDayKind(state: GameState): "night" | "late" | null {
  if (isLanternNight(state, state.calendar.day)) return "night";
  return isPopupDay(state, state.calendar.day) ? "late" : null;
}

export function planIssue(collection: CollectionState, plan: LaunchPlan): string | null {
  const ids = collection.pieces.map((piece) => piece.id);
  const order = plan.order;
  if (
    order.length !== ids.length ||
    new Set(order).size !== order.length ||
    !order.every((id) => ids.includes(id))
  )
    return "Put every finished piece in the reveal order.";
  if (!LANTERN_COLOURS.some((lantern) => lantern.id === plan.lantern)) return "Pick a lantern colour.";
  if (!MUSIC_MOODS.some((music) => music.id === plan.music)) return "Pick the music.";
  if (!Number.isInteger(plan.card) || plan.card < 0 || plan.card >= CARDS) return "Pick a story card.";
  return null;
}

export function canStageLaunch(state: GameState, plan: LaunchPlan): ActionCheck {
  const collection = launchCollection(state);
  const kind = launchDayKind(state);
  if (collection === null || kind === null) return actionCheck(["The stage opens on Lantern Night."]);
  const issue = planIssue(collection, plan);
  if (issue !== null) return actionCheck([issue]);
  const needed = kind === "late" ? LATE_LAUNCH_HOURS : 1;
  if (state.calendar.hoursLeft < needed)
    return actionCheck([`Staging the Launch takes ${needed} ${needed === 1 ? "hour" : "hours"}.`]);
  return actionCheck([]);
}

export function launchResultFor(
  state: GameState,
  collection: CollectionState,
  plan: LaunchPlan,
  late: boolean,
): LaunchResult | null {
  const launch = state.launch;
  if (launch === null || collection.themeId === null || collection.brief === null) return null;
  const theme = launchThemeById(collection.themeId);
  const panels = launchPanels({
    theme,
    pieces: collection.pieces,
    pages: collection.lookbook.pages,
    plan,
    finish: collection.brief.finish,
  });
  const latePenalty = lateShowPenalty(late, state.profile.difficulty);
  const overall = overallScore(panels, latePenalty);
  const prize = launchPrize(overall, launch.spot, state.profile.difficulty);
  return {
    day: state.calendar.day,
    seasonNumber: collection.seasonNumber,
    themeId: theme.id,
    spot: launch.spot,
    plan: { ...plan, order: [...plan.order] },
    panels,
    latePenalty,
    overall,
    award: prize.award,
    coins: prize.coins,
    reputation: prize.reputation,
    buzz: prize.buzz,
    tip: launchTip(panels),
    spotAfter: prize.spotAfter,
  };
}

function launchKeepsakes(collection: CollectionState, result: LaunchResult): KeepsakeEntry[] {
  const award = awardById(result.award);
  return result.plan.order.flatMap((id) => {
    const piece = collection.pieces.find((entry) => entry.id === id);
    if (piece === undefined) return [];
    const motif = collection.brief === null ? "" : ` · ${optionById(collection.brief.motif).name} motif`;
    return [
      {
        id: launchKeepsakeId(piece.id, result.seasonNumber),
        day: result.day,
        source: { kind: "collection", themeId: result.themeId, award: result.award },
        look: piece.look,
        stars: starsForScore(piece.quality),
        line: `${productById(piece.look.productId).name}${motif} · ${award.name}`,
      },
    ];
  });
}

function launchStories(
  state: GameState,
  before: LaunchState,
  after: LaunchState,
  result: LaunchResult,
): GameState {
  let next = queueStoryTrigger(state, "first-launch");
  if (atLeast(result.award, "gold-lantern")) next = queueStoryTrigger(next, "gold-lantern");
  if (result.spotAfter === 3 && before.spot < 3) next = queueStoryTrigger(next, "spot-stage");
  if (result.spotAfter === 4 && before.spot < 4) next = queueStoryTrigger(next, "spot-grand");
  if (garlandGlows(after.garland)) next = queueStoryTrigger(next, "lantern-garland");
  if (everyLanternGold(after.garland)) next = queueStoryTrigger(next, "every-lantern-gold");
  return next;
}

export function stageLaunch(state: GameState, plan: LaunchPlan): GameState {
  const collection = launchCollection(state);
  const launch = state.launch;
  const kind = launchDayKind(state);
  if (collection === null || launch === null || kind === null || !canStageLaunch(state, plan).ok)
    return state;
  const result = launchResultFor(state, collection, plan, kind === "late");
  if (result === null) return state;
  const prize = launchPrize(result.overall, launch.spot, state.profile.difficulty);
  const after: LaunchState = {
    ...launch,
    spot: result.spotAfter,
    spotOffer: prize.spotOffer,
    result,
    garland: hangLantern(launch.garland, result.themeId, result.award),
    awardsBySeason: { ...launch.awardsBySeason, [String(result.seasonNumber)]: result.award },
  };
  const hours = kind === "late" ? state.calendar.hoursLeft - LATE_LAUNCH_HOURS : 0;
  const staged: GameState = {
    ...state,
    calendar: { ...state.calendar, hoursLeft: hours },
    stock: returnPotStones(state.stock, collection.stonePot),
    keepsakes: addKeepsakes(state.keepsakes, launchKeepsakes(collection, result)),
    collection: { ...collection, lineSheets: [] },
    launch: after,
  };
  const paid = applyStanding(keepBenchStones(staged), {
    coins: result.coins,
    reputation: result.reputation,
    buzz: result.buzz,
  });
  return launchStories(paid, launch, after, result);
}

export function canMoveSpot(state: GameState): ActionCheck {
  const launch = state.launch;
  if (state.career !== "collection" || launch === null || !launch.spotOffer)
    return actionCheck(["There's no bigger spot on offer."]);
  return actionCheck([]);
}

export function moveSpot(state: GameState): GameState {
  const launch = state.launch;
  if (launch === null || !canMoveSpot(state).ok) return state;
  const spot = biggerSpot(launch.spot);
  const next: GameState = { ...state, launch: { ...launch, spot, spotOffer: false } };
  if (spot === 3) return queueStoryTrigger(next, "spot-stage");
  return spot === 4 ? queueStoryTrigger(next, "spot-grand") : next;
}
