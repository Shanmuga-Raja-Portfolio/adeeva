import {
  parseSaveWith,
  serializeSave,
  type SaveMigration,
  type SaveParseResult as EnvelopeResult,
} from "../../../engine/saveEnvelope";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { gameStateParser } from "./gameStateParser";

export type SaveParseResult = EnvelopeResult<GameState>;

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = {};

export const serialize: (state: GameState) => string = serializeSave;

export function parseSave(json: string): SaveParseResult {
  return parseSaveWith(json, {
    version: SCHEMA_VERSION,
    migrations: SAVE_MIGRATIONS,
    parse: gameStateParser,
  });
}
