import type { StepKind } from "../content/dish";
import { dishById } from "./catalog";
import { hasClock, type ServiceDish, type ServiceRun, type ServiceTicket } from "./service";

export const LAMP_HOLD_SECONDS = 20;
export const LAMP_DROP_PER_SECOND = 0.01;
export const LAMP_FLOOR = 0.85;
export const LATE_FALLOFF_SECONDS = 120;
export const LATE_FLOOR = 0.5;

export function onRail(ticket: ServiceTicket): boolean {
  return ticket.railAt !== null && ticket.sentAt === null;
}

export function railCount(service: ServiceRun): number {
  return service.tickets.filter(onRail).length;
}

export function admitTickets(service: ServiceRun, now: number): ServiceRun {
  let free = service.plan.railSize - railCount(service);
  let changed = false;
  const tickets = service.tickets.map((ticket) => {
    if (free <= 0 || ticket.railAt !== null || ticket.sentAt !== null) return ticket;
    if (hasClock(service) && ticket.arrival > now) {
      free = 0;
      return ticket;
    }
    free -= 1;
    changed = true;
    const railAt = Math.max(ticket.arrival, service.openSince);
    return {
      ...ticket,
      railAt,
      dishes: ticket.dishes.map((dish) => ({ ...dish, readyAt: railAt })),
    };
  });
  return changed ? { ...service, tickets } : service;
}

export function nextStepIndex(dish: ServiceDish): number | null {
  const index = dish.steps.findIndex((step) => step === null);
  return index === -1 ? null : index;
}

export function nextStepKind(dish: ServiceDish): StepKind | null {
  const index = nextStepIndex(dish);
  if (index === null) return null;
  return dishById(dish.dishId).steps[index]?.kind ?? null;
}

export function dishFinished(dish: ServiceDish): boolean {
  return nextStepIndex(dish) === null;
}

export function lampFactor(service: ServiceRun, dish: ServiceDish, sentAt: number): number {
  if (!hasClock(service) || dish.doneAt === null) return 1;
  const wait = sentAt - dish.doneAt;
  if (wait <= service.plan.lampHoldSeconds) return 1;
  return Math.max(LAMP_FLOOR, 1 - LAMP_DROP_PER_SECOND * (wait - service.plan.lampHoldSeconds));
}

export function ticketOnTime(service: ServiceRun, ticket: ServiceTicket): number {
  if (!hasClock(service) || ticket.railAt === null || ticket.sentAt === null) return 1;
  const taken = ticket.sentAt - ticket.railAt;
  if (taken <= service.plan.targetSeconds) return 1;
  return Math.max(LATE_FLOOR, 1 - (taken - service.plan.targetSeconds) / LATE_FALLOFF_SECONDS);
}

export function serviceOver(service: ServiceRun, now: number): boolean {
  if (service.tickets.every((ticket) => ticket.sentAt !== null)) return true;
  return hasClock(service) && now >= service.plan.lengthSeconds;
}
