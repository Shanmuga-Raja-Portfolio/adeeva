import {
  parseSaveWith,
  serializeSave,
  type SaveParseResult as EnvelopeResult,
} from "../../../engine/saveEnvelope";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { gameStateParser } from "./gameStateParser";

export type SaveParseResult = EnvelopeResult<GameState>;

export const serialize: (state: GameState) => string = serializeSave;

export function parseSave(json: string): SaveParseResult {
  return parseSaveWith(json, { version: SCHEMA_VERSION, migrations: {}, parse: gameStateParser });
}
