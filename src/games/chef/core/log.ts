import type { CuisineId } from "../content/cuisine";
import type { DishId } from "../content/dish";
import type { TestId } from "../content/career";
import type { DishEvaluation, OrderEvaluation } from "./dishEvaluate";
import type { Reward } from "./rewards";
import type { ServiceKind, Special } from "./service";

export const LOG_SIZE = 30;

export type DishPurposeKind = "lesson" | "test" | "order" | "practice" | "segment";

export interface MasteryGain {
  readonly cuisine: CuisineId;
  readonly gain: number;
}

export interface DishLogEntry {
  readonly kind: "dish";
  readonly runId: string;
  readonly day: number;
  readonly dishId: DishId;
  readonly purpose: DishPurposeKind;
  readonly quality: number;
  readonly stars: number;
  readonly evaluation: DishEvaluation | null;
  readonly reward: Reward | null;
  readonly mastery: number;
}

export interface OrderLogEntry {
  readonly kind: "order";
  readonly runId: string;
  readonly day: number;
  readonly gigId: string;
  readonly clientId: string;
  readonly evaluation: OrderEvaluation;
  readonly reward: Reward;
}

export interface TestLogEntry {
  readonly kind: "test";
  readonly runId: string;
  readonly day: number;
  readonly test: TestId;
  readonly passed: boolean;
  readonly scores: readonly number[];
  readonly mark: number;
  readonly feedback: readonly string[];
}

export interface SpecialSale {
  readonly special: Special;
  readonly sold: number;
  readonly bonus: number;
  readonly soldOut: boolean;
}

export interface ServiceLogEntry {
  readonly kind: "service";
  readonly runId: string;
  readonly day: number;
  readonly service: ServiceKind;
  readonly cuisines: readonly CuisineId[];
  readonly score: number;
  readonly stars: number;
  readonly averageQuality: number;
  readonly averageOnTime: number;
  readonly handledShare: number;
  readonly passed: boolean;
  readonly teamTickets: number;
  readonly dishes: number;
  readonly wage: number;
  readonly reward: Reward;
  readonly special: SpecialSale | null;
  readonly mastery: readonly MasteryGain[];
  readonly feedback: readonly string[];
}

export type LogEntry = DishLogEntry | OrderLogEntry | TestLogEntry | ServiceLogEntry;

export function appendLog(log: readonly LogEntry[], ...entries: readonly LogEntry[]): readonly LogEntry[] {
  return [...log, ...entries].slice(-LOG_SIZE);
}

export function entriesFor(log: readonly LogEntry[], runId: string): LogEntry[] {
  return log.filter((entry) => entry.runId === runId);
}
