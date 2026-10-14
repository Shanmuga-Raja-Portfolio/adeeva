import { clientIsOpen, MAX_PENDING_OFFERS, OFFER_LIFETIME_DAYS, type Offer } from "../../../engine/gigBoard";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { ClientLines } from "../content/client";
import { TICKET_BUDGET, TICKET_LINES, TICKETS, type TicketDef } from "../content/ticket";
import { TICKET_CLIENTS } from "../content/ticketClient";
import type { Brief } from "./brief";
import { difficultyById, ticketById } from "./catalog";
import type { GameState } from "./gameState";
import type { OwnedFind } from "./ownedFind";

export const TICKET_STAIN_CELLS = 9;

function capitalised(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ticketOccasion(ticket: TicketDef): string {
  return ticket.kind === "mend" ? `Mend: ${ticket.item}` : `Fresh hem: ${ticket.item}`;
}

export function rollTicketBrief(
  ticket: TicketDef,
  day: number,
  rng: RngState,
  minQualityBonus: number,
): [Brief, RngState] {
  const [fee, afterFee] = drawInt(rng, ticket.fee[0], ticket.fee[1]);
  const [days, afterDays] = drawInt(afterFee, ticket.deadlineDays[0], ticket.deadlineDays[1]);
  return [
    {
      kind: ticket.kind,
      ticketId: ticket.id,
      clientId: ticket.clientId,
      occasion: ticketOccasion(ticket),
      deadlineDay: day + days,
      budget: TICKET_BUDGET,
      fee,
      recipes: [],
      partIds: null,
      requiredTags: [],
      favouredColours: ticket.favouredColours,
      avoidColours: [],
      avoidMaterials: [],
      requiredFinishes: ticket.kind === "mend" ? [{ kind: "mend-or-patch", count: 1 }] : [],
      minQuality: ticket.minQuality + minQualityBonus,
      minLeaves: 0,
    },
    afterDays,
  ];
}

export function lentFind(gigId: string, ticket: TicketDef): OwnedFind {
  return {
    id: `lent-${gigId}`,
    findId: ticket.findId,
    grade: ticket.grade,
    price: 0,
    wornSpot: ticket.wornSpot,
    stains: ticket.stain === null ? [] : [{ id: "stain-1", ...ticket.stain, cells: TICKET_STAIN_CELLS }],
  };
}

export function ticketLine(brief: Brief, line: keyof ClientLines): string | null {
  if (brief.ticketId === null) return null;
  const ticket = ticketById(brief.ticketId);
  const own = TICKET_CLIENTS.find((person) => person.id === ticket.clientId);
  const text = own === undefined ? TICKET_LINES[ticket.kind][line] : own.lines[line];
  return capitalised(text.replace("[item]", ticket.item));
}

function isTicket(brief: Brief): boolean {
  return brief.kind !== "flip";
}

export function ticketInFlight(state: Pick<GameState, "gigs">): boolean {
  return [...state.gigs.offers, ...state.gigs.active].some((entry) => isTicket(entry.brief));
}

export function openTickets(state: GameState): TicketDef[] {
  const busy = new Set([
    ...state.gigs.offers.map((offer) => offer.clientId),
    ...state.gigs.active.map((gig) => gig.clientId),
  ]);
  return TICKETS.filter(
    (ticket) => !busy.has(ticket.clientId) && clientIsOpen(ticket, state.reputation, state.profile.trait),
  );
}

export function addRegularTicket(state: GameState): GameState {
  if (state.profile.career !== "boutique" || ticketInFlight(state)) return state;
  if (state.gigs.offers.length >= MAX_PENDING_OFFERS) return state;
  const pool = openTickets(state);
  if (pool.length === 0) return state;
  const [[ticket], afterPick] = drawDistinct(state.rng, pool, 1);
  if (ticket === undefined) return state;
  const bonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const [brief, rng] = rollTicketBrief(ticket, state.calendar.day, afterPick, bonus);
  const offer: Offer<Brief> = {
    id: `gig-${state.gigs.nextGigNumber}`,
    clientId: ticket.clientId,
    brief,
    expiresDay: state.calendar.day + OFFER_LIFETIME_DAYS,
  };
  return {
    ...state,
    rng,
    gigs: {
      ...state.gigs,
      offers: [...state.gigs.offers, offer],
      nextGigNumber: state.gigs.nextGigNumber + 1,
    },
  };
}
