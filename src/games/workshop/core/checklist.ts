import { RUN_STAGES } from "../content/runStage";
import type { ShadeId } from "../content/shade";
import { extraById, shadeById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";
import { pieceColours } from "./pieceColours";
import { constructionCount, isConstructionComplete, pieceQuality } from "./pieceQuality";
import { pieceTags } from "./pieceTags";
import { extraTallies } from "./requiredExtras";
import { runSpend } from "./runSpend";

export type ChecklistStatus = "met" | "unmet" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: ChecklistStatus;
}

function names(ids: readonly ShadeId[]): string {
  return ids.map((id) => shadeById(id).name).join(", ");
}

function reachedFinish(run: CommissionRun): boolean {
  return RUN_STAGES.indexOf(run.stage) >= RUN_STAGES.indexOf("finish");
}

export function checklist(state: GameState, run: CommissionRun): ChecklistItem[] {
  const brief = run.brief;
  const tags = pieceTags(run);
  const designed = run.design.productId !== null;
  const finishing = reachedFinish(run);
  const items: ChecklistItem[] = brief.requiredTags.map((tag) => ({
    id: `tag-${tag}`,
    label: `Feels ${tag}`,
    status: tags.includes(tag) ? "met" : finishing ? "unmet" : "pending",
  }));
  const woodId = run.design.woodId;
  for (const avoid of brief.avoidWoods)
    items.push({
      id: `wood-${avoid}`,
      label: `No ${woodById(avoid).name}`,
      status: woodId === null ? "pending" : woodId === avoid ? "unmet" : "met",
    });
  const colours = pieceColours(run);
  if (brief.avoidColours.length > 0)
    items.push({
      id: "avoid-colours",
      label: `Avoid ${names(brief.avoidColours)}`,
      status: !designed
        ? "pending"
        : colours.some((colour) => brief.avoidColours.includes(colour))
          ? "unmet"
          : "met",
    });
  items.push({
    id: "favoured-colours",
    label: `Bonus for ${names(brief.favouredColours)}`,
    status: colours.some((colour) => brief.favouredColours.includes(colour)) ? "met" : "pending",
  });
  for (const tally of extraTallies(run))
    items.push({
      id: `extra-${tally.extra}`,
      label: `${extraById(tally.extra).name} ${Math.min(tally.placed, tally.needed)}/${tally.needed}`,
      status: tally.placed >= tally.needed ? "met" : finishing ? "unmet" : "pending",
    });
  const spend = runSpend(state, run);
  items.push({
    id: "budget",
    label: `Piece cost ${spend}/${brief.budget} coins`,
    status: spend <= brief.budget ? "met" : "unmet",
  });
  items.push({
    id: "deadline",
    label: `Due day ${brief.deadlineDay}`,
    status: state.calendar.day <= brief.deadlineDay ? "met" : "unmet",
  });
  const complete = isConstructionComplete(constructionCount(state, run));
  const quality = pieceQuality(state, run).quality;
  items.push({
    id: "quality",
    label: complete ? `Quality ${quality}/${brief.minQuality}` : `Quality at least ${brief.minQuality}`,
    status: complete ? (quality >= brief.minQuality ? "met" : "unmet") : "pending",
  });
  return items;
}
