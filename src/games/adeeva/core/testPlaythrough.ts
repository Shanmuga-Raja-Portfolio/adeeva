import type { AvatarLook } from "../../../engine/avatar";
import type { PartCategory } from "../content/garmentPart";
import type { Action } from "./action";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { createGame, type NewGameSettings } from "./newGame";
import { reduce } from "./reduce";
import { requiredPieces } from "./requiredPieces";
import { requiredSeams } from "./requiredSeams";
import type { Rotation } from "../../../engine/geometry/rotation";

export const TEST_LOOK: AvatarLook = {
  skinTone: "honey",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "studio-apron",
};

export const SIMPLE_DESIGN: Readonly<Record<PartCategory, string>> = {
  bodice: "fitted-bodice",
  neckline: "peter-pan-collar",
  sleeves: "sleeveless",
  skirt: "a-line-skirt",
};

export const SIMPLE_LAYOUT: Readonly<Record<string, { x: number; y: number; rotation: Rotation }>> = {
  "a-line-front": { x: 0, y: 0, rotation: 0 },
  "a-line-back": { x: 70, y: 0, rotation: 0 },
  "fitted-front": { x: 0, y: 70, rotation: 0 },
  "fitted-back": { x: 50, y: 70, rotation: 0 },
  "peter-pan": { x: 100, y: 70, rotation: 0 },
};

export const TEST_SEAM_TICKS = 1000;

export interface CraftOptions {
  readonly fabricId: string;
  readonly cutAccuracy: number;
  readonly seamAccuracy: number;
  readonly addRequiredTrims: boolean;
}

export const DEFAULT_CRAFT: CraftOptions = {
  fabricId: "ivory-cotton",
  cutAccuracy: 0.9,
  seamAccuracy: 0.9,
  addRequiredTrims: true,
};

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 7,
    name: "Ada",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
    career: "student",
    ...overrides,
  });
}

export function dispatchAll(state: GameState, actions: readonly Action[]): GameState {
  return actions.reduce(reduce, state);
}

export function withActiveGig(state: GameState, clientId: string): GameState {
  const client = clientById(clientId);
  if (client === undefined) throw new Error(`Unknown client ${clientId}`);
  const [brief, rng] = rollClientBrief(
    client,
    state.calendar.day,
    state.rng,
    difficultyById(state.profile.difficulty).minQualityBonus,
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

export function sketchAndShop(state: GameState, options: CraftOptions = DEFAULT_CRAFT): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("No active run");
  const categories = Object.keys(SIMPLE_DESIGN) as PartCategory[];
  const trimActions: Action[] = run.brief.requiredTrims.map((requirement) => ({
    type: "buyTrim",
    trimId: requirement.trim,
    count: requirement.count,
  }));
  return dispatchAll(state, [
    { type: "goToStage", stage: "sketch" },
    ...categories.map((category): Action => ({
      type: "chooseSketchPart",
      category,
      partId: SIMPLE_DESIGN[category],
    })),
    ...categories.map((category): Action => ({
      type: "chooseSketchFabric",
      category,
      fabricId: options.fabricId,
    })),
    { type: "goToStage", stage: "fabric" },
    { type: "openShop" },
    { type: "buyFabric", fabricId: options.fabricId, metres: 2 },
    ...trimActions,
    { type: "closeShop" },
    { type: "goToStage", stage: "cut" },
  ]);
}

export function layoutAndCut(state: GameState, options: CraftOptions = DEFAULT_CRAFT): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("No active run");
  const pieces = requiredPieces(run.design);
  const placements: Action[] = pieces.map((entry) => {
    const spot = SIMPLE_LAYOUT[entry.piece.id];
    if (spot === undefined) throw new Error(`No layout for ${entry.piece.id}`);
    return { type: "placePiece", pieceId: entry.piece.id, ...spot };
  });
  const accuracies = Object.fromEntries(pieces.map((entry) => [entry.piece.id, options.cutAccuracy]));
  return dispatchAll(state, [...placements, { type: "commitCut", fabricId: options.fabricId, accuracies }]);
}

export function assembleToSew(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("No active run");
  const assembly: Action[] = requiredPieces(run.design).map((entry) => ({
    type: "assignSlot",
    slot: entry.piece.slot,
    pieceId: entry.piece.id,
  }));
  return dispatchAll(state, [
    { type: "goToStage", stage: "assemble" },
    ...assembly,
    { type: "goToStage", stage: "sew" },
  ]);
}

export function finishToReview(state: GameState, options: CraftOptions = DEFAULT_CRAFT): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("No active run");
  const seams: Action[] = requiredSeams(run.design).map((entry) => ({
    type: "recordSeam",
    seamId: entry.seam.id,
    progress: 1,
    ticks: TEST_SEAM_TICKS,
    insideTicks: Math.round(options.seamAccuracy * TEST_SEAM_TICKS),
    assisted: false,
  }));
  const trims: Action[] = options.addRequiredTrims
    ? run.brief.requiredTrims.flatMap((requirement) =>
        Array.from({ length: requirement.count }, (_, index): Action => ({
          type: "addDecoration",
          trimId: requirement.trim,
          x: 200,
          y: 300 + index * 20,
        })),
      )
    : [];
  return dispatchAll(assembleToSew(state), [
    ...seams,
    { type: "goToStage", stage: "decorate" },
    ...trims,
    { type: "goToStage", stage: "review" },
  ]);
}

export function craftToReview(state: GameState, options: CraftOptions = DEFAULT_CRAFT): GameState {
  return finishToReview(layoutAndCut(sketchAndShop(state, options), options), options);
}
