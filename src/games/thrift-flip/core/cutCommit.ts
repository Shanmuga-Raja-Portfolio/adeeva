import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { ASSIST_CUT_ACCURACY } from "../../../engine/geometry/traceAccuracy";
import { ownEntry } from "../../../engine/ownEntry";
import { TRIM_IDS, type TrimId } from "../../adeeva/content/trim";
import { MAX_SCRAPS_PER_FIND, SCRAP_AREA_CM2 } from "../content/finish";
import { findById } from "./catalog";
import { flipPieces } from "./flipPieces";
import type { FlipRun } from "./flipRun";
import type { GameState, Stock } from "./gameState";
import { runBoard, runLayoutIssues } from "./layout";
import type { OwnedFind } from "./ownedFind";
import { panelArea } from "./panelBoard";
import { panelUnder, piecePolygon } from "./placement";
import { polygonArea } from "../../../engine/geometry/polygonArea";
import { addScraps, type ScrapSource } from "./scrap";
import { stallDayIssue } from "./stallCalendar";
import { savedNotions } from "./unpick";

export function canCommitCut(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "cut") return actionCheck(["Cutting happens at the cutting table."]);
  if (run.cutDone) return actionCheck(["These pieces are already cut."]);
  const stall = stallDayIssue(state.calendar.day);
  if (stall !== null) return actionCheck([stall]);
  return actionCheck(runLayoutIssues(run).map((issue) => issue.message));
}

export function placedAreaByFind(run: FlipRun): Readonly<Record<string, number>> {
  const board = runBoard(run);
  const totals: Record<string, number> = {};
  for (const piece of flipPieces(run.design)) {
    const placement = run.placements[piece.id];
    if (placement === undefined) continue;
    const polygon = piecePolygon(piece, placement);
    const panel = panelUnder(board, polygon);
    if (panel === null) continue;
    totals[panel.findKey] = (totals[panel.findKey] ?? 0) + polygonArea(polygon);
  }
  return totals;
}

function leftoverScraps(run: FlipRun): ScrapSource[] {
  const board = runBoard(run);
  const placed = placedAreaByFind(run);
  return run.finds.flatMap((owned: OwnedFind) => {
    const find = findById(owned.findId);
    const area = board.panels
      .filter((panel) => panel.findKey === owned.id)
      .reduce((sum, panel) => sum + panelArea(panel), 0);
    const spare = Math.max(0, area - (placed[owned.id] ?? 0));
    const count = Math.min(MAX_SCRAPS_PER_FIND, Math.floor(spare / SCRAP_AREA_CM2));
    return Array.from({ length: count }, () => ({
      name: `${find.name} scrap`,
      colour: find.colour,
      print: find.print,
      material: find.material,
      tags: find.tags,
    }));
  });
}

function creditNotions(stock: Stock, notions: readonly TrimId[]): Readonly<Record<TrimId, number>> {
  return Object.fromEntries(
    TRIM_IDS.map((id) => [id, stock.savedTrims[id] + notions.filter((notion) => notion === id).length]),
  ) as Record<TrimId, number>;
}

export function commitCut(state: GameState, assisted: boolean): GameState {
  const run = state.activeRun;
  if (run === null || !canCommitCut(state).ok) return state;
  const accuracy: Record<string, number> = {};
  for (const piece of flipPieces(run.design)) {
    const kept = ownEntry(run.cutTraces, piece.id);
    if (kept === undefined && !assisted) return state;
    accuracy[piece.id] = kept ?? ASSIST_CUT_ACCURACY;
  }
  const used = new Set(run.finds.map((owned) => owned.id));
  const scraps = addScraps(state.stock.scraps, leftoverScraps(run), state.next.scrap);
  return {
    ...state,
    stock: {
      finds: state.stock.finds.filter((owned) => !used.has(owned.id)),
      savedTrims: creditNotions(state.stock, savedNotions(run, state.upgrades.includes("sharp-ripper"))),
      scraps: scraps.scraps,
    },
    next: { ...state.next, scrap: scraps.nextNumber },
    activeRun: { ...run, cutAccuracy: accuracy, cutDone: true },
  };
}
