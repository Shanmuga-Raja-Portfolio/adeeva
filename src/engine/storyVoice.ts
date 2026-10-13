import type { StoryLine } from "./story";
import type { TraitId } from "./trait";

export interface SpokenLine {
  readonly speaker: string;
  readonly text: string;
  readonly isPlayer: boolean;
}

export function beatLines(
  beat: { readonly lines: readonly StoryLine[] },
  trait: TraitId,
  playerName: string,
): SpokenLine[] {
  return beat.lines.map((line) =>
    line.kind === "spoken"
      ? { speaker: line.speaker, text: line.text, isPlayer: false }
      : { speaker: playerName, text: line.byTrait[trait] ?? line.text, isPlayer: true },
  );
}
