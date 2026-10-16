import { describe, expect, it } from "vitest";
import { boardPrice } from "../core/timberYard";
import { APPRENTICE_JOBS } from "./apprentice";
import { BOARD_SIZES, type BoardSizeId } from "./boardSize";
import { BOOTH_BACKDROPS } from "./boothBackdrop";
import { CAREERS } from "./career";
import { CLIENTS } from "./client";
import { CUSHION_FABRICS } from "./cushionFabric";
import { DECORS } from "./decor";
import { EXTRAS } from "./extra";
import { FAIR_BOOTHS } from "./fairBooth";
import { FAIR_MUSIC } from "./fairMusic";
import { FAIR_THEMES } from "./fairTheme";
import { FINISHES, PAINT_COLOURS } from "./finish";
import { HINTS, SET_HINTS } from "./hint";
import { MAKERS_NOTES } from "./makersNote";
import { FAIR_PANELS } from "./panelMember";
import { PART_OPTIONS } from "./partOption";
import { PRODUCTS, type ProductId } from "./product";
import { ROSETTES } from "./rosette";
import { SET_TEMPLATES } from "./setTemplate";
import type { ShadeId } from "./shade";
import { STORY_BEATS } from "./storyBeat";
import { UPGRADES } from "./upgrade";
import { WOODS } from "./wood";

function unique(ids: readonly (string | number)[]): boolean {
  return new Set(ids).size === ids.length;
}

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function spotFor(rects: readonly Rect[], width: number, height: number, size: BoardSizeId): Rect | null {
  const board = BOARD_SIZES.find((entry) => entry.id === size);
  if (board === undefined) return null;
  for (const [w, h] of [
    [width, height],
    [height, width],
  ] as const)
    for (let y = 0; y + h <= board.height; y += 1)
      for (let x = 0; x + w <= board.width; x += 1) {
        const rect = { x, y, w, h };
        if (!rects.some((other) => overlaps(rect, other))) return rect;
      }
  return null;
}

function bestPairs(pieces: readonly ProductId[]): number {
  const faces = pieces
    .flatMap((productId, piece) => {
      const product = PRODUCTS.find((entry) => entry.id === productId);
      return (product?.parts ?? [])
        .filter((part) => product?.showSurfaces.includes(part.id))
        .map((part) => ({ piece, width: part.width, height: part.height }));
    })
    .sort((a, b) => b.width * b.height - a.width * a.height);
  const boards: { size: BoardSizeId; rects: Rect[]; pieces: Set<number> }[] = [];
  for (const face of faces) {
    const shared = boards
      .filter((board) => !board.pieces.has(face.piece))
      .map((board) => ({ board, rect: spotFor(board.rects, face.width, face.height, board.size) }))
      .find((entry) => entry.rect !== null);
    if (shared?.rect !== undefined && shared.rect !== null) {
      shared.board.rects.push(shared.rect);
      shared.board.pieces.add(face.piece);
      continue;
    }
    const size: BoardSizeId = "panel";
    const rect = spotFor([], face.width, face.height, size);
    if (rect !== null) boards.push({ size, rects: [rect], pieces: new Set([face.piece]) });
  }
  return boards.reduce((sum, board) => sum + Math.max(0, board.pieces.size - 1), 0);
}

function makeableShades(): Set<ShadeId> {
  return new Set<ShadeId>([
    ...WOODS.map((wood) => wood.tone),
    ...PAINT_COLOURS,
    "ivory",
    "dark-wood",
    "charcoal",
    ...EXTRAS.flatMap((extra): ShadeId[] =>
      extra.colour === null || extra.colour === "wood" ? [] : [extra.colour],
    ),
    ...CUSHION_FABRICS.map((fabric) => fabric.colour),
  ]);
}

