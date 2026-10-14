import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import type { Action, GameState } from "../../../core";
import { PlateArt } from "../../art/PlateArt";

export interface DiaryCardProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: () => void;
}

export function DiaryCard({ state, dispatch, onOpen }: DiaryCardProps) {
  const latest = state.diary.slice(-3).reverse();
  return (
    <Card
      title="Dish Diary"
      eyebrow={`${state.diary.length} ${state.diary.length === 1 ? "plate" : "plates"} kept`}
      className="ck-panel"
    >
      {latest.length > 0 ? (
        <div className="ck-diary-peek" aria-hidden="true">
          {latest.map((entry) => (
            <PlateArt key={entry.id} colour={entry.plateColour} components={entry.components} title={null} />
          ))}
        </div>
      ) : (
        <p className="ck-muted">Every plate you send out is kept here.</p>
      )}
      <Button variant="secondary" block icon="star" onClick={onOpen} data-testid="open-diary">
        Open the Dish Diary
      </Button>
      <ToggleSwitch
        label="Kitchen coach"
        description="Little hints on your first dishes."
        checked={state.guide}
        onChange={(on) => dispatch({ type: "setGuide", on })}
      />
    </Card>
  );
}
