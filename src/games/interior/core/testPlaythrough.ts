import type { AvatarLook } from "../../../engine/avatar";
import type { Point } from "../../../engine/geometry/point";
import type { DecorId } from "../content/decor";
import type { FloorId } from "../content/floor";
import type { FurnitureId } from "../content/furniture";
import type { LightId } from "../content/light";
import type { PaintId } from "../content/paint";
import { WALL_IDS } from "../content/roomTemplate";
import type { Action } from "./action";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById, roomById } from "./catalog";
import { STYLE_CANVAS } from "./decorPlacement";
import { floorPieces, rightCandidate, runPattern } from "./floorLay";
import type { GameState } from "./gameState";
import { bestLightCell } from "./lighting";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { createGame, type NewGameSettings } from "./newGame";
import { runEdgePaths, type EdgePath } from "./paintEdge";
import { ROLL_CANVAS, ROLL_CELL_PX, ROLL_ROWS } from "./paintRoll";
import { reduce } from "./reduce";
import { stageAfter, type RunStage } from "./runStage";
import { canAdvance } from "./stageReadiness";
import { currentBeat } from "./storyQueue";
import { tidyLayout } from "./tidyLayout";

export const TEST_LOOK: AvatarLook = {
  skinTone: "amber",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "studio-apron",
};

export interface RoomRecipe {
  readonly furniture: readonly FurnitureId[];
  readonly wallPaint: PaintId;
  readonly featurePaint: PaintId | null;
  readonly floor: FloorId;
  readonly lights: readonly LightId[];
  readonly decor: readonly DecorId[];
  readonly tidy: boolean;
  readonly edgeOffset: number;
  readonly paintAssist: boolean;
  readonly floorOffset: number;
  readonly floorAssist: boolean;
  readonly lightAssist: boolean;
}

const HAND: Pick<
  RoomRecipe,
  | "tidy"
  | "edgeOffset"
  | "paintAssist"
  | "floorOffset"
  | "floorAssist"
  | "lightAssist"
  | "featurePaint"
  | "decor"
> = {
  tidy: false,
  edgeOffset: 0,
  paintAssist: false,
  floorOffset: 0,
  floorAssist: false,
  lightAssist: false,
  featurePaint: null,
  decor: [],
};

const TYPICAL: Readonly<Record<string, RoomRecipe>> = {
  "nana-pearl": {
    ...HAND,
    furniture: ["armchair", "bookcase"],
    wallPaint: "chalk-white",
    floor: "cork-tiles",
    lights: ["arc-lamp", "paper-pendant"],
  },
  "okafor-twins": {
    ...HAND,
    furniture: ["bunk-bed", "toy-box", "desk"],
    wallPaint: "sunflower",
    floor: "pine-boards",
    lights: ["firefly-string", "paper-pendant", "clip-lamp", "arc-lamp"],
  },
  jun: {
    ...HAND,
    furniture: ["single-bed", "desk", "desk-chair", "wardrobe"],
    wallPaint: "morning-sky",
    floor: "pine-boards",
    lights: ["dome-pendant", "clip-lamp"],
  },
  orla: {
    ...HAND,
    furniture: ["single-bed", "desk"],
    wallPaint: "midnight-ink",
    featurePaint: "lilac-mist",
    floor: "checkerboard",
    lights: ["firefly-string", "paper-pendant", "brass-sconce"],
    decor: ["star-garland", "star-garland", "paper-bunting"],
  },
  "mrs-halloran": {
    ...HAND,
    furniture: ["sofa", "armchair", "bookcase", "coffee-table"],
    wallPaint: "chalk-white",
    floor: "oak-boards",
    lights: ["paper-pendant", "arc-lamp", "brass-sconce"],
  },
  "dr-faraday": {
    ...HAND,
    furniture: ["bookcase", "bookcase", "desk", "desk-chair"],
    wallPaint: "sea-glass",
    floor: "oak-boards",
    lights: ["dome-pendant", "clip-lamp", "brass-sconce"],
    decor: ["wall-clock"],
  },
  "bluebell-cafe": {
    ...HAND,
    furniture: ["dining-table", "dining-table"],
    wallPaint: "sunflower",
    floor: "terracotta",
    lights: ["paper-pendant", "paper-pendant"],
    decor: ["potted-fern", "potted-fern"],
  },
  bellwind: {
    ...HAND,
    furniture: ["sofa", "armchair", "coffee-table", "bookcase", "dining-table"],
    wallPaint: "chalk-white",
    featurePaint: "deep-lagoon",
    floor: "oak-boards",
    lights: ["paper-pendant", "arc-lamp", "arc-lamp", "brass-sconce"],
    decor: ["framed-print", "potted-fern", "wall-clock"],
  },
};

