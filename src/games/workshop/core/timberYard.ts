import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { BOARD_SIZE_IDS, type BoardSizeId } from "../content/boardSize";
import type { ProductId } from "../content/product";
import type { WoodId } from "../content/wood";
import { boardKnots, canonicalRects } from "./boardKnots";
import { boardSizeById, productById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";
import type { OwnedBoard } from "./ownedBoard";

export const TIMBER_TRIP_HOURS = 1;
const TIMBER_RACK_SHARE = 0.9;
const MAX_BOARDS_PER_BUY = 6;

export type BoardCounts = Readonly<Record<BoardSizeId, number>>;

const NO_BOARDS: BoardCounts = { short: 0, long: 0, panel: 0 };

export function boardPrice(state: Pick<GameState, "upgrades">, woodId: WoodId, size: BoardSizeId): number {
  const rack = state.upgrades.includes("timber-rack") ? TIMBER_RACK_SHARE : 1;
  return Math.round(woodById(woodId).price * boardSizeById(size).priceFactor * rack);
}

export function planBoards(productId: ProductId): BoardCounts {
  const counts = { ...NO_BOARDS };
  for (const board of productById(productId).canonical) counts[board.size] += 1;
  return counts;
}

export function ownedBoardsOf(state: GameState, woodId: WoodId): OwnedBoard[] {
  return state.boards.filter((board) => board.woodId === woodId);
}

export function missingPlanBoards(state: GameState, run: CommissionRun): BoardCounts {
  const { productId, woodId } = run.design;
  if (productId === null || woodId === null) return NO_BOARDS;
  const plan = planBoards(productId);
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

export function buyIssues(state: GameState, sizes: readonly BoardSizeId[]): ActionCheck {
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
    const hours = hoursShortfallReason(state.calendar, TIMBER_TRIP_HOURS);
    if (hours !== null) reasons.push(hours);
  }
  return actionCheck(reasons);
}

export function buyBoards(state: GameState, sizes: readonly BoardSizeId[]): GameState {
  const run = state.activeRun;
  if (run === null || !buyIssues(state, sizes).ok) return state;
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
      knots: boardKnots(number, woodId, size, canonicalRects(run.design.productId, size)),
      cost: boardPrice(state, woodId, size),
      spare: false,
    };
  });
  const hours = run.tripPaid ? 0 : TIMBER_TRIP_HOURS;
  return {
    ...state,
    coins: state.coins - boardsCost(state, woodId, sizes),
    calendar: { ...state.calendar, hoursLeft: state.calendar.hoursLeft - hours },
    boards: [...state.boards, ...bought],
    nextBoardNumber,
    activeRun: { ...run, tripPaid: true },
  };
}

export function buyPlan(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  return buyBoards(state, countList(missingPlanBoards(state, run)));
}
