import { useCallback, useRef } from "react";
import type { Action, GameState } from "../../core";

export interface ClickLike {
  readonly detail: number;
}

export type DispatchOnce = (event: ClickLike, ...actions: readonly Action[]) => boolean;

export function useDispatchOnce(state: GameState, dispatch: (action: Action) => boolean): DispatchOnce {
  const firedFrom = useRef<GameState | null>(null);
  return useCallback(
    (event: ClickLike, ...actions: readonly Action[]) => {
      if (event.detail > 1 || firedFrom.current === state) return false;
      let changed = false;
      for (const action of actions) changed = dispatch(action) || changed;
      firedFrom.current = changed ? state : null;
      return changed;
    },
    [state, dispatch],
  );
}
