import { useCallback, useRef } from "react";

export interface ClickLike {
  readonly detail: number;
}

export type DispatchOnce<A> = (event: ClickLike, ...actions: readonly A[]) => boolean;

export function useDispatchOnce<S, A>(state: S, dispatch: (action: A) => boolean): DispatchOnce<A> {
  const firedFrom = useRef<S | null>(null);
  return useCallback(
    (event: ClickLike, ...actions: readonly A[]) => {
      if (event.detail > 1 || firedFrom.current === state) return false;
      let changed = false;
      for (const action of actions) changed = dispatch(action) || changed;
      firedFrom.current = changed ? state : null;
      return changed;
    },
    [state, dispatch],
  );
}
