import type { HomeStoryDef } from "../content/homeStory";
import { floorById, paintById } from "./catalog";
import type { MakeoverRun } from "./makeoverRun";
import { sourcePaints } from "./roomSource";

export function storyPiecesIn(run: Pick<MakeoverRun, "decor">, story: HomeStoryDef): number {
  const ids = story.pieces.map((piece) => piece.decorId);
  return run.decor.filter((item) => ids.includes(item.decorId)).length;
}

export function storySurface(run: Pick<MakeoverRun, "plan">, story: HomeStoryDef): boolean {
  const colours = [
    ...sourcePaints(run.plan).map((id) => paintById(id).colour),
    ...(run.plan.floor === null ? [] : floorById(run.plan.floor).colours),
  ];
  return colours.some((colour) => story.palette.includes(colour));
}

export function tellsStory(run: Pick<MakeoverRun, "decor" | "plan">, story: HomeStoryDef): boolean {
  return storyPiecesIn(run, story) > 0 && storySurface(run, story);
}
