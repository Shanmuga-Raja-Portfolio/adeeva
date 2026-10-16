import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { SetTemplateId } from "../content/setTemplate";
import { fairBoothByNumber, fairThemeById, isSetTemplateId, setTemplateById } from "./catalog";
import { createRun } from "./commissionRun";
import { fairBrief } from "./fairBrief";
import type { GameState } from "./gameState";
import { runStartIssue } from "./runLifecycle";
import { fairDayOf } from "./seasonCalendar";
import { floorCheck } from "./showroomFloor";
import { queueStoryTrigger } from "./storyQueue";

export const DEFAULT_SET_JOINT = "peg";

export function setStartCheck(state: GameState): ActionCheck {
  if (state.career !== "showroom" || state.showroom === null || state.fair === null)
    return actionCheck(["Sets are made in the showroom."]);
  const bench = runStartIssue(state);
  if (bench !== null) return actionCheck([bench]);
  return floorCheck(state);
}

export function startSet(state: GameState, templateId: SetTemplateId): GameState {
  const showroom = state.showroom;
  const fair = state.fair;
  if (showroom === null || fair === null || !isSetTemplateId(templateId) || !setStartCheck(state).ok)
    return state;
  const template = setTemplateById(templateId);
  const theme = showroom.themeId === null ? null : fairThemeById(showroom.themeId);
  const brief = fairBrief(
    template,
    theme,
    fairBoothByNumber(fair.booth),
    state.profile.difficulty,
    fairDayOf(showroom),
  );
  const run = createRun(`run-${state.nextRunNumber}`, null, brief, state.calendar.day, {
    kind: "set",
    setId: `set-${showroom.nextSetNumber}`,
    templateId,
    setJoint: DEFAULT_SET_JOINT,
  });
  const started: GameState = {
    ...state,
    activeRun: run,
    nextRunNumber: state.nextRunNumber + 1,
    showroom: { ...showroom, nextSetNumber: showroom.nextSetNumber + 1 },
  };
  return queueStoryTrigger(started, "first-set");
}
