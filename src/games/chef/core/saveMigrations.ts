import { isPlainObject } from "../../../engine/parse";
import type { SaveMigration } from "../../../engine/saveEnvelope";
import { LAMP_HOLD_SECONDS } from "./serviceRail";

function openService(service: unknown): unknown {
  if (!isPlainObject(service) || !isPlainObject(service.plan)) return service;
  return {
    ...service,
    plan: { ...service.plan, lampHoldSeconds: LAMP_HOLD_SECONDS, pans: 1 },
    spotlight: null,
  };
}

function addCareerPaths(raw: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return { ...raw, path: null, peeked: [], service: openService(raw.service) };
}

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = {
  1: addCareerPaths,
};
