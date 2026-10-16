import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { RngState } from "../../../engine/rng";
import { drawDistinct } from "../../../engine/rngDraw";
import { weekEndDay } from "../../../engine/week";
import type { BoardSizeId } from "../content/boardSize";
import { CLIENTS } from "../content/client";
import { SHOWROOM_LATER_FLAG, SHOWROOM_OFFER_BEAT } from "../content/showroomStoryBeat";
import type { WoodId } from "../content/wood";
import { NEW_APPRENTICE } from "./apprentice";
import { initialFair } from "./fairState";
import type { GameState } from "./gameState";
import type { OwnedBoard } from "./ownedBoard";
import { initialShowroom } from "./showroomState";
import { queueStoryTrigger } from "./storyQueue";

export const SHOWROOM_REPUTATION = 45;
export const SHOWROOM_DELIVERIES = 14;
export const VISITOR_COUNT = 3;

export const SPARE_BOARD_PILE: readonly (readonly [WoodId, BoardSizeId])[] = [
  ["pine", "long"],
  ["pine", "long"],
  ["pine", "panel"],
  ["beech", "long"],
  ["beech", "long"],
];

export function showroomOfferReady(state: GameState): boolean {
  return (
    state.career === "garage" &&
    state.reputation >= SHOWROOM_REPUTATION &&
    state.delivered >= SHOWROOM_DELIVERIES &&
    !state.story.seen.includes(SHOWROOM_OFFER_BEAT) &&
    !state.story.queue.includes(SHOWROOM_OFFER_BEAT)
  );
}

export function queueShowroomOffer(state: GameState): GameState {
  return showroomOfferReady(state) ? queueStoryTrigger(state, "showroom-offer") : state;
}

export function canOpenShowroom(state: GameState): ActionCheck {
  if (state.career !== "garage") return actionCheck(["The showroom is already open."]);
  const reasons: string[] = [];
  if (state.reputation < SHOWROOM_REPUTATION)
    reasons.push(`The showroom opens at reputation ${SHOWROOM_REPUTATION}.`);
  if (state.delivered < SHOWROOM_DELIVERIES)
    reasons.push(`Deliver ${SHOWROOM_DELIVERIES} pieces first (${state.delivered} so far).`);
  return actionCheck(reasons);
}

export function drawVisitors(state: Pick<GameState, "log">, rng: RngState): [string[], RngState] {
  const past = [...new Set(state.log.map((entry) => entry.clientId))];
  const pool = past.length >= VISITOR_COUNT ? past : CLIENTS.map((client) => client.id);
  return drawDistinct(rng, pool, VISITOR_COUNT);
}

export function withBoardPile(
  state: GameState,
  pile: readonly (readonly [WoodId, BoardSizeId])[],
): GameState {
  let number = state.nextBoardNumber;
  const boards = pile.map(([woodId, size]): OwnedBoard => {
    const board: OwnedBoard = { id: `board-${number}`, woodId, size, knots: [], cost: 0, spare: true };
    number += 1;
    return board;
  });
  return { ...state, boards: [...state.boards, ...boards], nextBoardNumber: number };
}

export function showroomFields(state: GameState, seasonStartDay: number): GameState {
  const [visitors, rng] = drawVisitors(state, state.rng);
  return {
    ...state,
    rng,
    career: "showroom",
    showroom: initialShowroom(seasonStartDay),
    fair: initialFair(visitors),
    apprentice: NEW_APPRENTICE,
  };
}

export function openShowroom(state: GameState): GameState {
  if (!canOpenShowroom(state).ok) return state;
  const opened = showroomFields(withBoardPile(state, SPARE_BOARD_PILE), weekEndDay(state.calendar.day) + 1);
  return queueStoryTrigger(opened, "showroom-opened");
}

export function showroomLater(state: GameState): boolean {
  return state.career === "garage" && state.story.flags.includes(SHOWROOM_LATER_FLAG);
}

export function openShowroomLater(state: GameState): GameState {
  return showroomLater(state) ? openShowroom(state) : state;
}
