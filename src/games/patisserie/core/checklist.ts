import { colourById, type ColourId } from "../../../engine/palette";
import { bakeQuality } from "./bakeQuality";
import { designMixes } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import { bakeSpend } from "./bakeSpend";
import { bakeTags } from "./bakeTags";
import { mixById, toppingById } from "./catalog";
import { constructionCount, isConstructionComplete } from "./construction";
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

function decided(designed: boolean, ok: boolean): ChecklistStatus {
  if (!designed) return "pending";
  return ok ? "met" : "unmet";
}

export function checklist(state: GameState, run: BakeRun): ChecklistItem[] {
  const brief = run.brief;
  if (brief === null) return [];
  const tags = bakeTags(run);
  const designed = run.design.productId !== null;
  const mixes = designMixes(run.design).map((mix) => mix.id);
  const decorating = stageIndex(run.stage) >= stageIndex("decorate");
  const items: ChecklistItem[] = brief.requiredTags.map((tag) => ({
    id: `tag-${tag}`,
    label: `Feels ${tag}`,
    status: tags.includes(tag) ? "met" : designed ? "unmet" : "pending",
  }));
  for (const mixId of brief.requiredMixes)
    items.push({
      id: `mix-${mixId}`,
      label: `Uses ${mixById(mixId).name}`,
      status: decided(mixes.length > 0, mixes.includes(mixId)),
    });
  for (const mixId of brief.avoidMixes)
    items.push({
      id: `avoid-${mixId}`,
      label: `Not ${mixById(mixId).name}`,
      status: decided(mixes.length > 0, !mixes.includes(mixId)),
    });
  const colours = run.design.colours;
  if (brief.avoidColours.length > 0)
    items.push({
      id: "avoid-colours",
      label: `Avoid ${colourNames(brief.avoidColours)}`,
      status: decided(colours.length > 0, !colours.some((colour) => brief.avoidColours.includes(colour))),
    });
  if (brief.minColours > 0)
    items.push({
      id: "min-colours",
      label: `At least ${brief.minColours} icing colours (${colours.length})`,
      status: decided(colours.length > 0, colours.length >= brief.minColours),
    });
  items.push({
    id: "favoured-colours",
    label: `Bonus for ${colourNames(brief.favouredColours)}`,
    status: colours.some((colour) => brief.favouredColours.includes(colour)) ? "met" : "pending",
  });
  for (const requirement of brief.requiredToppings) {
    const placed = run.toppings.filter((entry) => entry.toppingId === requirement.topping).length;
    items.push({
      id: `topping-${requirement.topping}`,
      label: `${toppingById(requirement.topping).name} ${Math.min(placed, requirement.count)}/${requirement.count}`,
      status: placed >= requirement.count ? "met" : decorating ? "unmet" : "pending",
    });
  }
  const spend = bakeSpend(run);
  items.push({
    id: "budget",
    label: `Ingredients ${spend}/${brief.budget} coins`,
    status: spend <= brief.budget ? "met" : "unmet",
  });
  items.push({
    id: "deadline",
    label: `Due day ${brief.deadlineDay}`,
    status: state.calendar.day <= brief.deadlineDay ? "met" : "unmet",
  });
  const complete = isConstructionComplete(constructionCount(run));
  const quality = bakeQuality(run).quality;
  const fair = run.purpose.kind === "showpiece";
  items.push({
    id: "quality",
    label: fair
      ? complete
        ? `Ready for the Fair: quality ${quality}/${brief.minQuality}`
        : `Ready for the Fair at quality ${brief.minQuality}`
      : complete
        ? `Quality ${quality}/${brief.minQuality}`
        : `Quality at least ${brief.minQuality}`,
    status: complete ? (quality >= brief.minQuality ? "met" : "unmet") : "pending",
  });
  return items;
}
