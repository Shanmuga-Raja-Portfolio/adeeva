import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { weekEndDay } from "../../../engine/week";
import type { FillingId } from "../content/filling";
import { TEAS } from "../content/tea";
import { teaById } from "./catalog";
import { drawVisitors, initialFair } from "./fairSeason";
import type { GameState, Pantry } from "./gameState";
import { EMPTY_SALON } from "./salonState";
import { queueStoryTrigger } from "./storyQueue";

export const SALON_REPUTATION = 30;
export const SALON_ORDERS = 12;
export const SALON_OFFER_BEAT = "pa-salon-offer";
export const PARLOUR_BOX_FILLINGS: readonly FillingId[] = ["lemon-curd", "choc-cream", "berry-cream"];

export function salonOfferReady(state: GameState): boolean {
  return (
    state.career === "bakery" &&
    state.reputation >= SALON_REPUTATION &&
    state.ordersDelivered >= SALON_ORDERS &&
    !state.story.seen.includes(SALON_OFFER_BEAT) &&
    !state.story.queue.includes(SALON_OFFER_BEAT) &&
    canOpenSalon(state).ok
  );
}

export function queueSalonOffer(state: GameState): GameState {
  return salonOfferReady(state) ? queueStoryTrigger(state, "salon-offer") : state;
}

export function canOpenSalon(state: GameState): ActionCheck {
  if (state.career !== "bakery") return actionCheck(["The Comet Room is already open."]);
  const reasons: string[] = [];
  if (state.reputation < SALON_REPUTATION)
    reasons.push(`The parlour opens at reputation ${SALON_REPUTATION}.`);
  if (state.ordersDelivered < SALON_ORDERS)
    reasons.push(`Deliver ${SALON_ORDERS} orders first (${state.ordersDelivered} so far).`);
  const run = state.activeRun;
  if (run !== null && run.stage !== "done" && run.purpose.kind === "tray")
    reasons.push("Finish the counter tray on the bench first.");
  return actionCheck(reasons);
}

export function withParlourBox(pantry: Pantry): Pantry {
  const teas = { ...pantry.teas };
  for (const tea of TEAS) teas[tea.id] += teaById(tea.id).cupsPerTin;
  const fillings = { ...pantry.fillings };
  for (const filling of PARLOUR_BOX_FILLINGS) fillings[filling] += 1;
  return { ...pantry, teas, fillings };
}

export function openSalon(state: GameState): GameState {
  if (!canOpenSalon(state).ok) return state;
  const seasonStartDay = weekEndDay(state.calendar.day) + 1;
  const [visitors, rng] = drawVisitors(state, state.rng);
  const opened: GameState = {
    ...state,
    rng,
    career: "salon",
    pantry: withParlourBox(state.pantry),
    salon: EMPTY_SALON,
    fair: initialFair(seasonStartDay, visitors),
  };
  return queueStoryTrigger(opened, "salon-open");
}
