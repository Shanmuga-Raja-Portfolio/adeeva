import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveSlotId, SlotStore } from "./slotStore";

export interface SessionRules<S, A, N> {
  readonly reduce: (state: S, action: A) => S;
  readonly create: (settings: N) => S;
  readonly newGameIssues: (settings: N) => readonly string[];
}

export interface GameSession<S> {
  readonly slot: SaveSlotId | null;
  readonly game: S | null;
  readonly unsaved: boolean;
}

const closedSession = { slot: null, game: null, unsaved: false } as const;

const AUTOSAVE_DELAY_MS = 300;

export type SaveMoment = "playing" | "leaving";

export interface GameSessionControls<S, A, N> {
  readonly session: GameSession<S>;
  readonly dispatch: (action: A) => boolean;
  readonly load: (slot: SaveSlotId, game: S) => void;
  readonly begin: (slot: SaveSlotId, settings: N) => boolean;
  readonly flush: () => boolean;
  readonly close: () => void;
}

export function useGameSession<S, A, N>(
  rules: SessionRules<S, A, N>,
  store: Pick<SlotStore<S>, "writeSlot" | "markLastSlot">,
  onSaveFailed: (moment: SaveMoment) => void,
): GameSessionControls<S, A, N> {
  const current = useRef<GameSession<S>>(closedSession);
  const failing = useRef(false);
  const notify = useRef(onSaveFailed);
  const [session, setSession] = useState<GameSession<S>>(closedSession);

  useEffect(() => {
    notify.current = onSaveFailed;
  }, [onSaveFailed]);

  const commit = useCallback((next: GameSession<S>) => {
    current.current = next;
    setSession(next);
  }, []);

  const save = useCallback(
    (moment: SaveMoment): boolean => {
      const { slot, game, unsaved } = current.current;
      if (!unsaved || slot === null || game === null) return true;
      if (store.writeSlot(slot, game)) {
        failing.current = false;
        commit({ ...current.current, unsaved: false });
        return true;
      }
      if (moment === "leaving" || !failing.current) {
        failing.current = true;
        notify.current(moment);
      }
      return false;
    },
    [commit, store],
  );

  const flush = useCallback((): boolean => save("playing"), [save]);

  const { slot, game, unsaved } = session;
  useEffect(() => {
    if (!unsaved || slot === null || game === null) return;
    const handle = window.setTimeout(flush, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, [slot, game, unsaved, flush]);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      save("leaving");
    };
  }, [flush, save]);

  const dispatch = useCallback(
    (action: A): boolean => {
      const before = current.current.game;
      if (before === null) return false;
      const next = rules.reduce(before, action);
      if (next === before) return false;
      commit({ ...current.current, game: next, unsaved: true });
      return true;
    },
    [commit, rules],
  );

  const load = useCallback(
    (loadSlot: SaveSlotId, loaded: S) => {
      failing.current = false;
      store.markLastSlot(loadSlot);
      commit({ slot: loadSlot, game: loaded, unsaved: false });
    },
    [commit, store],
  );

  const begin = useCallback(
    (beginSlot: SaveSlotId, settings: N): boolean => {
      if (rules.newGameIssues(settings).length > 0) return false;
      failing.current = false;
      commit({ slot: beginSlot, game: rules.create(settings), unsaved: true });
      return true;
    },
    [commit, rules],
  );

  const close = useCallback(() => {
    failing.current = false;
    commit(closedSession);
  }, [commit]);

  return { session, dispatch, load, begin, flush, close };
}
