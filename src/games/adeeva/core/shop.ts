import type { FabricDef } from "../content/fabric";
import type { TrimId } from "../content/trim";
import { fabricById, isTrimId, trimById } from "./catalog";
import { METRE_STEP } from "./cutMetres";
import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import type { GameState } from "./gameState";
import { SHOP_VISIT_HOURS } from "./hourCost";

export const FABRIC_SHELF_DISCOUNT = 0.1;
export const MAX_FABRIC_PURCHASE_METRES = 20;
export const MAX_TRIM_PURCHASE = 20;

function wholeCoins(amount: number): number {
  return Math.ceil(Math.round(amount * 1e6) / 1e6);
}

export function fabricUnitPrice(state: GameState, fabric: FabricDef): number {
  const discount = state.studio.upgrades.includes("fabric-shelf") ? FABRIC_SHELF_DISCOUNT : 0;
  return fabric.pricePerMetre * (1 - discount);
}

export function fabricCost(state: GameState, fabric: FabricDef, metres: number): number {
  return wholeCoins(fabricUnitPrice(state, fabric) * metres);
}

export function isFabricUnlocked(state: GameState, fabric: FabricDef): boolean {
  return state.reputation >= fabric.unlockReputation;
}

export function isValidMetres(metres: number): boolean {
  return (
    Number.isFinite(metres) &&
    metres > 0 &&
    metres <= MAX_FABRIC_PURCHASE_METRES &&
    Number.isInteger(metres / METRE_STEP)
  );
}

export function shopVisitIssue(state: GameState): string | null {
  if (state.calendar.shopOpen) return "The shop is already open.";
  return hoursShortfallReason(state.calendar, SHOP_VISIT_HOURS);
}

export function openShop(state: GameState): GameState {
  if (state.calendar.shopOpen) return state;
  const spent = spendHours(state, SHOP_VISIT_HOURS);
  if (spent === null) return state;
  return { ...spent, calendar: { ...spent.calendar, shopOpen: true } };
}

export function closeShop(state: GameState): GameState {
  if (!state.calendar.shopOpen) return state;
  return { ...state, calendar: { ...state.calendar, shopOpen: false } };
}

export function fabricPurchaseIssues(state: GameState, fabricId: string, metres: number): string[] {
  const fabric = fabricById(fabricId);
  if (fabric === undefined) return ["That fabric is not stocked."];
  const issues: string[] = [];
  if (!state.calendar.shopOpen) issues.push("Visit the shop first.");
  if (!isFabricUnlocked(state, fabric))
    issues.push(`${fabric.name} unlocks at reputation ${fabric.unlockReputation}.`);
  if (!isValidMetres(metres))
    issues.push(`Fabric is sold in ${METRE_STEP} m steps, up to ${MAX_FABRIC_PURCHASE_METRES} m at a time.`);
  else if (fabricCost(state, fabric, metres) > state.coins)
    issues.push(`${metres} m of ${fabric.name} costs ${fabricCost(state, fabric, metres)} coins.`);
  return issues;
}

export function buyFabric(state: GameState, fabricId: string, metres: number): GameState {
  const fabric = fabricById(fabricId);
  if (fabric === undefined || fabricPurchaseIssues(state, fabricId, metres).length > 0) return state;
  const owned = state.inventory.fabricMetres[fabricId] ?? 0;
  return {
    ...state,
    coins: state.coins - fabricCost(state, fabric, metres),
    inventory: {
      ...state.inventory,
      fabricMetres: { ...state.inventory.fabricMetres, [fabricId]: owned + metres },
    },
  };
}

export function trimPurchaseIssues(state: GameState, trimId: TrimId, count: number): string[] {
  if (!isTrimId(trimId)) return ["That trim is not stocked."];
  const trim = trimById(trimId);
  const issues: string[] = [];
  if (!state.calendar.shopOpen) issues.push("Visit the shop first.");
  if (!Number.isInteger(count) || count <= 0 || count > MAX_TRIM_PURCHASE)
    issues.push(`Trims are sold one at a time, up to ${MAX_TRIM_PURCHASE} at once.`);
  else if (trim.price * count > state.coins)
    issues.push(`${count} ${trim.name} cost ${trim.price * count} coins.`);
  return issues;
}

export function buyTrim(state: GameState, trimId: TrimId, count: number): GameState {
  if (trimPurchaseIssues(state, trimId, count).length > 0) return state;
  const trim = trimById(trimId);
  return {
    ...state,
    coins: state.coins - trim.price * count,
    inventory: {
      ...state.inventory,
      trims: { ...state.inventory.trims, [trimId]: state.inventory.trims[trimId] + count },
    },
  };
}
