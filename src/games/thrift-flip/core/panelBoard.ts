import type { Point } from "../../../engine/geometry/point";
import { WORN_SPOT_SIZE, type FindId } from "../content/find";
import { findById } from "./catalog";
import { wornSpotOf, type OwnedFind } from "./ownedFind";

export const BOARD_ROW_WIDTH = 160;
export const PANEL_GAP = 6;

export interface BoardPanel {
  readonly findKey: string;
  readonly findId: FindId;
  readonly panel: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface WornSpotArea {
  readonly findKey: string;
  readonly polygon: readonly Point[];
}

export interface PanelBoard {
  readonly panels: readonly BoardPanel[];
  readonly spots: readonly WornSpotArea[];
  readonly width: number;
  readonly height: number;
}

function square(x: number, y: number, size: number): Point[] {
  return [
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
  ];
}

export function panelBoard(finds: readonly OwnedFind[]): PanelBoard {
  const panels: BoardPanel[] = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  for (const owned of finds) {
    findById(owned.findId).panels.forEach((size, panel) => {
      if (x > 0 && x + size.width > BOARD_ROW_WIDTH) {
        x = 0;
        y += rowHeight + PANEL_GAP;
        rowHeight = 0;
      }
      panels.push({ findKey: owned.id, findId: owned.findId, panel, x, y, ...size });
      x += size.width + PANEL_GAP;
      rowHeight = Math.max(rowHeight, size.height);
    });
  }
  const spots = finds.flatMap((owned): WornSpotArea[] => {
    const spot = wornSpotOf(owned);
    const host = panels.find((entry) => entry.findKey === owned.id && entry.panel === spot?.panel);
    if (spot === null || host === undefined) return [];
    return [{ findKey: owned.id, polygon: square(host.x + spot.x, host.y + spot.y, WORN_SPOT_SIZE) }];
  });
  const width = Math.max(0, ...panels.map((panel) => panel.x + panel.width));
  const height = Math.max(0, ...panels.map((panel) => panel.y + panel.height));
  return { panels, spots, width, height };
}

export function panelArea(panel: BoardPanel): number {
  return panel.width * panel.height;
}
