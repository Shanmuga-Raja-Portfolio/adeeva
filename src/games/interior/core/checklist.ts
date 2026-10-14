import { roomColourById, type RoomColour } from "../content/roomColour";
import { constructionCount, isConstructionComplete } from "./construction";
import type { GameState } from "./gameState";
import { moodMatch } from "./lighting";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { mustHaveCounts } from "./mustHaves";
import { roomColours } from "./roomColours";
import { roomQuality } from "./roomQuality";
import { roomSource } from "./roomSource";
import { roomTags } from "./roomTags";
import { stageIndex } from "./runStage";
import { plannedSpend } from "./warehouse";

export type ChecklistStatus = "met" | "unmet" | "pending";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: ChecklistStatus;
}

function colourNames(ids: readonly RoomColour[]): string {
  return ids.map((id) => roomColourById(id).name).join(", ");
}

export function checklist(state: GameState, run: MakeoverRun): ChecklistItem[] {
  const brief = run.brief;
  const source = roomSource(run);
  const tags = roomTags(source);
  const colours = roomColours(source);
  const started = run.plan.pieces.length > 0 || run.plan.wallPaint !== null;
  const styling = stageIndex(run.stage) >= stageIndex("style");
  const items: ChecklistItem[] = brief.requiredTags.map((tag) => ({
    id: `tag-${tag}`,
    label: `Feels ${tag}`,
    status: tags.includes(tag) ? "met" : started ? "unmet" : "pending",
  }));
  if (brief.avoidColours.length > 0)
    items.push({
      id: "avoid-colours",
      label: `No ${colourNames(brief.avoidColours)}`,
      status: colours.some((colour) => brief.avoidColours.includes(colour))
        ? "unmet"
        : started
          ? "met"
          : "pending",
    });
  items.push({
    id: "favoured-colours",
    label: `Bonus for ${colourNames(brief.favouredColours)}`,
    status: colours.some((colour) => brief.favouredColours.includes(colour)) ? "met" : "pending",
  });
  for (const entry of mustHaveCounts(source, brief.mustHaves))
    items.push({
      id: `must-${entry.need.itemId}`,
      label: `${entry.name} ${Math.min(entry.placed, entry.need.count)}/${entry.need.count}`,
      status: entry.placed >= entry.need.count ? "met" : styling ? "unmet" : "pending",
    });
  if (brief.mood !== "any") {
    const lit = stageIndex(run.stage) > stageIndex("light");
    items.push({
      id: "mood",
      label: `${brief.mood === "warm" ? "Warm" : "Cool"} light`,
      status: !lit ? "pending" : moodMatch(brief.mood, placedLights(run)) === 1 ? "met" : "unmet",
    });
  }
  const spend = plannedSpend(state, run);
  items.push({
    id: "budget",
    label: `Spend ${spend}/${brief.budget} coins`,
    status: spend <= brief.budget ? "met" : "unmet",
  });
  items.push({
    id: "deadline",
    label: `Reveal by day ${brief.deadlineDay}`,
    status: state.calendar.day <= brief.deadlineDay ? "met" : "unmet",
  });
  const complete = isConstructionComplete(constructionCount(run));
  const quality = roomQuality(state, run).quality;
  items.push({
    id: "quality",
    label: complete ? `Quality ${quality}/${brief.minQuality}` : `Quality at least ${brief.minQuality}`,
    status: complete ? (quality >= brief.minQuality ? "met" : "unmet") : "pending",
  });
  return items;
}
