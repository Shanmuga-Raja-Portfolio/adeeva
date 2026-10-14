import { useCallback, useState } from "react";
import { loadProfile, writeProfile, type StudioProfile } from "./profile";
import { GAMES } from "./registry";
import { readLastRawSlot } from "./slotStore";

function lastPlayedSave(): unknown {
  return GAMES.map((game) => readLastRawSlot(game.id)).find((raw) => raw !== null) ?? null;
}

export type ProfileChange = Partial<Omit<StudioProfile, "version">>;

export function useStudioProfile(): readonly [StudioProfile, (change: ProfileChange) => void] {
  const [profile, setProfile] = useState<StudioProfile>(() => loadProfile(lastPlayedSave));
  const update = useCallback((change: ProfileChange) => {
    setProfile((current) => {
      const next = { ...current, ...change };
      writeProfile(next);
      return next;
    });
  }, []);
  return [profile, update];
}
