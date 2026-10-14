import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import { WINDOW_PROP_IDS, type WindowPropId } from "../content/windowProp";
import type { WindowDisplay, WindowSpot } from "./boutique";
import { propById } from "./catalog";
import type { GameState } from "./gameState";
import { hallClosedIssue } from "./hallDay";
import { hangingPieces } from "./rackRoom";
import { stallDayIssue } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";

export const WINDOW_WIDTH = 600;
export const WINDOW_HEIGHT = 400;
export const WINDOW_HOURS = 1;
export const WINDOW_PIECES = 3;
export const WINDOW_PROPS_HELD = 4;
export const PLINTH_PIECES = 4;
export const PLINTH_PROPS = 5;

export function windowLimits(state: Pick<GameState, "upgrades">): {
  readonly pieces: number;
  readonly props: number;
} {
  const plinths = state.upgrades.includes("window-plinths");
  return {
    pieces: plinths ? PLINTH_PIECES : WINDOW_PIECES,
    props: plinths ? PLINTH_PROPS : WINDOW_PROPS_HELD,
  };
}

function inside(spot: WindowSpot): boolean {
  return (
    Number.isFinite(spot.x) &&
    Number.isFinite(spot.y) &&
    spot.x >= 0 &&
    spot.y >= 0 &&
    spot.x <= WINDOW_WIDTH &&
    spot.y <= WINDOW_HEIGHT
  );
}

function sameWindow(a: WindowDisplay, b: WindowDisplay): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function windowIssues(state: GameState, plan: WindowDisplay): string[] {
  const boutique = state.boutique;
  if (boutique === null) return ["The window is at the boutique."];
  const closed = stallDayIssue(state.calendar.day) ?? hallClosedIssue(state);
  if (closed !== null) return [closed];
  const reasons: string[] = [];
  const limits = windowLimits(state);
  const pieceIds = plan.pieces.map((entry) => entry.pieceId);
  const propIds = plan.props.map((entry) => entry.propId);
  if (pieceIds.length > limits.pieces) reasons.push(`The window holds ${limits.pieces} pieces.`);
  if (propIds.length > limits.props) reasons.push(`The window holds ${limits.props} props.`);
  if (new Set(pieceIds).size !== pieceIds.length || new Set(propIds).size !== propIds.length)
    reasons.push("Each piece and prop can stand in one spot.");
  const hanging = new Set(hangingPieces(state).map((piece) => piece.id));
  if (pieceIds.some((id) => !hanging.has(id))) reasons.push("Only pieces on the rack can go in the window.");
  if (propIds.some((id) => !WINDOW_PROP_IDS.includes(id) || !boutique.props.includes(id)))
    reasons.push("Buy a prop before it goes in the window.");
  if (![...plan.pieces, ...plan.props].every(inside)) reasons.push("Keep everything inside the window.");
  if (reasons.length > 0) return reasons;
  if (sameWindow(plan, boutique.window)) return ["The window already looks like this."];
  const hours = hoursShortfallReason(state.calendar, WINDOW_HOURS);
  return hours === null ? [] : [hours];
}

export function dressWindow(state: GameState, plan: WindowDisplay): GameState {
  const boutique = state.boutique;
  if (boutique === null || windowIssues(state, plan).length > 0) return state;
  const spent = spendHours(state, WINDOW_HOURS);
  if (spent === null) return state;
  const window: WindowDisplay = {
    pieces: plan.pieces.map((entry) => ({ pieceId: entry.pieceId, x: entry.x, y: entry.y })),
    props: plan.props.map((entry) => ({ propId: entry.propId, x: entry.x, y: entry.y })),
  };
  return queueStoryTrigger({ ...spent, boutique: { ...boutique, window } }, "first-window");
}

export function propIssue(state: GameState, propId: WindowPropId): string | null {
  const boutique = state.boutique;
  if (boutique === null) return "Props are for the boutique window.";
  if (!WINDOW_PROP_IDS.includes(propId)) return "That prop isn't in the shop.";
  const prop = propById(propId);
  if (boutique.props.includes(propId)) return `${prop.name} is already yours.`;
  return state.coins < prop.price ? `${prop.name} costs ${prop.price} coins.` : null;
}

export function buyProp(state: GameState, propId: WindowPropId): GameState {
  const boutique = state.boutique;
  if (boutique === null || propIssue(state, propId) !== null) return state;
  return {
    ...state,
    coins: state.coins - propById(propId).price,
    boutique: { ...boutique, props: [...boutique.props, propId] },
  };
}

export function withoutSoldPieces(window: WindowDisplay, remaining: ReadonlySet<string>): WindowDisplay {
  const pieces = window.pieces.filter((entry) => remaining.has(entry.pieceId));
  return pieces.length === window.pieces.length ? window : { ...window, pieces };
}
