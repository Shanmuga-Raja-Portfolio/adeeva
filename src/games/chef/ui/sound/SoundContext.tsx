import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { playKitchenSound, type KitchenSound } from "./kitchenSound";

const SOUND_KEY = "chef.sound";

interface SoundValue {
  readonly muted: boolean;
  readonly setMuted: (muted: boolean) => void;
  readonly play: (kind: KitchenSound) => void;
}

const SoundContext = createContext<SoundValue>({
  muted: true,
  setMuted: () => undefined,
  play: () => undefined,
});

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    return false;
  }
}

export function SoundProvider({ children }: { readonly children: ReactNode }) {
  const [muted, setMutedState] = useState(readMuted);
  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? "off" : "on");
    } catch {
      return;
    }
  }, []);
  const play = useCallback(
    (kind: KitchenSound) => {
      if (!muted) playKitchenSound(kind);
    },
    [muted],
  );
  const value = useMemo(() => ({ muted, setMuted, play }), [muted, setMuted, play]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useKitchenSound(): SoundValue {
  return useContext(SoundContext);
}
