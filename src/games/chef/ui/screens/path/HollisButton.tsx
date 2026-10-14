import { Button } from "../../../../../ui/kit/Button";
import { hollisIssue, type Action, type GameState } from "../../../core";

export interface HollisButtonProps {
  readonly state: GameState;
  readonly desk: "menu" | "ready" | "team" | "cues";
  readonly dispatch: (action: Action) => boolean;
  readonly onHelped?: (() => void) | undefined;
}

export function HollisButton({ state, desk, dispatch, onHelped }: HollisButtonProps) {
  if (state.profile.difficulty !== "relaxed") return null;
  return (
    <Button
      variant="secondary"
      icon="sparkle"
      onClick={() => {
        if (dispatch({ type: "askHollis", desk })) onHelped?.();
      }}
      disabledReason={hollisIssue(state, desk) ?? undefined}
      data-testid={`ask-hollis-${desk}`}
    >
      Ask Hollis
    </Button>
  );
}
