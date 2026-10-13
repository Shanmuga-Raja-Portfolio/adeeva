import type { UpgradeId } from "../content/upgrade";
import { weeklyRent } from "../../../engine/difficulty";
import { upgradeIssues } from "../../../engine/upgrades";
import { isUpgradeId, upgradeById } from "./catalog";
import { MOOD_BOARD_BONUS_HOURS } from "./dayHours";
import type { GameState } from "./gameState";
import { weekEndDay } from "../../../engine/week";

export const ASSISTANT_WEEKLY_WAGE = 30;

export function assistantWage(state: GameState): number {
  return weeklyRent(ASSISTANT_WEEKLY_WAGE, state.profile.difficulty);
}

export function assistantHireCost(state: GameState): number {
  return state.studio.assistantPaidThroughDay >= state.calendar.day ? 0 : assistantWage(state);
}

export function assistantHireIssue(state: GameState): string | null {
  if (state.studio.assistantHired) return "Your assistant is already here.";
  const cost = assistantHireCost(state);
  if (state.coins < cost) return `Hiring costs ${cost} coins for this week's wage.`;
  return null;
}

export function hireAssistant(state: GameState): GameState {
  if (assistantHireIssue(state) !== null) return state;
  const cost = assistantHireCost(state);
  const paidThrough = cost > 0 ? weekEndDay(state.calendar.day) : state.studio.assistantPaidThroughDay;
  return {
    ...state,
    coins: state.coins - cost,
    studio: { ...state.studio, assistantHired: true, assistantPaidThroughDay: paidThrough },
  };
}

export function fireAssistant(state: GameState): GameState {
  if (!state.studio.assistantHired) return state;
  return { ...state, studio: { ...state.studio, assistantHired: false } };
}

export function upgradePurchaseIssues(state: GameState, upgradeId: UpgradeId): string[] {
  if (!isUpgradeId(upgradeId)) return ["That upgrade does not exist."];
  return upgradeIssues(state.studio.upgrades, upgradeById(upgradeId), state.coins, state.reputation);
}

export function buyUpgrade(state: GameState, upgradeId: UpgradeId): GameState {
  if (upgradePurchaseIssues(state, upgradeId).length > 0) return state;
  const bonusHours = upgradeId === "mood-board" ? MOOD_BOARD_BONUS_HOURS : 0;
  return {
    ...state,
    coins: state.coins - upgradeById(upgradeId).price,
    calendar: { ...state.calendar, hoursLeft: state.calendar.hoursLeft + bonusHours },
    studio: { ...state.studio, upgrades: [...state.studio.upgrades, upgradeId] },
  };
}
