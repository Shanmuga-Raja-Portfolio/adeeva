import { parseSaveWith, type SaveParseResult as EnvelopeResult } from "../../../engine/saveEnvelope";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { gameStateParser } from "./gameStateParser";
import { SAVE_MIGRATIONS } from "./saveMigrations";

export type SaveParseResult = EnvelopeResult<GameState>;

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function parseSave(json: string): SaveParseResult {
  return parseSaveWith(json, {
    version: SCHEMA_VERSION,
    migrations: SAVE_MIGRATIONS,
    parse: gameStateParser,
  });
}
