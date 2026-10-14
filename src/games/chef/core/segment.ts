import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import { drawDistinct } from "../../../engine/rngDraw";
import { sameList } from "../../../engine/sameList";
import { starsForScore } from "../../../engine/score";
import { applyStanding } from "../../../engine/standing";
import { weekNumber } from "../../../engine/weekday";
import { PATH_RULES } from "../content/career";
import { CUE_KINDS, type CueKind } from "../content/cueCard";
import type { DishDef } from "../content/dish";
import { LETTERS } from "../content/letter";
import { cueCardById, difficultyById, dishById, isDishId } from "./catalog";
import type { DishRun, SegmentCard } from "./dishRun";
import type { GameState } from "./gameState";
import { isTipChoice } from "./tipChoice";
import { appendLog } from "./log";
import { addMastery, isDishUnlocked } from "./mastery";
import { noteCleanService } from "./pathAwards";
import { recordMoney, tvOf, withPath, type SegmentPrep, type SegmentReport, type TvState } from "./path";
import { dishTags, masteryGain, settleChefReward, STRONG_STARS } from "./rewards";
import { CLEAN_STARS } from "./serviceScore";
import { OPEN_BRIEF, runStartIssue, withRun } from "./runLifecycle";
import { onClockShare, studioSeconds } from "./studioClock";
import { queueStoryTrigger } from "./storyQueue";

export const QUALITY_WEIGHT = 0.6;
export const CLARITY_WEIGHT = 0.25;
export const CLOCK_WEIGHT = 0.15;

export function cueSequence(dish: DishDef): CueKind[] {
  const first = dish.steps.find((step) => step.kind !== "taste" && step.kind !== "plate");
  const last = dish.steps.some((step) => step.kind === "taste") ? "taste" : "plate";
  return first === undefined ? ["ready", last] : ["ready", first.kind, last];
}

export function segmentsUsed(tv: TvState, day: number): number {
  return tv.segmentWeek === weekNumber(day) ? tv.segmentsThisWeek : 0;
}

export function segmentDeskIssue(state: GameState): string | null {
  const tv = tvOf(state);
  if (tv === null) return "Only the studio kitchen makes segments.";
  if (tv.prep !== null) return "Finish the segment you are preparing first.";
  if (segmentsUsed(tv, state.calendar.day) >= PATH_RULES.segmentsPerWeek)
    return "Two segments a week is plenty. Producer Mo says rest!";
  return runStartIssue(state) ?? hoursShortfallReason(state.calendar, PATH_RULES.segmentPrepHours);
}

export function segmentPrepIssue(state: GameState, dishId: string): string | null {
  const desk = segmentDeskIssue(state);
  if (desk !== null) return desk;
  return isDishId(dishId) && isDishUnlocked(state.mastery, dishById(dishId))
    ? null
    : "Pick a dish you have unlocked.";
}

function shuffledDeck(cues: readonly CueKind[], state: GameState): [CueKind[], GameState] {
  const [deck, rng] = drawDistinct(state.rng, cues, cues.length);
  const same = sameList(deck, cues);
  return [same ? [...deck.slice(1), ...deck.slice(0, 1)] : deck, { ...state, rng }];
}

export function prepSegment(state: GameState, dishId: string): GameState {
  const tv = tvOf(state);
  if (tv === null || !isDishId(dishId) || segmentPrepIssue(state, dishId) !== null) return state;
  const spent = spendHours(state, PATH_RULES.segmentPrepHours);
  if (spent === null) return state;
  const cues = cueSequence(dishById(dishId));
  const [deck, shuffled] = shuffledDeck(cues, spent);
  const prep: SegmentPrep = { dishId, cues, deck, order: [], tips: cues.map(() => null) };
  return withPath(shuffled, { ...tv, prep });
}

function withPrep(state: GameState, change: (prep: SegmentPrep) => SegmentPrep): GameState {
  const tv = tvOf(state);
  if (tv === null || tv.prep === null) return state;
  const prep = change(tv.prep);
  return prep === tv.prep ? state : withPath(state, { ...tv, prep });
}

export function placeCue(state: GameState, cue: string): GameState {
  return withPrep(state, (prep) => {
    const known = CUE_KINDS.find((kind) => kind === cue);
    if (known === undefined || !prep.deck.includes(known) || prep.order.includes(known)) return prep;
    return { ...prep, order: [...prep.order, known] };
  });
}

export function clearCues(state: GameState): GameState {
  return withPrep(state, (prep) => (prep.order.length === 0 ? prep : { ...prep, order: [] }));
}

export function pickTip(state: GameState, index: number, tip: number): GameState {
  return withPrep(state, (prep) => {
    if (!Number.isInteger(index) || index < 0 || index >= prep.cues.length) return prep;
    if (!isTipChoice(tip) || prep.tips[index] === tip) return prep;
    return { ...prep, tips: prep.tips.map((entry, position) => (position === index ? tip : entry)) };
  });
}

export function dropSegment(state: GameState): GameState {
  const tv = tvOf(state);
  if (tv === null || tv.prep === null) return state;
  return withPath(state, { ...tv, prep: null });
}

export function kindTipCount(prep: SegmentPrep): number {
  return prep.cues.filter((cue, index) => {
    const tip = prep.tips[index];
    return tip !== null && tip !== undefined && cueCardById(cue).tips[tip]?.kind === true;
  }).length;
}

