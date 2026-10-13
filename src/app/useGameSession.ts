import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGame,
  newGameIssues,
  reduce,
  type Action,
  type GameState,
  type NewGameSettings,
} from "../core";
import { markLastSlot, writeSlot, type SaveSlotId } from "./saveSlots";

export interface GameSession {
  readonly slot: SaveSlotId | null;
  readonly game: GameState | null;
  readonly unsaved: boolean;
}

const closedSession: GameSession = { slot: null, game: null, unsaved: false };

const AUTOSAVE_DELAY_MS = 300;

export interface GameSessionControls {
  readonly session: GameSession;
  readonly dispatch: (action: Action) => boolean;
  readonly load: (slot: SaveSlotId, game: GameState) => void;
  readonly begin: (slot: SaveSlotId, settings: NewGameSettings) => void;
  readonly flush: () => boolean;
  readonly close: () => void;
}

export function useGameSession(onSaveFailed: () => void): GameSessionControls {
  const current = useRef<GameSession>(closedSession);
  const failing = useRef(false);
  const notify = useRef(onSaveFailed);
  const [session, setSession] = useState<GameSession>(closedSession);

  useEffect(() => {
    notify.current = onSaveFailed;
  }, [onSaveFailed]);

  const commit = useCallback((next: GameSession) => {
    current.current = next;
    setSession(next);
  }, []);

  const flush = useCallback((): boolean => {
    const { slot, game, unsaved } = current.current;
    if (!unsaved || slot === null || game === null) return true;
    if (writeSlot(slot, game)) {
      failing.current = false;
      commit({ ...current.current, unsaved: false });
      return true;
    }
    if (!failing.current) {
      failing.current = true;
      notify.current();
    }
    return false;
  }, [commit]);

  const { slot, game, unsaved } = session;
  useEffect(() => {
    if (!unsaved || slot === null || game === null) return;
    const handle = window.setTimeout(flush, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, [slot, game, unsaved, flush]);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [flush]);

  const dispatch = useCallback(
    (action: Action): boolean => {
      const before = current.current.game;
      if (before === null) return false;
      const next = reduce(before, action);
      if (next === before) return false;
      commit({ ...current.current, game: next, unsaved: true });
      return true;
    },
    [commit],
  );

  const load = useCallback(
    (loadSlot: SaveSlotId, loaded: GameState) => {
      failing.current = false;
      markLastSlot(loadSlot);
      commit({ slot: loadSlot, game: loaded, unsaved: false });
    },
    [commit],
  );

  const begin = useCallback(
    (beginSlot: SaveSlotId, settings: NewGameSettings) => {
      if (newGameIssues(settings).length > 0) return;
      failing.current = false;
      commit({ slot: beginSlot, game: createGame(settings), unsaved: true });
    },
    [commit],
  );

  const close = useCallback(() => {
    failing.current = false;
    commit(closedSession);
  }, [commit]);

  return { session, dispatch, load, begin, flush, close };
}
