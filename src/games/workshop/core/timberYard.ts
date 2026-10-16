import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { BOARD_SIZE_IDS, type BoardSizeId } from "../content/boardSize";
import type { WoodId } from "../content/wood";
import { boardKnots, canonicalRects } from "./boardKnots";
import { boardSizeById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";
import type { OwnedBoard } from "./ownedBoard";
import { runCanonical, type RunShape } from "./pieceParts";

export const TIMBER_TRIP_HOURS = 1;
const TIMBER_RACK_SHARE = 0.9;
const MAX_BOARDS_PER_BUY = 16;

export type BoardCounts = Readonly<Record<BoardSizeId, number>>;

const NO_BOARDS: BoardCounts = { short: 0, long: 0, panel: 0 };

export function boardPrice(state: Pick<GameState, "upgrades">, woodId: WoodId, size: BoardSizeId): number {
  const rack = state.upgrades.includes("timber-rack") ? TIMBER_RACK_SHARE : 1;
  return Math.round(woodById(woodId).price * boardSizeById(size).priceFactor * rack);
}

export function planBoards(run: RunShape): BoardCounts {
  const counts = { ...NO_BOARDS };
  for (const board of runCanonical(run)) counts[board.size] += 1;
  return counts;
}

export function ownedBoardsOf(state: GameState, woodId: WoodId): OwnedBoard[] {
  return state.boards.filter((board) => board.woodId === woodId);
}

export function missingPlanBoards(state: GameState, run: CommissionRun): BoardCounts {
  const woodId = run.design.woodId;
  if (woodId === null) return NO_BOARDS;
  const plan = planBoards(run);
  const owned = ownedBoardsOf(state, woodId);
  const missing = { ...NO_BOARDS };
  for (const size of BOARD_SIZE_IDS)
    missing[size] = Math.max(0, plan[size] - owned.filter((board) => board.size === size).length);
  return missing;
}

export function countList(counts: BoardCounts): BoardSizeId[] {
  return BOARD_SIZE_IDS.flatMap((size) => Array.from({ length: counts[size] }, () => size));
}

function boardsCost(state: GameState, woodId: WoodId, sizes: readonly BoardSizeId[]): number {
  return sizes.reduce((sum, size) => sum + boardPrice(state, woodId, size), 0);
}

export function buyIssues(
  state: GameState,
  sizes: readonly BoardSizeId[],
  tripHours = TIMBER_TRIP_HOURS,
): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "timber") return actionCheck(["Visit the timber yard first."]);
  const woodId = run.design.woodId;
  if (woodId === null) return actionCheck(["Pick a wood in the design step."]);
  if (sizes.length === 0) return actionCheck(["Pick a board to buy."]);
  if (sizes.length > MAX_BOARDS_PER_BUY) return actionCheck(["That is more boards than the cart holds."]);
  if (!sizes.every((size) => BOARD_SIZE_IDS.includes(size))) return actionCheck(["That board is not sold."]);
  const reasons: string[] = [];
  const cost = boardsCost(state, woodId, sizes);
  if (cost > state.coins) reasons.push(`Those boards cost ${cost} coins and you have ${state.coins}.`);
  if (!run.tripPaid) {
    const hours = hoursShortfallReason(state.calendar, tripHours);
    if (hours !== null) reasons.push(hours);
  }
  return actionCheck(reasons);
}

export function buyBoards(
  state: GameState,
  sizes: readonly BoardSizeId[],
  tripHours = TIMBER_TRIP_HOURS,
): GameState {
  const run = state.activeRun;
  if (run === null || !buyIssues(state, sizes, tripHours).ok) return state;
  const woodId = run.design.woodId;
  if (woodId === null) return state;
  let nextBoardNumber = state.nextBoardNumber;
  const bought: OwnedBoard[] = sizes.map((size) => {
    const number = nextBoardNumber;
    nextBoardNumber += 1;
    return {
      id: `board-${number}`,
      woodId,
      size,
      knots: boardKnots(number, woodId, size, canonicalRects(run, size)),
      cost: boardPrice(state, woodId, size),
      spare: false,
    };
  });
  const hours = run.tripPaid ? 0 : tripHours;
  return {
    ...state,
    coins: state.coins - boardsCost(state, woodId, sizes),
    calendar: { ...state.calendar, hoursLeft: state.calendar.hoursLeft - hours },
    boards: [...state.boards, ...bought],
    nextBoardNumber,
    activeRun: { ...run, tripPaid: true },
  };
}

export function buyPlan(state: GameState, tripHours = TIMBER_TRIP_HOURS): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  return buyBoards(state, countList(missingPlanBoards(state, run)), tripHours);
}
