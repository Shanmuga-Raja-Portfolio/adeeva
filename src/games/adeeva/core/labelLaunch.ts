import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { GameState } from "./gameState";
import { beginSeason } from "./seasonFlow";
import { queueStoryTrigger } from "./storyQueue";

export const LAUNCH_REPUTATION = 40;
export const LAUNCH_GIGS_DELIVERED = 8;

export function canLaunchLabel(state: GameState): ActionCheck {
  if (state.profile.career !== "student") return actionCheck(["You already run a label."]);
  const reasons: string[] = [];
  if (state.reputation < LAUNCH_REPUTATION) reasons.push(`Reach reputation ${LAUNCH_REPUTATION}.`);
  if (state.gigsDelivered < LAUNCH_GIGS_DELIVERED)
    reasons.push(`Deliver ${LAUNCH_GIGS_DELIVERED - state.gigsDelivered} more gigs.`);
  return actionCheck(reasons);
}

export function launchLabel(state: GameState): GameState {
  if (!canLaunchLabel(state).ok) return state;
  const launched = queueStoryTrigger(
    {
      ...state,
      profile: { ...state.profile, career: "label" },
      gigs: { ...state.gigs, offers: [] },
    },
    "label-launched",
  );
  return beginSeason(launched, null) ?? state;
}
