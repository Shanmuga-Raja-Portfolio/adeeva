import { isPlainObject } from "../engine/parse";
import { readStoredJson } from "./storedJson";

export interface AppSettings {
  readonly reducedMotion: boolean;
  readonly assistCut: boolean;
  readonly assistSew: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = { reducedMotion: false, assistCut: false, assistSew: false };

const SETTINGS_KEY = "adeeva.settings";

function flag(source: Readonly<Record<string, unknown>>, key: keyof AppSettings): boolean {
  const value = source[key];
  return typeof value === "boolean" ? value : DEFAULT_SETTINGS[key];
}

export function readSettings(): AppSettings {
  const source = readStoredJson(SETTINGS_KEY);
  if (!isPlainObject(source)) return DEFAULT_SETTINGS;
  return {
    reducedMotion: flag(source, "reducedMotion"),
    assistCut: flag(source, "assistCut"),
    assistSew: flag(source, "assistSew"),
  };
}

export function writeSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}
