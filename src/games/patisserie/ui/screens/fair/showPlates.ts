import { bookPlate, type FairEntry, type GameState } from "../../../core";
import { bakeLook, bookEntryLook, type BakeLook } from "../../art/bakeLook";
import { bakeBookOwner } from "../book/BakeBookCard";

export interface ShowPlateView {
  readonly label: string;
  readonly quality: number;
  readonly look: BakeLook | null;
  readonly plaque: string | null;
}

export function showPlates(
  state: GameState,
  entry: FairEntry,
  sidePlates: readonly string[],
): ShowPlateView[] {
  const sides = sidePlates.flatMap((runId) => {
    const found = state.bakeBook.find((option) => option.runId === runId);
    if (found === undefined) return [];
    return [
      {
        label: `${bakeBookOwner(found)}'s bake`,
        quality: bookPlate(found).quality,
        look: bookEntryLook(found),
        plaque: null,
      },
    ];
  });
  return [
    {
      label: "Your showpiece",
      quality: entry.quality,
      look: bakeLook(entry.design, entry.toppings, true),
      plaque: entry.word,
    },
    ...sides,
  ];
}
