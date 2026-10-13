import { isPlainObject } from "../../engine/parse";
import type { GameModule } from "../../studio/gameModule";
import { CAREERS } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { AdeevaTileArt } from "./ui/AdeevaTileArt";

function earnedReputation(rawSave: unknown): number {
  if (!isPlainObject(rawSave) || !isPlainObject(rawSave.profile)) return 0;
  const { schemaVersion, reputation, profile } = rawSave;
  if (typeof schemaVersion !== "number" || !Number.isInteger(schemaVersion)) return 0;
  if (schemaVersion < 1 || schemaVersion > SCHEMA_VERSION) return 0;
  if (typeof reputation !== "number" || !Number.isFinite(reputation)) return 0;
  const career = CAREERS.find((entry) => entry.id === profile.career);
  if (career === undefined) return 0;
  return Math.max(0, Math.floor(reputation - career.startReputation));
}

export const adeevaModule: GameModule = {
  status: "live",
  id: "adeeva",
  title: "ADEEVA",
  tagline: "Design, cut and sew dresses for clients, then launch your own label.",
  ages: "8+",
  tileArt: AdeevaTileArt,
  load: () => import("./ui/AdeevaGame").then((module) => ({ default: module.AdeevaGame })),
  reputationOf: earnedReputation,
};
