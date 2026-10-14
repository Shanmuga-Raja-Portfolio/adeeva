import type { Dish, DishId } from "../../../content/dish";
import type { StationId } from "../../../content/station";
import {
  admitTickets,
  dishById,
  nextStepKind,
  onRail,
  STEP_STATIONS,
  type DishSlot,
  type ServiceRun,
  type ServiceTicket,
} from "../../../core";

export interface WaitingDish {
  readonly slot: DishSlot;
  readonly key: string;
  readonly ticketIndex: number;
  readonly table: number;
  readonly dishId: DishId;
  readonly dishName: string;
  readonly readyAt: number;
}

export function slotKey(slot: DishSlot): string {
  return `${slot.ticketId}:${slot.dishIndex}`;
}

export function railView(service: ServiceRun, now: number): ServiceRun {
  return admitTickets(service, now);
}

export function waitingAt(service: ServiceRun, station: StationId): WaitingDish[] {
  return service.tickets.flatMap((ticket: ServiceTicket, ticketIndex) =>
    onRail(ticket)
      ? ticket.dishes.flatMap((dish, dishIndex) => {
          const kind = nextStepKind(dish);
          if (kind === null || STEP_STATIONS[kind] !== station) return [];
          const slot = { ticketId: ticket.id, dishIndex };
          return [
            {
              slot,
              key: slotKey(slot),
              ticketIndex,
              table: ticket.table,
              dishId: dish.dishId,
              dishName: dishById(dish.dishId).name,
              readyAt: dish.readyAt ?? 0,
            },
          ];
        })
      : [],
  );
}

export function dishInSlot(service: ServiceRun, slot: DishSlot): Dish | null {
  const entry = service.tickets.find((ticket) => ticket.id === slot.ticketId)?.dishes[slot.dishIndex];
  return entry === undefined ? null : dishById(entry.dishId);
}

export function printerCount(service: ServiceRun): number {
  return service.tickets.filter((ticket) => ticket.railAt === null && ticket.sentAt === null).length;
}

export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
