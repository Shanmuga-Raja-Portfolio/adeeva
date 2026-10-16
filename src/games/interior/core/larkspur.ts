import type { PanelScore } from "../../../engine/panelScore";
import type { CrewId, CrewJob } from "../content/crew";
import type { FloorId } from "../content/floor";
import type { HomeStoryId } from "../content/homeStory";
import type { KeyId } from "../content/openHouseKey";
import type { PaintId } from "../content/paint";
import type { HomePanelId } from "../content/panelMember";
import type { PlotId } from "../content/plot";
import type { PurposeId } from "../content/roomPurpose";
import type { TourMusicId } from "../content/tourMusic";
import type { TourTimeId } from "../content/tourTime";
import type { MakeoverRun } from "./makeoverRun";
import type { Stock } from "./stock";

export const PROJECT_STAGES = ["map", "palette", "rooms", "planner", "show", "done"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export interface HomeMap {
  readonly spaces: readonly (PurposeId | null)[];
  readonly fromAchebe: boolean;
}

export interface HomePalette {
  readonly paints: readonly PaintId[];
  readonly hallFloor: FloorId | null;
}

export interface CrewAssignment {
  readonly crewId: CrewId;
  readonly roomIndex: number;
  readonly job: CrewJob;
  readonly wage: number;
}

export interface OpenHousePlan {
  readonly tour: readonly number[];
  readonly music: TourMusicId;
  readonly time: TourTimeId;
  readonly fromAchebe: boolean;
}

export type TourChoice = Pick<OpenHousePlan, "tour" | "music" | "time">;

export type CoachedJobs = Readonly<Partial<Record<CrewJob, number>>>;

export interface Project {
  readonly startDay: number;
  readonly plotId: PlotId;
  readonly storyId: HomeStoryId;
  readonly stage: ProjectStage;
  readonly fee: number;
  readonly sister: boolean;
  readonly map: HomeMap;
  readonly palette: HomePalette;
  readonly purse: number;
  readonly added: number;
  readonly spent: number;
  readonly shelf: Stock;
  readonly rooms: readonly (MakeoverRun | null)[];
  readonly crewJobs: readonly CrewAssignment[];
  readonly coached: CoachedJobs;
  readonly plan: OpenHousePlan | null;
}

export interface CrewState {
  readonly hired: readonly CrewId[];
  readonly jobsDone: Readonly<Record<CrewId, Readonly<Record<CrewJob, number>>>>;
}

export type PlotAdvance = "next" | "sister" | "choice";

export interface PrizeLine {
  readonly label: string;
  readonly amount: number;
}

export interface OpenHouseRecord {
  readonly plotId: PlotId;
  readonly storyId: HomeStoryId;
  readonly day: number;
  readonly panels: readonly PanelScore<HomePanelId>[];
  readonly overall: number;
  readonly keyId: KeyId;
  readonly late: boolean;
  readonly auto: boolean;
  readonly notes: readonly string[];
  readonly tip: string;
  readonly prize: readonly PrizeLine[];
  readonly reputation: number;
  readonly buzz: number;
  readonly advance: PlotAdvance;
  readonly plan: OpenHousePlan;
}

export type KeyWall = Readonly<Record<PlotId, KeyId | null>>;

export interface Larkspur {
  readonly plot: number;
  readonly phase: number;
  readonly sisterNext: boolean;
  readonly choicePending: boolean;
  readonly storyOffer: readonly HomeStoryId[];
  readonly nextStartDay: number;
  readonly project: Project | null;
  readonly crew: CrewState;
  readonly keyWall: KeyWall;
  readonly history: readonly OpenHouseRecord[];
}
