import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { CUISINES, type CuisineId } from "../../../content/cuisine";
import { stationTestIssues, type GameState } from "../../../core";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";
import "./dialogs.css";

export interface CounterDialogProps {
  readonly state: GameState;
  readonly open: boolean;
  readonly onStart: (cuisine: CuisineId) => void;
  readonly onClose: () => void;
}

function CounterBody({ state, onStart, onClose }: CounterDialogProps) {
  const [cuisine, setCuisine] = useState<CuisineId | null>(null);
  const issue = cuisine === null ? "Pick a counter." : stationTestIssues(state, cuisine)[0];
  return (
    <Dialog
      open
      title="Station Test"
      onClose={onClose}
      className="ad-dialog--wide ck-dish-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button
            icon="star"
            onClick={() => cuisine !== null && onStart(cuisine)}
            disabledReason={issue}
            showReason
            data-testid="start-station-test"
          >
            Run the counter
          </Button>
        </>
      }
    >
      <p>Run one counter on your own for four tickets. Pick the kitchen you know best.</p>
      <div className="ck-counters" role="radiogroup" aria-label="Counter">
        {CUISINES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={cuisine === entry.id}
            className={cuisine === entry.id ? "ck-counter ck-counter--on" : "ck-counter"}
            onClick={() => setCuisine(entry.id)}
          >
            <KitchenBackdrop scene="counter" cuisine={entry.id} className="ck-counter__art" />
            <span className="ck-counter__name">{entry.counter}</span>
            <span className="ck-muted">
              {entry.name} · mastery {state.mastery[entry.id]}
            </span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}

export function CounterDialog(props: CounterDialogProps) {
  return props.open ? <CounterBody {...props} /> : null;
}
