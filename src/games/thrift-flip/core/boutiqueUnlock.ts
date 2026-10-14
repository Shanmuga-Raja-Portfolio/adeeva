import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { DAYS_PER_WEEK } from "../../../engine/week";
import { SHOP_SIGN_IDS, type ShopSignId } from "../content/shopSign";
import { EMPTY_WINDOW } from "./boutique";
import type { GameState } from "./gameState";
import { firstSeason } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";
import { addRegularTicket } from "./ticketBrief";

export const UNLOCK_REPUTATION = 40;
export const UNLOCK_GIGS_DELIVERED = 10;
export const UNLOCK_FAIR_SALES = 3;

export function boutiqueRuleReasons(state: GameState): string[] {
  if (state.profile.career !== "stall") return ["You already run the boutique."];
  const reasons: string[] = [];
  const reputation = UNLOCK_REPUTATION - state.reputation;
  if (reputation > 0) reasons.push(`Earn ${reputation} more reputation.`);
  const orders = UNLOCK_GIGS_DELIVERED - state.gigsDelivered;
  if (orders > 0) reasons.push(`Deliver ${orders} more ${orders === 1 ? "order" : "orders"}.`);
  const fair = UNLOCK_FAIR_SALES - state.fairSales;
  if (fair > 0) reasons.push(`Sell ${fair} more ${fair === 1 ? "piece" : "pieces"} at a fair price.`);
  return reasons;
}

export function boutiqueRulePasses(state: GameState): boolean {
  return boutiqueRuleReasons(state).length === 0;
}

export function isWeekStart(state: Pick<GameState, "calendar">): boolean {
  return (state.calendar.day - 1) % DAYS_PER_WEEK === 0 && state.calendar.hoursLeft === BASE_DAY_HOURS;
}

export function nextWeekStart(day: number): number {
  return day + DAYS_PER_WEEK - ((day - 1) % DAYS_PER_WEEK);
}

export function weekStartReason(day: number): string {
  return `Larkspur Row opens at the start of a week, on day ${nextWeekStart(day)}.`;
}

export function canOpenBoutique(state: GameState): ActionCheck {
  const reasons = boutiqueRuleReasons(state);
  if (reasons.length > 0) return actionCheck(reasons);
  return actionCheck(isWeekStart(state) ? [] : [weekStartReason(state.calendar.day)]);
}

export function openBoutique(state: GameState, signId: ShopSignId): GameState {
  if (!SHOP_SIGN_IDS.includes(signId) || !canOpenBoutique(state).ok) return state;
  const day = state.calendar.day;
  const opened: GameState = {
    ...state,
    profile: { ...state.profile, career: "boutique" },
    boutique: {
      signId,
      openedDay: day,
      season: firstSeason(day),
      window: EMPTY_WINDOW,
      props: [],
      rosettes: [],
    },
  };
  return addRegularTicket(queueStoryTrigger(queueStoryTrigger(opened, "boutique-opened"), "season-start"));
}

export function queueBoutiqueOffer(state: GameState): GameState {
  return boutiqueRulePasses(state) ? queueStoryTrigger(state, "boutique-offer") : state;
}
