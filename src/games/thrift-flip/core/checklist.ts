import { colourById, type ColourId } from "../../../engine/palette";
import { findById } from "./catalog";
import {
  constructionGap,
  flipSpend,
  placedForRequirement,
  requirementKey,
  requirementName,
} from "./flipEvaluate";
import { flipQuality } from "./flipQuality";
import { flipColours, flipTags, mainFind } from "./flipTags";
import { stageIndex } from "./flipStage";
import type { GameState } from "./gameState";
import { runHasStage } from "./runStages";
import { leavesOf } from "./sustainability";

export type ChecklistStatus = "met" | "unmet" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: ChecklistStatus;
}

function names(ids: readonly ColourId[]): string {
  return ids.map((id) => colourById(id).name).join(", ");
}

export function checklist(state: GameState): ChecklistItem[] {
  const run = state.activeRun;
  const brief = run?.brief ?? null;
  if (run === null || brief === null) return [];
  const tags = flipTags(run);
  const colours = flipColours(run);
  const chosen = run.finds.length > 0;
  const finishing = stageIndex(run.stage) >= stageIndex("finish");
  const items: ChecklistItem[] = brief.requiredTags.map((tag) => ({
    id: `tag-${tag}`,
    label: `Feels ${tag}`,
    status: tags.includes(tag) ? "met" : finishing ? "unmet" : "pending",
  }));
  if (brief.avoidColours.length > 0) {
    const clash = colours.some((colour) => brief.avoidColours.includes(colour));
    items.push({
      id: "avoid-colours",
      label: `No ${names(brief.avoidColours)}`,
      status: clash ? "unmet" : chosen ? "met" : "pending",
    });
  }
  if (brief.avoidMaterials.length > 0) {
    const main = mainFind(run);
    const clash = main !== null && brief.avoidMaterials.includes(findById(main.findId).material);
    items.push({
      id: "avoid-materials",
      label: `No ${brief.avoidMaterials.join(", ")}`,
      status: clash ? "unmet" : chosen ? "met" : "pending",
    });
  }
  if (brief.favouredColours.length > 0)
    items.push({
      id: "favoured-colours",
      label: `Bonus for ${names(brief.favouredColours)}`,
      status: colours.some((colour) => brief.favouredColours.includes(colour)) ? "met" : "pending",
    });
  for (const requirement of brief.requiredFinishes) {
    const placed = placedForRequirement(run, requirement);
    items.push({
      id: `finish-${requirementKey(requirement)}`,
      label: `${requirementName(requirement)} ${Math.min(placed, requirement.count)}/${requirement.count}`,
      status: placed >= requirement.count ? "met" : finishing ? "unmet" : "pending",
    });
  }
  const spend = flipSpend(run);
  items.push({
    id: "budget",
    label: `Budget ${spend}/${brief.budget} coins`,
    status: spend <= brief.budget ? "met" : "unmet",
  });
  items.push({
    id: "deadline",
    label: `Due day ${brief.deadlineDay}`,
    status: state.calendar.day <= brief.deadlineDay ? "met" : "unmet",
  });
  const gap = constructionGap(run);
  const built =
    gap.stitchLines === 0 && gap.pieces === 0 && gap.seams === 0 && (run.cutDone || !runHasStage(run, "cut"));
  const quality = flipQuality(state, run).quality;
  items.push({
    id: "quality",
    label: built ? `Quality ${quality}/${brief.minQuality}` : `Quality at least ${brief.minQuality}`,
    status: built ? (quality >= brief.minQuality ? "met" : "unmet") : "pending",
  });
  if (brief.minLeaves > 0) {
    const leaves = leavesOf(run, state.upgrades.includes("sharp-ripper")).leaves;
    items.push({
      id: "leaves",
      label: run.cutDone ? `Leaves ${leaves}/${brief.minLeaves}` : `Leaves at least ${brief.minLeaves}`,
      status: run.cutDone ? (leaves >= brief.minLeaves ? "met" : "unmet") : "pending",
    });
  }
  return items;
}
