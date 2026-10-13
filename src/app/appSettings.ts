export interface AppSettings {
  readonly reducedMotion: boolean;
  readonly assistCut: boolean;
  readonly assistSew: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = { reducedMotion: false, assistCut: false, assistSew: false };

const SETTINGS_KEY = "adeeva.settings";

function flag(source: Record<string, unknown>, key: keyof AppSettings): boolean {
  const value = source[key];
  return typeof value === "boolean" ? value : DEFAULT_SETTINGS[key];
}

export function readSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_SETTINGS;
    const source = parsed as Record<string, unknown>;
    return {
      reducedMotion: flag(source, "reducedMotion"),
      assistCut: flag(source, "assistCut"),
      assistSew: flag(source, "assistSew"),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}
