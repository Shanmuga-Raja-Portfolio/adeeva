import { clamp } from "../../../engine/clamp";
import type { DifficultyId } from "../../../engine/difficulty";
import type { PrizeLine, Project } from "./larkspur";
import { purseLeft } from "./purse";

const HALF = 0.5;
const PAY_BASE = 0.8;
const PAY_SPREAD = 0.4;
const NOTE_FLOOR = 55;
const NOTE_STEP = 5;
const MAX_NOTES = 8;
const NOTE_BASE = 8;
const NOTE_PER_PLOT = 2;
const SOURCING_SHARE = 0.15;

export function secondHalf(fee: number, overall: number, difficulty: DifficultyId): number {
  const rate = PAY_BASE + (PAY_SPREAD * overall) / 100;
  return Math.round(HALF * fee * (difficulty === "relaxed" ? Math.max(1, rate) : rate));
}

export function visitorNotes(overall: number): number {
  return clamp(Math.floor((overall - NOTE_FLOOR) / NOTE_STEP), 0, MAX_NOTES);
}

export function noteValue(plotNumber: number): number {
  return NOTE_BASE + NOTE_PER_PLOT * plotNumber;
}

function topUpsBack(project: Pick<Project, "purse" | "added" | "spent">): number {
  return Math.max(0, Math.min(project.added, purseLeft(project)));
}

export function carefulSourcing(project: Pick<Project, "purse" | "added" | "spent">): number {
  const saved = purseLeft(project) - topUpsBack(project);
  return Math.max(0, Math.min(Math.round(HALF * saved), Math.round(SOURCING_SHARE * project.purse)));
}

export function openHousePrize(
  project: Pick<Project, "fee" | "purse" | "added" | "spent">,
  overall: number,
  difficulty: DifficultyId,
  plotNumber: number,
): PrizeLine[] {
  const notes = visitorNotes(overall);
  const back = topUpsBack(project);
  return [
    { label: "Bellwind's second half of the fee", amount: secondHalf(project.fee, overall, difficulty) },
    { label: `Visitor notes (${notes})`, amount: notes * noteValue(plotNumber) },
    { label: "Careful sourcing", amount: carefulSourcing(project) },
    ...(back > 0 ? [{ label: "Your top-ups, back from the purse", amount: back }] : []),
  ];
}
