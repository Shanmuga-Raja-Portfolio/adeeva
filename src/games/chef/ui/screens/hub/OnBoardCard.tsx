import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { dishById, type GameState } from "../../../core";

export interface OnBoardCardProps {
  readonly state: GameState;
  readonly onBack: () => void;
  readonly onSetAside: () => void;
}

export function OnBoardCard({ state, onBack, onSetAside }: OnBoardCardProps) {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return null;
  return (
    <Card tone="gold" eyebrow="On the board" title={dishById(run.dishId).name} className="ck-panel">
      <div className="ck-hub__on-board">
        <Button icon="sparkle" onClick={onBack} data-testid="back-to-dish">
          Back to the board
        </Button>
        <Button variant="ghost" size="sm" onClick={onSetAside}>
          Set aside
        </Button>
      </div>
    </Card>
  );
}
