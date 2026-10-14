import {
  CLEAN_PASS_STREAK,
  COMMUNITY_ORDERS,
  PATH_AWARDS,
  type AwardId,
  type PathAwardId,
} from "../content/award";
import { clientById } from "./catalog";
import type { GameState } from "./gameState";
import { recordMoney, withPath, type PathState } from "./path";
import type { Reward } from "./rewards";
import { queueStoryTrigger } from "./storyQueue";

function withAward(awards: readonly AwardId[], award: AwardId): readonly AwardId[] {
  return awards.includes(award) ? awards : [...awards, award];
}

export function holdsAllPathAwards(path: PathState): boolean {
  return PATH_AWARDS[path.kind].every((award) => path.awards.includes(award));
}

export function finishChapter(state: GameState): GameState {
  const path = state.path;
  if (path === null || path.finished) return state;
  const trigger =
    path.kind === "restaurant"
      ? "three-path-awards"
      : path.kind === "truck"
        ? "three-ribbons-eight-festivals"
        : "book-launched";
  return queueStoryTrigger(withPath(state, { ...path, finished: true }), trigger);
}

export function grantPathAward(state: GameState, award: PathAwardId): GameState {
  const path = state.path;
  if (path === null || !PATH_AWARDS[path.kind].includes(award) || path.awards.includes(award)) return state;
  const earned: PathState = { ...path, awards: [...path.awards, award] };
  const granted: GameState = { ...withPath(state, earned), awards: withAward(state.awards, award) };
  if (!holdsAllPathAwards(earned)) return granted;
  const ladle = queueStoryTrigger(
    { ...granted, awards: withAward(granted.awards, "larkspur-ladle") },
    "larkspur-ladle",
  );
  return earned.kind === "restaurant" ? finishChapter(ladle) : ladle;
}

export function noteCleanService(state: GameState, clean: boolean): GameState {
  const path = state.path;
  if (path === null) return state;
  const cleanStreak = clean ? path.cleanStreak + 1 : 0;
  const counted = withPath(state, { ...path, cleanStreak });
  return cleanStreak >= CLEAN_PASS_STREAK ? grantPathAward(counted, "clean-pass") : counted;
}

export function notePathOrder(state: GameState, clientId: string, reward: Reward): GameState {
  const path = state.path;
  if (path === null) return state;
  const booked = recordMoney(state, "bookings", reward.coins);
  const community = clientById(clientId)?.community === true && reward.outcome === "pass";
  const bookedPath = booked.path;
  if (!community || bookedPath === null) return booked;
  const counted = withPath(booked, { ...bookedPath, community: bookedPath.community + 1 });
  return bookedPath.community + 1 >= COMMUNITY_ORDERS ? grantPathAward(counted, "community-table") : counted;
}
