import { useState } from "react";
import { stoneById, tintById, type Action, type CollectionState, type PieceRun } from "../../../core";
import { GemArt } from "../../art/GemArt";

export interface PotPickerProps {
  readonly collection: CollectionState;
  readonly run: PieceRun;
  readonly seats: number;
  readonly dispatch: (action: Action) => boolean;
}

export function PotPicker({ collection, run, seats, dispatch }: PotPickerProps) {
  const [picks, setPicks] = useState<readonly number[]>(run.potStones);
  const stones = collection.stonePot
    .map((stone, index) => ({ stone, index }))
    .filter(
      ({ stone, index }) =>
        stone.stoneId === run.design.stoneId && (!stone.used || run.potStones.includes(index)),
    );
  const locked = run.stonesTaken;
  const chosen = run.potStones.length === seats;
  const toggle = (index: number) => {
    if (locked) return;
    const next = picks.includes(index)
      ? picks.filter((entry) => entry !== index)
      : [...picks, index].slice(-seats);
    setPicks(next);
    if (next.length === seats) dispatch({ type: "choosePotStones", indices: next });
  };
  return (
    <section className="jb-pot-picker" aria-label="Line Pot" data-testid="pot-picker">
      <header>
        <strong>Line Pot</strong>
        <span className="jb-muted">
          {locked
            ? " Your stones are going in!"
            : chosen
              ? " Ready. Tap another stone to swap."
              : ` Tap ${seats === 1 ? "a stone" : `${seats} stones`} to set.`}
        </span>
      </header>
      <ul className="jb-pot-picker__stones">
        {stones.map(({ stone, index }) => {
          const tint = tintById(stone.tint);
          const on = picks.includes(index);
          return (
            <li key={index}>
              <button
                type="button"
                className={on ? "jb-pot-stone jb-pot-stone--on" : "jb-pot-stone"}
                aria-pressed={on}
                disabled={locked}
                onClick={() => toggle(index)}
                data-testid={`pot-stone-${index}`}
                aria-label={`${stoneById(stone.stoneId).name}, ${tint.word} tint, shimmer ${stone.shimmer}`}
              >
                <svg viewBox="-24 -24 48 48" aria-hidden="true">
                  <GemArt
                    stoneId={stone.stoneId}
                    tint={stone.tint}
                    shimmer={stone.shimmer}
                    size={34}
                    pattern
                  />
                </svg>
                <span>
                  {tint.pattern} {tint.word}
                </span>
                <span className="jb-pot-stone__shimmer">{"◇".repeat(stone.shimmer)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
