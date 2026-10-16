import type { HomeStoryDef } from "../../../content/homeStory";
import type { PlotDef } from "../../../content/plot";
import type { PurposeDef } from "../../../content/roomPurpose";
import {
  homeStoryById,
  plotById,
  purposeById,
  type GameState,
  type MakeoverRun,
  type Project,
} from "../../../core";

export interface HomeRoomContext {
  readonly purpose: PurposeDef;
  readonly plot: PlotDef;
  readonly story: HomeStoryDef;
  readonly project: Project;
}

export function homeRoomContext(state: GameState, run: MakeoverRun): HomeRoomContext | null {
  const project = state.larkspur?.project ?? null;
  if (run.purpose.kind !== "home-room" || project === null) return null;
  return {
    purpose: purposeById(run.purpose.purposeId),
    plot: plotById(run.purpose.plotId),
    story: homeStoryById(project.storyId),
    project,
  };
}
