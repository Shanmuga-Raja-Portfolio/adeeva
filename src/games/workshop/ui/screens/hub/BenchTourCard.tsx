import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { offersBenchTour, type Action, type GameState } from "../../../core";

export interface BenchTourCardProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

export function BenchTourCard({ state, dispatch }: BenchTourCardProps) {
  if (!offersBenchTour(state)) return null;
  return (
    <Card
      tone="sage"
      eyebrow="New to this bench?"
      title="Want a quick bench tour?"
      className="ww-hub-card ww-tour"
    >
      <p className="ww-muted">
        A little helper bubble can show each building step until your first delivery.
      </p>
      <div className="ww-tour__buttons">
        <Button onClick={() => dispatch({ type: "setBenchTour", on: true })} data-testid="bench-tour-yes">
          Yes, show me around
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: "setBenchTour", on: false })}>
          No thanks
        </Button>
      </div>
    </Card>
  );
}
