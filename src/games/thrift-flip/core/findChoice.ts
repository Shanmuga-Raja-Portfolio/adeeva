import { findById, recipeById } from "./catalog";
import type { Design } from "./design";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import type { OwnedFind } from "./ownedFind";
import { withPlacements } from "./runPlacements";
import { updateRun } from "./runUpdate";

export const MAX_FINDS_PER_FLIP = 2;

export function findBlockIssue(design: Design, owned: OwnedFind): string | null {
  if (design.recipeId === null) return null;
  const recipe = recipeById(design.recipeId);
  const find = findById(owned.findId);
  return recipe.blockedMaterials.includes(find.material)
    ? `${recipe.name} can't be made from ${find.material}.`
    : null;
}

function keepProgress(run: FlipRun, finds: readonly OwnedFind[]): FlipRun {
  const keys = new Set(finds.map((owned) => owned.id));
  const kept = <T>(record: Readonly<Record<string, T>>) =>
    Object.fromEntries(Object.entries(record).filter(([key]) => keys.has(key.split("#")[0] ?? "")));
  const fresh = finds.some((owned) => !run.finds.some((entry) => entry.id === owned.id));
  return {
    ...withPlacements(run, {}),
    finds,
    unpick: kept(run.unpick),
    clean: kept(run.clean),
    autoLaid: false,
    reachedStage: fresh ? run.stage : run.reachedStage,
  };
}

export function chooseFindsIssues(state: GameState, findIds: readonly string[]): string[] {
  const run = state.activeRun;
  if (run === null || run.stage !== "market") return ["Choose finds at the market rail."];
  if (findIds.length > MAX_FINDS_PER_FLIP) return [`A flip can use up to ${MAX_FINDS_PER_FLIP} finds.`];
  if (new Set(findIds).size !== findIds.length) return ["Pick each find once."];
  const owned = findIds.map((id) => state.stock.finds.find((entry) => entry.id === id));
  if (owned.some((entry) => entry === undefined)) return ["That find is not in your stock."];
  return owned.flatMap((entry) => {
    const issue = entry === undefined ? null : findBlockIssue(run.design, entry);
    return issue === null ? [] : [issue];
  });
}

export function chooseFinds(state: GameState, findIds: readonly string[]): GameState {
  if (chooseFindsIssues(state, findIds).length > 0) return state;
  const finds = findIds.flatMap((id) => state.stock.finds.filter((entry) => entry.id === id));
  return updateRun(state, "market", (run) => {
    const same =
      run.finds.length === finds.length && run.finds.every((owned, index) => owned.id === finds[index]?.id);
    return same ? null : keepProgress(run, finds);
  });
}

export function withBoughtFinds(run: FlipRun, bought: readonly OwnedFind[]): FlipRun {
  const usable = bought.filter((owned) => findBlockIssue(run.design, owned) === null);
  const finds = [...run.finds, ...usable].slice(0, MAX_FINDS_PER_FLIP);
  return finds.length === run.finds.length ? run : keepProgress(run, finds);
}
