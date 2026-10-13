import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";
import { canLaunchLabel, launchLabel } from "./labelLaunch";
import { completeBeat } from "./storyQueue";

export function chooseStoryOption(state: GameState, beatId: string, choiceId: string): GameState {
  if (!state.story.queue.includes(beatId)) return state;
  const choice = storyBeatById(beatId)?.choices.find((entry) => entry.id === choiceId);
  if (choice === undefined) return state;
  if (choice.effect === "launch-label" && !canLaunchLabel(state).ok) return state;
  const chosen = completeBeat(state, beatId, choice.setsFlag);
  return choice.effect === "launch-label" ? launchLabel(chosen) : chosen;
}
