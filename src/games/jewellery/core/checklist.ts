import { jewelColourById, type JewelColour } from "../content/jewelColour";
import { extraById, metalById } from "./catalog";
import { constructionCount, isConstructionComplete } from "./construction";
import type { GameState } from "./gameState";
import { extraCount } from "./pieceEvaluate";
import { pieceColours } from "./pieceColours";
import { pieceQuality } from "./pieceQuality";
import type { PieceRun } from "./pieceRun";
import { runSource } from "./pieceSource";
import { pieceSpend } from "./pieceSpend";
import { pieceTags } from "./pieceTags";
import { stageIndex } from "./runStage";

export type ChecklistStatus = "met" | "unmet" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: ChecklistStatus;
}

function colourNames(ids: readonly JewelColour[]): string {
  return ids.map((id) => jewelColourById(id).name).join(", ");
}

export function checklist(state: GameState, run: PieceRun): ChecklistItem[] {
  const brief = run.brief;
  if (brief === null) return [];
  const source = runSource(run);
  const tags = pieceTags(source);
  const colours = pieceColours(source);
  const designed = run.design.metalId !== null;
  const displaying = stageIndex(run.stage) >= stageIndex("display");
  const items: ChecklistItem[] = brief.requiredTags.map((tag) => ({
    id: `tag-${tag}`,
    label: `Feels ${tag}`,
    status: tags.includes(tag) ? "met" : designed ? "unmet" : "pending",
  }));
  if (brief.avoidMetals.length > 0)
    items.push({
      id: "avoid-metals",
      label: `Not ${brief.avoidMetals.map((id) => metalById(id).name).join(" or ")}`,
      status: !designed
        ? "pending"
        : run.design.metalId !== null && brief.avoidMetals.includes(run.design.metalId)
          ? "unmet"
          : "met",
    });
  if (brief.avoidColours.length > 0)
    items.push({
      id: "avoid-colours",
      label: `Avoid ${colourNames(brief.avoidColours)}`,
      status: !designed
        ? "pending"
        : colours.some((colour) => brief.avoidColours.includes(colour))
          ? "unmet"
          : "met",
    });
  items.push({
    id: "favoured-colours",
    label: `Bonus for ${colourNames(brief.favouredColours)}`,
    status: colours.some((colour) => brief.favouredColours.includes(colour)) ? "met" : "pending",
  });
  for (const requirement of brief.requiredExtras) {
    const placed = extraCount(run, requirement);
    items.push({
      id: `extra-${requirement.extraId}`,
      label: `${extraById(requirement.extraId).name} ${Math.min(placed, requirement.count)}/${requirement.count}`,
      status: placed >= requirement.count ? "met" : displaying ? "unmet" : "pending",
    });
  }
  const spend = pieceSpend(run);
  items.push({
    id: "budget",
    label: `Materials ${spend}/${brief.budget} coins`,
    status: spend <= brief.budget ? "met" : "unmet",
  });
  items.push({
    id: "deadline",
    label: `Due day ${brief.deadlineDay}`,
    status: state.calendar.day <= brief.deadlineDay ? "met" : "unmet",
  });
  const complete = isConstructionComplete(constructionCount(run));
  const quality = pieceQuality(state, run).quality;
  items.push({
    id: "quality",
    label: complete ? `Quality ${quality}/${brief.minQuality}` : `Quality at least ${brief.minQuality}`,
    status: complete ? (quality >= brief.minQuality ? "met" : "unmet") : "pending",
  });
  return items;
}
