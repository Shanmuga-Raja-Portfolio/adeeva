import { STATIONS, type StationId } from "../content/station";
import { dishById, staffById } from "./catalog";
import type { GameState } from "./gameState";
import { admitTickets, dishFinished, nextStepIndex, nextStepKind, railCount } from "./serviceRail";
import { quickTasteStart, scoreQuick, type QuickRecord } from "./serviceQuick";
import { hasClock, type ServiceRun, type ServiceStep, type ServiceTicket } from "./service";
import { STAFF_SECONDS, STEP_STATIONS, staffSkill } from "./staffing";

export interface DishSlot {
  readonly ticketId: string;
  readonly dishIndex: number;
}

export function validMoment(service: ServiceRun, at: number): boolean {
  if (!Number.isFinite(at) || at < service.lastAt) return false;
  return !hasClock(service) || at <= service.plan.lengthSeconds;
}

function completeStep(
  service: ServiceRun,
  ticketIndex: number,
  dishIndex: number,
  step: ServiceStep,
  at: number,
): ServiceRun {
  const ticket = service.tickets[ticketIndex];
  const dish = ticket?.dishes[dishIndex];
  if (ticket === undefined || dish === undefined) return service;
  const stepIndex = nextStepIndex(dish);
  if (stepIndex === null) return service;
  const steps = dish.steps.map((entry, index) => (index === stepIndex ? step : entry));
  const updatedDish = {
    ...dish,
    steps,
    readyAt: at,
    doneAt: steps.every((entry) => entry !== null) ? at : null,
  };
  const dishes = ticket.dishes.map((entry, index) => (index === dishIndex ? updatedDish : entry));
  const sent = dishes.every(dishFinished);
  const wasFull = railCount(service) >= service.plan.railSize;
  const updatedTicket: ServiceTicket = { ...ticket, dishes, sentAt: sent ? at : null };
  const next: ServiceRun = {
    ...service,
    tickets: service.tickets.map((entry, index) => (index === ticketIndex ? updatedTicket : entry)),
    lastAt: at,
    openSince: sent && wasFull ? at : service.openSince,
  };
  return admitTickets(next, at);
}

function locate(
  service: ServiceRun,
  slot: DishSlot,
): { readonly ticketIndex: number; readonly ticket: ServiceTicket } | null {
  const ticketIndex = service.tickets.findIndex((entry) => entry.id === slot.ticketId);
  const ticket = service.tickets[ticketIndex];
  if (ticket === undefined || ticket.railAt === null || ticket.sentAt !== null) return null;
  return { ticketIndex, ticket };
}

export function serviceStep(state: GameState, slot: DishSlot, at: number, record: QuickRecord): GameState {
  const current = state.service;
  if (current === null || !validMoment(current, at)) return state;
  const service = admitTickets(current, at);
  const found = locate(service, slot);
  const dish = found?.ticket.dishes[slot.dishIndex];
  if (found === null || dish === undefined || nextStepKind(dish) !== record.kind) return state;
  const def = dishById(dish.dishId);
  const start = quickTasteStart(state, service.seed, found.ticketIndex, slot.dishIndex, def);
  const score = scoreQuick(state, def, record, start);
  if (score === null) return state;
  const step: ServiceStep = { accuracy: score.accuracy, by: "player", assisted: score.assisted };
  return { ...state, service: completeStep(service, found.ticketIndex, slot.dishIndex, step, at) };
}

export function staffStepIssue(service: ServiceRun, slot: DishSlot, at: number): string | null {
  const found = locate(admitTickets(service, at), slot);
  const dish = found?.ticket.dishes[slot.dishIndex];
  const kind = dish === undefined ? null : nextStepKind(dish);
  if (dish === undefined || kind === null) return "Nothing to cook here.";
  const helper = service.staff.find((member) => member.station === STEP_STATIONS[kind]);
  if (helper === undefined) return "No helper is on that station.";
  const ready = Math.max(dish.readyAt ?? at, helper.freeAt) + STAFF_SECONDS;
  return at >= ready ? null : "Your helper is still working on it.";
}

export function staffStep(state: GameState, slot: DishSlot, at: number): GameState {
  const current = state.service;
  if (current === null || !validMoment(current, at) || staffStepIssue(current, slot, at) !== null)
    return state;
  const service = admitTickets(current, at);
  const found = locate(service, slot);
  const dish = found?.ticket.dishes[slot.dishIndex];
  const kind = dish === undefined ? null : nextStepKind(dish);
  if (found === null || kind === null) return state;
  const station = STEP_STATIONS[kind];
  const helper = service.staff.find((member) => member.station === station);
  const def = helper === undefined ? undefined : staffById(helper.staffId);
  if (helper === undefined || def === undefined) return state;
  const step: ServiceStep = {
    accuracy: staffSkill(def, station, state.profile.trait),
    by: "staff",
    assisted: false,
  };
  const worked = completeStep(service, found.ticketIndex, slot.dishIndex, step, at);
  return {
    ...state,
    service: {
      ...worked,
      staff: worked.staff.map((member) =>
        member.staffId === helper.staffId ? { ...member, freeAt: at } : member,
      ),
    },
  };
}

export function assignStaff(state: GameState, staffId: string, station: StationId | null): GameState {
  const service = state.service;
  if (service === null) return state;
  const member = service.staff.find((entry) => entry.staffId === staffId);
  if (member === undefined || member.station === station) return state;
  if (station !== null && !STATIONS.includes(station)) return state;
  return {
    ...state,
    service: {
      ...service,
      staff: service.staff.map((entry) => {
        if (entry.staffId === staffId) return { ...entry, station };
        return station !== null && entry.station === station ? { ...entry, station: null } : entry;
      }),
    },
  };
}
