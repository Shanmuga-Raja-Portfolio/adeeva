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
      eyebrow="New to the bench?"
      title="Want a quick bench tour?"
      className="jb-hub-card jb-tour"
    >
      <p className="jb-muted">Mr. Osei can whisper a hint at each step of your first order.</p>
      <div className="jb-tour__buttons">
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
