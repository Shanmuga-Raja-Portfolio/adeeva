import { integerRangeParser, isPlainObject } from "../engine/parse";
import { GAME_IDS, type GameId } from "./gameModule";
import { readStoredJson } from "./storedJson";

export const PLAYTIME_KEY = "studio.playtime";

export type PlaytimeSeconds = Partial<Readonly<Record<GameId, number>>>;

const secondsParser = integerRangeParser(0, Number.MAX_SAFE_INTEGER);

export function parsePlaytime(raw: unknown): PlaytimeSeconds {
  if (!isPlainObject(raw) || raw.version !== 1 || !isPlainObject(raw.seconds)) return {};
  const seconds = raw.seconds;
  return Object.fromEntries(
    GAME_IDS.flatMap((id) => {
      const outcome = secondsParser(seconds[id], id);
      return outcome.ok ? [[id, outcome.value]] : [];
    }),
  );
}

export function addPlaytime(current: PlaytimeSeconds, gameId: GameId, seconds: number): PlaytimeSeconds {
  if (seconds <= 0) return current;
  return { ...current, [gameId]: (current[gameId] ?? 0) + seconds };
}

export function readPlaytime(): PlaytimeSeconds {
  return parsePlaytime(readStoredJson(PLAYTIME_KEY));
}

export function recordPlaytime(gameId: GameId, seconds: number): void {
  if (seconds <= 0) return;
  try {
    const next = addPlaytime(readPlaytime(), gameId, seconds);
    window.localStorage.setItem(PLAYTIME_KEY, JSON.stringify({ version: 1, seconds: next }));
  } catch {
    return;
  }
}

export function playtimeLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return seconds > 0 ? "Under a minute" : "Not played yet";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const hourText = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return rest === 0 ? hourText : `${hourText} ${rest} ${rest === 1 ? "minute" : "minutes"}`;
}