export function cuesInOrder(prep: SegmentPrep): boolean {
  return sameList(prep.order, prep.cues);
}

export function startSegmentIssues(state: GameState): string[] {
  const tv = tvOf(state);
  const prep = tv?.prep ?? null;
  if (tv === null || prep === null) return ["Prepare a segment first."];
  const issues: string[] = [];
  if (prep.order.length < prep.cues.length) issues.push("Put all the cue cards in order.");
  if (prep.tips.some((tip) => tip === null)) issues.push("Pick a tip for every card.");
  if (segmentsUsed(tv, state.calendar.day) >= PATH_RULES.segmentsPerWeek)
    issues.push("Two segments a week is plenty.");
  const busy = runStartIssue(state) ?? hoursShortfallReason(state.calendar, PATH_RULES.segmentHours);
  if (busy !== null) issues.push(busy);
  return issues;
}

export function startSegment(state: GameState): GameState {
  const tv = tvOf(state);
  const prep = tv?.prep ?? null;
  if (tv === null || prep === null || startSegmentIssues(state).length > 0) return state;
  const day = state.calendar.day;
  const counted = withPath(state, {
    ...tv,
    prep: null,
    segmentWeek: weekNumber(day),
    segmentsThisWeek: segmentsUsed(tv, day) + 1,
  });
  return withRun(
    counted,
    {
      kind: "segment",
      cards: prep.order.map((cue) => ({ cue, tip: prep.tips[prep.cues.indexOf(cue)] ?? 0 })),
      cueRight: cuesInOrder(prep),
      kindTips: kindTipCount(prep),
    },
    prep.dishId,
    OPEN_BRIEF,
    PATH_RULES.segmentHours,
  );
}

export interface KinderTip {
  readonly cue: CueKind;
  readonly label: string;
  readonly text: string;
}

export function kinderTips(cards: readonly SegmentCard[]): KinderTip[] {
  return cards.flatMap((card) => {
    const def = cueCardById(card.cue);
    const kind = def.tips.find((tip) => tip.kind);
    return def.tips[card.tip]?.kind === true || kind === undefined
      ? []
      : [{ cue: card.cue, label: def.label, text: kind.text }];
  });
}

export function segmentScore(quality: number, clarity: number, onClock: number): number {
  return Math.round(quality * (QUALITY_WEIGHT + CLARITY_WEIGHT * clarity + CLOCK_WEIGHT * onClock));
}

function nextLetter(tv: TvState): string | null {
  return LETTERS.find((letter) => !tv.letters.includes(letter.id))?.id ?? null;
}

export function finishSegment(state: GameState, run: DishRun, quality: number): GameState {
  const tv = tvOf(state);
  if (tv === null || run.purpose.kind !== "segment" || run.plated === null) return state;
  const dish = dishById(run.dishId);
  const clarity = (run.purpose.cueRight ? 0.5 : 0) + (0.5 * run.purpose.kindTips) / 3;
  const clockSeconds = studioSeconds(run, dish);
  const onClock = onClockShare(clockSeconds, state.profile.difficulty);
  const score = segmentScore(quality, clarity, onClock);
  const stars = starsForScore(score);
  const strong = stars >= STRONG_STARS;
  const dishStars = starsForScore(quality);
  const letterId = strong ? nextLetter(tv) : null;
  const reward = settleChefReward(state, {
    passed: score >= PATH_RULES.segmentMinimum + difficultyById(state.profile.difficulty).minQualityBonus,
    score,
    stars,
    fee: PATH_RULES.segmentBaseFee + PATH_RULES.segmentStarFee * stars,
    late: false,
    tags: dishTags([dish]),
    colourCount: run.plated.result.colourCount,
  });
  const report: SegmentReport = {
    dishId: run.dishId,
    day: state.calendar.day,
    quality,
    clarity: Math.round(clarity * 100) / 100,
    onClock,
    clockSeconds,
    score,
    stars,
    letterId,
  };
  const gain = masteryGain(dishStars);
  const noted = withPath(addMastery(state, dish.cuisine, gain), {
    ...tv,
    lastSegment: report,
    strongSegments: tv.strongSegments + (strong ? 1 : 0),
    letters: letterId === null ? tv.letters : [...tv.letters, letterId],
  });
  const updated = noteTested(noted, run, quality);
  const logged: GameState = {
    ...updated,
    log: appendLog(updated.log, {
      kind: "dish",
      runId: run.id,
      day: state.calendar.day,
      dishId: run.dishId,
      purpose: "segment",
      quality,
      stars: dishStars,
      evaluation: null,
      reward,
      mastery: gain,
    }),
  };
  const paid = recordMoney(applyStanding(logged, reward), "shows", reward.coins);
  const lettered =
    letterId !== null && tv.letters.length === 0 ? queueStoryTrigger(paid, "first-letter") : paid;
  return noteCleanService(lettered, dishStars >= CLEAN_STARS);
}

export function noteTested(state: GameState, run: DishRun, quality: number): GameState {
  const tv = tvOf(state);
  if (tv === null || starsForScore(quality) < STRONG_STARS || tv.tested.includes(run.dishId)) return state;
  return withPath(state, { ...tv, tested: [...tv.tested, run.dishId] });
}
