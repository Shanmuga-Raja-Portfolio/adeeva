import type { ColourId } from "../../../engine/palette";
import type { PlacedPose } from "../../../engine/placedPose";
import type { SeamProgress } from "../../adeeva/core/dressRun";
import type { TrimId } from "../../adeeva/content/trim";
import type { MarkId, PatchId } from "../content/finish";
import type { Brief } from "./brief";
import { EMPTY_DESIGN, type Design } from "./design";
import type { FlipStage } from "./flipStage";
import type { OwnedFind } from "./ownedFind";
import type { Placement } from "./placement";
import type { Scrap } from "./scrap";

export type FlipPurpose = { readonly kind: "gig"; readonly gigId: string } | { readonly kind: "own" };

export interface UnpickLine {
  readonly popped: readonly number[];
  readonly snagsAt: readonly number[];
  readonly attempts: number;
  readonly assisted: boolean;
}

export interface StainWork {
  readonly cellTicks: readonly number[];
  readonly harshTicks: number;
  readonly scrubTicks: number;
}

export type TrimSource = "saved" | "new";

export type FinishItem =
  | { readonly kind: "trim"; readonly trimId: TrimId; readonly source: TrimSource }
  | { readonly kind: "patch"; readonly patchId: PatchId; readonly scrap: Scrap }
  | { readonly kind: "mark"; readonly markId: MarkId; readonly colour: ColourId | null };

export type FinishPose = PlacedPose;

export interface PlacedFinish extends FinishPose {
  readonly id: string;
  readonly item: FinishItem;
}

export interface FlipRun {
  readonly id: string;
  readonly purpose: FlipPurpose;
  readonly brief: Brief | null;
  readonly stage: FlipStage;
  readonly reachedStage: FlipStage;
  readonly startedDay: number;
  readonly design: Design;
  readonly finds: readonly OwnedFind[];
  readonly unpick: Readonly<Record<string, UnpickLine>>;
  readonly clean: Readonly<Record<string, StainWork>>;
  readonly soaked: boolean;
  readonly placements: Readonly<Record<string, Placement>>;
  readonly autoLaid: boolean;
  readonly cutTraces: Readonly<Record<string, number>>;
  readonly cutAccuracy: Readonly<Record<string, number>>;
  readonly cutDone: boolean;
  readonly seams: Readonly<Record<string, SeamProgress>>;
  readonly finishes: readonly PlacedFinish[];
  readonly nextFinishNumber: number;
}

export function lineKey(findKey: string, line: number): string {
  return `${findKey}#${line}`;
}

export function stainKey(findKey: string, stainId: string): string {
  return `${findKey}#${stainId}`;
}

export function createFlipRun(id: string, purpose: FlipPurpose, brief: Brief | null, day: number): FlipRun {
  const stage: FlipStage = purpose.kind === "gig" ? "brief" : "design";
  return {
    id,
    purpose,
    brief,
    stage,
    reachedStage: stage,
    startedDay: day,
    design: EMPTY_DESIGN,
    finds: [],
    unpick: {},
    clean: {},
    soaked: false,
    placements: {},
    autoLaid: false,
    cutTraces: {},
    cutAccuracy: {},
    cutDone: false,
    seams: {},
    finishes: [],
    nextFinishNumber: 1,
  };
}
