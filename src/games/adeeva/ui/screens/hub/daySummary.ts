import type { StyleTag } from "../../../content/styleTag";
import { clientById, isWeekEnd, weeklyBill, type GameState, type WeeklyBill } from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly kind: DayEndKind;
  readonly fromDay: number;
  readonly toDay: number;
  readonly coinsDelta: number;
  readonly reputationDelta: number;
  readonly bill: WeeklyBill | null;
  readonly shiftPay: number;
  readonly newOffers: readonly string[];
  readonly expiredOffers: number;
  readonly lapsedGigs: readonly string[];
  readonly trendsChanged: boolean;
  readonly trends: readonly StyleTag[];
}

export function daySummary(previous: GameState, next: GameState, kind: DayEndKind): DaySummary {
  const previousOfferIds = new Set(previous.gigs.offers.map((offer) => offer.id));
  const nextOfferIds = new Set(next.gigs.offers.map((offer) => offer.id));
  const bill = isWeekEnd(previous.calendar.day) ? weeklyBill(previous) : null;
  const billTotal = bill === null ? 0 : bill.rent + bill.wage;
  const coinsDelta = next.coins - previous.coins;
  return {
    kind,
    fromDay: previous.calendar.day,
    toDay: next.calendar.day,
    coinsDelta,
    reputationDelta: next.reputation - previous.reputation,
    bill,
    shiftPay: kind === "shift" ? coinsDelta + billTotal : 0,
    newOffers: next.gigs.offers
      .filter((offer) => !previousOfferIds.has(offer.id))
      .map((offer) => clientById(offer.clientId)?.name ?? "A new client"),
    expiredOffers: previous.gigs.offers.filter((offer) => !nextOfferIds.has(offer.id)).length,
    lapsedGigs: next.gigs.lapsed
      .slice(previous.gigs.lapsed.length)
      .map((lapsed) => clientById(lapsed.clientId)?.name ?? "A client"),
    trendsChanged: previous.trends.current.join() !== next.trends.current.join(),
    trends: next.trends.current,
  };
}