export function recipeFor(clientId: string): RoomRecipe {
  const recipe = TYPICAL[clientId];
  if (recipe === undefined) throw new Error(`No recipe for ${clientId}`);
  return recipe;
}

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 7,
    name: "Ada",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
    ...overrides,
  });
}

export function settleStories(state: GameState): GameState {
  let next = state;
  for (let guard = 0; guard < 20; guard += 1) {
    const beat = currentBeat(next);
    if (beat === null) return next;
    next = reduce(next, { type: "markBeatSeen", beatId: beat.id });
  }
  return next;
}

export function dispatchAll(state: GameState, actions: readonly Action[]): GameState {
  return actions.reduce(reduce, state);
}

export function withOrder(state: GameState, clientId: string): GameState {
  const client = clientById(clientId);
  if (client === undefined) throw new Error(`Unknown client ${clientId}`);
  const [brief, rng] = rollClientBrief(
    client,
    {
      day: state.calendar.day,
      minQualityBonus: difficultyById(state.profile.difficulty).minQualityBonus,
      hotTags: state.trends.current,
    },
    state.rng,
  );
  const id = `gig-${state.gigs.nextGigNumber}`;
  return {
    ...state,
    rng,
    gigs: {
      ...state.gigs,
      active: [...state.gigs.active, { id, clientId, brief, acceptedDay: state.calendar.day }],
      nextGigNumber: state.gigs.nextGigNumber + 1,
    },
  };
}

export function lastGigId(state: GameState): string {
  const gig = state.gigs.active[state.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No active makeover");
  return gig.id;
}

function activeRun(state: GameState): MakeoverRun {
  const run = state.activeRun;
  if (run === null) throw new Error("No room in progress");
  return run;
}

function must(before: GameState, after: GameState, what: string): GameState {
  if (after === before) throw new Error(`Could not ${what}`);
  return after;
}

export function planRoom(state: GameState, recipe: RoomRecipe): GameState {
  const run = activeRun(state);
  let next = dispatchAll(state, [
    { type: "choosePaint", slot: "wall", paintId: recipe.wallPaint },
    { type: "chooseFloor", floorId: recipe.floor },
    ...recipe.lights.map((lightId): Action => ({ type: "addLight", lightId })),
  ]);
  if (recipe.featurePaint !== null)
    next = reduce(next, { type: "choosePaint", slot: "feature", paintId: recipe.featurePaint });
  const layout = tidyLayout(
    roomById(run.brief.roomId),
    recipe.furniture.map((furnitureId, index) => ({ id: `piece-${index + 1}`, furnitureId })),
  );
  if (layout === null) throw new Error("The furniture does not fit");
  const placed = layout.reduce(
    (current, piece) =>
      must(
        current,
        reduce(current, {
          type: "placePiece",
          pieceId: null,
          furnitureId: piece.furnitureId,
          col: piece.col,
          row: piece.row,
          rotation: piece.rotation,
        }),
        `place ${piece.furnitureId}`,
      ),
    next,
  );
  return recipe.tidy ? must(placed, reduce(placed, { type: "tidyUp" }), "tidy up") : placed;
}

function shop(state: GameState, recipe: RoomRecipe): GameState {
  const bought = reduce(state, { type: "buyPlan" });
  return recipe.decor.reduce(
    (current, decorId) => must(current, reduce(current, { type: "buyDecor", decorId }), `buy ${decorId}`),
    bought,
  );
}

export function edgeSamples(path: EdgePath, offset: number): Point[] {
  const ring = path.closed ? [...path.points, path.points[0] ?? [0, 0]] : path.points;
  return ring.slice(1).flatMap((end, index) => {
    const start = ring[index] ?? end;
    const steps = Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) * 2);
    return Array.from({ length: steps }, (_, step): Point => {
      const t = step / steps;
      return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t + offset];
    });
  });
}