describe("showroom and Fair content", () => {
  it("doubles the slice and keeps every id unique", () => {
    expect(WOODS).toHaveLength(20);
    expect(PRODUCTS).toHaveLength(14);
    expect(PART_OPTIONS).toHaveLength(16);
    expect(FINISHES).toHaveLength(10);
    expect(EXTRAS).toHaveLength(16);
    expect(CLIENTS).toHaveLength(16);
    expect(UPGRADES).toHaveLength(8);
    expect(DECORS).toHaveLength(6);
    expect(STORY_BEATS).toHaveLength(27);
    expect(CAREERS).toHaveLength(2);
    expect(SET_TEMPLATES).toHaveLength(8);
    expect(FAIR_THEMES).toHaveLength(8);
    expect(FAIR_BOOTHS).toHaveLength(4);
    expect(BOOTH_BACKDROPS).toHaveLength(3);
    expect(FAIR_MUSIC).toHaveLength(4);
    expect(MAKERS_NOTES).toHaveLength(3);
    for (const list of [
      WOODS,
      PRODUCTS,
      PART_OPTIONS,
      FINISHES,
      EXTRAS,
      CLIENTS,
      UPGRADES,
      DECORS,
      STORY_BEATS,
    ])
      expect(unique(list.map((entry) => entry.id))).toBe(true);
    for (const list of [SET_TEMPLATES, FAIR_THEMES, BOOTH_BACKDROPS, FAIR_MUSIC, MAKERS_NOTES, ROSETTES])
      expect(unique(list.map((entry) => entry.id))).toBe(true);
  });

  it("marks show joints and show prices on every product", () => {
    for (const product of PRODUCTS) expect(product.showPrice, product.id).toBeGreaterThan(0);
    const shows = Object.fromEntries(
      PRODUCTS.map((product) => [product.id, product.joints.filter((joint) => joint.show).length]),
    );
    expect(shows).toMatchObject({
      bookshelf: 6,
      "toy-chest": 4,
      "bedside-table": 2,
      "window-bench": 2,
      footstool: 0,
    });
  });

  it("can reach every set's matchable pairs with a legal layout", () => {
    for (const template of SET_TEMPLATES)
      expect(bestPairs(template.pieces), template.id).toBeGreaterThanOrEqual(template.matchablePairs);
  });

  it("only uses colours a maker can actually make", () => {
    const shades = makeableShades();
    for (const theme of FAIR_THEMES)
      for (const shade of theme.palette) expect(shades.has(shade), shade).toBe(true);
    for (const client of CLIENTS)
      for (const shade of client.brief.favouredColours) expect(shades.has(shade), shade).toBe(true);
  });

  it("never puts Little Wheels on a seat or a step", () => {
    const wheels = EXTRAS.find((extra) => extra.id === "little-wheels");
    for (const product of PRODUCTS)
      if (product.seat || product.id === "step-stool") expect(wheels?.notOn).toContain(product.id);
  });

  it("keeps every client's lowest budget above their cheapest pine build", () => {
    for (const client of CLIENTS) {
      const builds = client.brief.products.map((productId) => {
        const product = PRODUCTS.find((entry) => entry.id === productId);
        const boards = (product?.canonical ?? []).reduce(
          (sum, board) => sum + boardPrice({ upgrades: [] }, "pine", board.size),
          0,
        );
        const needs = [...client.brief.requiredExtras, ...(product?.extras ?? [])].reduce(
          (sum, need) => sum + (EXTRAS.find((extra) => extra.id === need.extra)?.price ?? 0) * need.count,
          0,
        );
        return boards + 4 + needs;
      });
      expect(client.brief.budget[0], client.id).toBeGreaterThanOrEqual(Math.max(...builds));
    }
  });

  it("keeps hints short and Fair words kind", () => {
    for (const hint of [...Object.values(HINTS), ...Object.values(SET_HINTS)])
      expect(hint.trim().split(/\s+/).length, hint).toBeLessThanOrEqual(12);
    const shown = JSON.stringify([
      CLIENTS,
      PRODUCTS,
      STORY_BEATS,
      SET_HINTS,
      FAIR_THEMES,
      FAIR_PANELS,
      ROSETTES,
      APPRENTICE_JOBS,
      UPGRADES,
      DECORS,
      SET_TEMPLATES,
      EXTRAS,
      FINISHES,
      PART_OPTIONS,
    ]).toLowerCase();
    for (const word of ["tenon", "dowel", "grain", "offcut", "bevel", "kerf"])
      expect(shown).not.toContain(word);
    for (const word of [
      "judge",
      "elimination",
      "winner",
      "loser",
      "going home",
      " fire",
      "rival",
      "debt",
      "evict",
    ])
      expect(shown, word).not.toContain(word);
    for (const phrase of ["climb", "stand on", "sit on", "sitting on", "lie on"])
      expect(shown, phrase).not.toContain(phrase);
  });
});
