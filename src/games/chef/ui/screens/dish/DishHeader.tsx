import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { cuisineById, dishById, type DishRun, type GameState } from "../../../core";
import { purposeLabel } from "./stageNames";

export interface DishHeaderProps {
  readonly state: GameState;
  readonly run: DishRun;
  readonly onExit: () => void;
  readonly onSetAside: () => void;
}

export function DishHeader({ state, run, onExit, onSetAside }: DishHeaderProps) {
  const dish = dishById(run.dishId);
  const cuisine = cuisineById(dish.cuisine);
  return (
    <header className="ck-dish-bar" style={{ ["--ck-cuisine" as string]: cuisine.accent }}>
      <Button variant="secondary" size="sm" icon="back" onClick={onExit}>
        Kitchen
      </Button>
      <div className="ck-dish-bar__title">
        <span className="ad-eyebrow">
          {purposeLabel(run)} · {cuisine.counter}
        </span>
        <h1 className="ck-dish-bar__name">{dish.name}</h1>
      </div>
      <div className="ck-dish-bar__stats">
        <span data-testid="dish-coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
        <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        <Button variant="ghost" size="sm" onClick={onSetAside}>
          Set aside
        </Button>
      </div>
    </header>
  );
}