export function rowStroke(row: number): Point[] {
  const y = (row + 0.5) * ROLL_CELL_PX;
  return Array.from({ length: 25 }, (_, step): Point => [10 + ((ROLL_CANVAS.width - 20) * step) / 24, y]);
}

function paint(state: GameState, recipe: RoomRecipe): GameState {
  let next = state;
  for (const wall of WALL_IDS) {
    if (recipe.paintAssist) {
      next = must(next, reduce(next, { type: "assistPaint", wall }), "assist paint");
      continue;
    }
    for (const path of runEdgePaths(activeRun(next)).filter((entry) => entry.wall === wall))
      next = must(
        next,
        reduce(next, { type: "edgePath", pathId: path.id, samples: edgeSamples(path, recipe.edgeOffset) }),
        `edge ${path.id}`,
      );
    for (let coat = 0; coat < 2; coat += 1)
      for (let row = 0; row < ROLL_ROWS; row += 1) {
        next = reduce(next, { type: "reloadRoller" });
        next = must(
          next,
          reduce(next, { type: "rollStroke", wall, points: rowStroke(row), durationMs: 1000 }),
          "roll",
        );
      }
  }
  return next;
}

function layFloor(state: GameState, recipe: RoomRecipe): GameState {
  const run = activeRun(state);
  return floorPieces(runPattern(run)).reduce(
    (current, piece) =>
      must(
        current,
        reduce(current, {
          type: "layFloor",
          pieceIndex: piece.index,
          candidateKey: rightCandidate(piece).key,
          x: piece.x + recipe.floorOffset,
          y: piece.y,
          assisted: recipe.floorAssist,
        }),
        `lay floor piece ${piece.index}`,
      ),
    state,
  );
}

function light(state: GameState, recipe: RoomRecipe): GameState {
  const run = activeRun(state);
  return run.plan.lights.reduce((current, lightId, index) => {
    if (recipe.lightAssist) return must(current, reduce(current, { type: "showMeLight" }), "show me");
    const now = activeRun(current);
    const cell = bestLightCell(roomById(now.brief.roomId), now.plan.pieces, placedLights(now), lightId);
    if (cell === null) throw new Error(`No spot for ${lightId}`);
    return must(current, reduce(current, { type: "placeLight", index, col: cell[0], row: cell[1] }), "light");
  }, state);
}

function style(state: GameState, recipe: RoomRecipe): GameState {
  return recipe.decor.reduce(
    (current, decorId, index) =>
      must(
        current,
        reduce(current, {
          type: "addDecor",
          decorId,
          x: 120 + index * 80,
          y: STYLE_CANVAS.height * 0.5,
        }),
        `place ${decorId}`,
      ),
    state,
  );
}

const WORK: Partial<Record<RunStage, (state: GameState, recipe: RoomRecipe) => GameState>> = {
  plan: planRoom,
  shop,
  paint,
  floor: layFloor,
  light,
  style,
};

function stepForward(state: GameState): GameState {
  const run = activeRun(state);
  const next = stageAfter(run.stage);
  if (next === null) throw new Error("No step after this one");
  const moved = reduce(state, { type: "goToStage", stage: next });
  if (moved !== state) return moved;
  const check = canAdvance(state);
  if (check.reasons.some((reason) => reason.includes("End the day")))
    return stepForward(settleStories(reduce(state, { type: "endDay" })));
  throw new Error(`Cannot leave ${run.stage}: ${check.reasons.join(" ")}`);
}

export function workStage(state: GameState, recipe: RoomRecipe): GameState {
  const work = WORK[activeRun(state).stage];
  return work === undefined ? state : work(state, recipe);
}

export function playRunTo(state: GameState, recipe: RoomRecipe, until: RunStage): GameState {
  let next = state;
  for (let guard = 0; guard < 20; guard += 1) {
    if (activeRun(next).stage === until) return next;
    next = stepForward(workStage(next, recipe));
  }
  throw new Error(`Never reached ${until}`);
}

export function playOrder(state: GameState, gigId: string, recipe: RoomRecipe): GameState {
  const started = must(state, reduce(state, { type: "startOrder", gigId }), `start ${gigId}`);
  return must(started, reduce(playRunTo(started, recipe, "reveal"), { type: "reveal" }), "reveal");
}
