import type { CuisineId } from "../content/cuisine";
import type { DishId } from "../content/dish";
import type { StationId } from "../content/station";

export const SERVICE_STEP_BY = ["player", "staff", "team"] as const;
export type ServiceStepBy = (typeof SERVICE_STEP_BY)[number];

export interface ServiceStep {
  readonly accuracy: number;
  readonly by: ServiceStepBy;
  readonly assisted: boolean;
}

export interface ServiceDish {
  readonly dishId: DishId;
  readonly steps: readonly (ServiceStep | null)[];
  readonly readyAt: number | null;
  readonly doneAt: number | null;
}

export interface ServiceTicket {
  readonly id: string;
  readonly table: number;
  readonly arrival: number;
  readonly railAt: number | null;
  readonly sentAt: number | null;
  readonly dishes: readonly ServiceDish[];
  readonly team: boolean;
}

export interface ServiceStaff {
  readonly staffId: string;
  readonly station: StationId | null;
  readonly freeAt: number;
}

export interface Special {
  readonly dishId: DishId;
  readonly price: number;
}

export const SERVICE_KINDS = ["shift", "station-test"] as const;
export type ServiceKind = (typeof SERVICE_KINDS)[number];

export interface ServicePlan {
  readonly railSize: number;
  readonly tickets: number;
  readonly targetSeconds: number;
  readonly minimum: number;
  readonly bonusFee: number;
  readonly wage: number;
  readonly lengthSeconds: number;
  readonly maxDishesPerTicket: number;
}

export interface ServiceRun {
  readonly id: string;
  readonly kind: ServiceKind;
  readonly cuisines: readonly CuisineId[];
  readonly plan: ServicePlan;
  readonly tickets: readonly ServiceTicket[];
  readonly staff: readonly ServiceStaff[];
  readonly special: Special | null;
  readonly lastAt: number;
  readonly openSince: number;
  readonly seed: number;
}

export function hasClock(service: Pick<ServiceRun, "plan">): boolean {
  return service.plan.lengthSeconds > 0;
}
