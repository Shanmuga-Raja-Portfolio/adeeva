import { colourById, type ColourId } from "../../../engine/palette";
import { trimById } from "./catalog";
import { dressQuality } from "./dressQuality";
import { isConstructionComplete, snapshotRun } from "./dressSnapshot";
import type { GameState } from "./gameState";
import { stageIndex } from "./runStage";

export type ChecklistStatus = "met" | "unmet" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: ChecklistStatus;
}

function colourNames(ids: readonly ColourId[]): string {
  return ids.map((id) => colourById(id).name).join(", ");
}

export function checklist(state: GameState): ChecklistItem[] {
  const run = state.activeRun;
  if (run === null) return [];
  const { brief } = run;
  const snapshot = snapshotRun(run);
  const designed = snapshot.colours.length > 0;
  const decorating = stageIndex(run.stage) >= stageIndex("decorate");
  const items: ChecklistItem[] = brief.requiredTags.map((tag) => ({
    id: `tag-${tag}`,
    label: `Feels ${tag}`,
    status: snapshot.tags.includes(tag) ? "met" : designed ? "unmet" : "pending",
  }));
  if (brief.avoidColours.length > 0) {
    const clash = snapshot.colours.some((colour) => brief.avoidColours.includes(colour));
    items.push({
      id: "avoid-colours",
      label: `Avoid ${colourNames(brief.avoidColours)}`,
      status: clash ? "unmet" : designed ? "met" : "pending",
    });
  }
  if (brief.avoidMaterials.length > 0) {
    const clash = snapshot.materials.some((material) => brief.avoidMaterials.includes(material));
    items.push({
      id: "avoid-materials",
      label: `Avoid ${brief.avoidMaterials.join(", ")}`,
      status: clash ? "unmet" : designed ? "met" : "pending",
    });
  }
  if (brief.favouredColours.length > 0) {
    const favoured = snapshot.colours.some((colour) => brief.favouredColours.includes(colour));
    items.push({
      id: "favoured-colours",
      label: `Bonus for ${colourNames(brief.favouredColours)}`,
      status: favoured ? "met" : "pending",
    });
  }
  for (const requirement of brief.requiredTrims) {
    const placed = run.decorations.filter((decoration) => decoration.trimId === requirement.trim).length;
    items.push({
      id: `trim-${requirement.trim}`,
      label: `${trimById(requirement.trim).name} ${Math.min(placed, requirement.count)}/${requirement.count}`,
      status: placed >= requirement.count ? "met" : decorating ? "unmet" : "pending",
    });
  }
  items.push({
    id: "budget",
    label: `Budget ${snapshot.spend}/${brief.budget} coins`,
    status: snapshot.spend <= brief.budget ? "met" : "unmet",
  });
  items.push({
    id: "deadline",
    label: `Due day ${brief.deadlineDay}`,
    status: state.calendar.day <= brief.deadlineDay ? "met" : "unmet",
  });
  const complete = isConstructionComplete(snapshot);
  const quality = dressQuality(snapshot, brief).quality;
  items.push({
    id: "quality",
    label: complete ? `Quality ${quality}/${brief.minQuality}` : `Quality at least ${brief.minQuality}`,
    status: complete ? (quality >= brief.minQuality ? "met" : "unmet") : "pending",
  });
  return items;
}
