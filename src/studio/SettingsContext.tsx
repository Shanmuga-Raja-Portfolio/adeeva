import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { DEFAULT_SETTINGS, readSettings, writeSettings, type AppSettings } from "./settings";

export interface SettingsContextValue {
  readonly settings: AppSettings;
  readonly reducedMotion: boolean;
  readonly updateSettings: (change: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  reducedMotion: false,
  updateSettings: () => undefined,
});

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void): () => void {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function systemPrefersReducedMotion(): boolean {
  return window.matchMedia(motionQuery).matches;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(readSettings);
  const systemReduced = useSyncExternalStore(subscribeToMotion, systemPrefersReducedMotion, () => false);
  const reducedMotion = settings.reducedMotion || systemReduced;

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
  }, [reducedMotion]);

  const updateSettings = useCallback((change: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...change };
      writeSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ settings, reducedMotion, updateSettings }),
    [settings, reducedMotion, updateSettings],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
