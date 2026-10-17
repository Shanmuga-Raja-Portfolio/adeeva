import type { TrimId } from "../../src/games/adeeva/content/trim";
import { FABRICS } from "../../src/games/adeeva/content/fabric";
import {
  cutMetres,
  fabricUnitPrice,
  isFabricUnlocked,
  reduce,
  requiredPieces,
  requiredSeams,
  seasonTheme,
  type Action,
  type GameState,
} from "../../src/games/adeeva/core";
import {
  dispatchAll,
  newTestGame,
  SIMPLE_DESIGN,
  SIMPLE_LAYOUT,
  TEST_SEAM_TICKS,
} from "../../src/games/adeeva/core/testPlaythrough";
import { settleStories } from "./preparedGame";

const LOOK_TRIMS: readonly (readonly { trimId: TrimId; x: number; y: number }[])[] = [
  [
    { trimId: "flower-applique", x: 170, y: 250 },
    { trimId: "flower-applique", x: 232, y: 262 },
  ],
  [
    { trimId: "bow", x: 200, y: 372 },
    { trimId: "pearl", x: 200, y: 214 },
  ],
  [
    { trimId: "sequin-patch", x: 160, y: 520 },
    { trimId: "star-applique", x: 200, y: 640 },
  ],
];

interface LookCloth {
  readonly bodice: string;
  readonly skirt: string;
}

function affordableCloths(state: GameState): LookCloth[] {
  const season = state.season;
  if (season === null) throw new Error("The label has no season");
  const palette: readonly string[] = seasonTheme(season).palette;
  const fabrics = FABRICS.filter(
    (fabric) => palette.includes(fabric.colour) && isFabricUnlocked(state, fabric),
  )
    .sort((a, b) => fabricUnitPrice(state, a) - fabricUnitPrice(state, b))
    .slice(0, 2);
  const [first, second] = fabrics;
  if (first === undefined) throw new Error("No unlocked fabric matches the theme palette");
  const other = second ?? first;
  return [
    { bodice: first.id, skirt: other.id },
    { bodice: other.id, skirt: first.id },
    { bodice: first.id, skirt: first.id },
  ];
}

function craftLook(state: GameState, lookIndex: number, cloth: LookCloth, accuracy: number): GameState {
  const trims = LOOK_TRIMS[lookIndex] ?? [];
  const categories = Object.keys(SIMPLE_DESIGN) as (keyof typeof SIMPLE_DESIGN)[];
  const fabricFor = (category: string) => (category === "skirt" ? cloth.skirt : cloth.bodice);
  const fabricIds = [...new Set([cloth.bodice, cloth.skirt])];
  const sketched = dispatchAll(reduce(state, { type: "startLook", lookIndex }), [
    { type: "goToStage", stage: "sketch" },
    ...categories.map((category): Action => ({
      type: "chooseSketchPart",
      category,
      partId: SIMPLE_DESIGN[category],
    })),
    ...categories.map((category): Action => ({
      type: "chooseSketchFabric",
      category,
      fabricId: fabricFor(category),
    })),
    { type: "goToStage", stage: "fabric" },
    { type: "openShop" },
  ]);
  const planned = sketched.activeRun;
  if (planned === null) throw new Error("The look never reached the shop");
  const placements = Object.fromEntries(
    requiredPieces(planned.design).flatMap((entry) => {
      const spot = SIMPLE_LAYOUT[entry.piece.id];
      return spot === undefined || entry.fabricId === null
        ? []
        : [[entry.piece.id, { ...spot, fabricId: entry.fabricId }]];
    }),
  );
  const laidOut = { ...planned, placements };
  const shopped = dispatchAll(sketched, [
    ...fabricIds.map((fabricId): Action => ({
      type: "buyFabric",
      fabricId,
      metres: cutMetres(laidOut, fabricId),
    })),
    ...trims.map((trim): Action => ({ type: "buyTrim", trimId: trim.trimId, count: 1 })),
    { type: "closeShop" },
    { type: "goToStage", stage: "cut" },
  ]);
  const run = shopped.activeRun;
  if (run === null || run.stage !== "cut")
    throw new Error(`Look ${lookIndex + 1} could not be bought with ${sketched.coins} coins`);
  const pieces = requiredPieces(run.design);
  const accuracies = Object.fromEntries(pieces.map((entry) => [entry.piece.id, accuracy]));
  const cut = dispatchAll(shopped, [
    ...pieces.map((entry): Action => {
      const spot = SIMPLE_LAYOUT[entry.piece.id];
      if (spot === undefined) throw new Error(`No layout for ${entry.piece.id}`);
      return { type: "placePiece", pieceId: entry.piece.id, ...spot };
    }),
    ...fabricIds.map((fabricId): Action => ({ type: "commitCut", fabricId, accuracies })),
  ]);
  if (cut.activeRun?.cutFabrics.length !== fabricIds.length) throw new Error("The cut did not go through");
  const finished = dispatchAll(cut, [
    { type: "goToStage", stage: "assemble" },
    ...requiredPieces(run.design).map((entry): Action => ({
      type: "assignSlot",
      slot: entry.piece.slot,
      pieceId: entry.piece.id,
    })),
    { type: "goToStage", stage: "sew" },
    ...requiredSeams(run.design).map((entry): Action => ({
      type: "recordSeam",
      seamId: entry.seam.id,
      progress: 1,
      ticks: TEST_SEAM_TICKS,
      insideTicks: Math.round(accuracy * TEST_SEAM_TICKS),
      assisted: false,
    })),
    { type: "goToStage", stage: "decorate" },
    ...trims.map((trim): Action => ({ type: "addDecoration", trimId: trim.trimId, x: trim.x, y: trim.y })),
    { type: "goToStage", stage: "review" },
    { type: "deliver" },
    { type: "endDay" },
  ]);
  if (finished.season?.looks[lookIndex] === null) throw new Error(`Look ${lookIndex + 1} was not delivered`);
  return finished;
}

export function seasonReadyForRunway(): GameState {
  const start = settleStories(newTestGame({ career: "label", seed: 11, name: "Ada" }));
  const cloths = affordableCloths(start);
  const accuracies = [0.82, 0.9, 0.96];
  const crafted = cloths.reduce(
    (state, cloth, index) => craftLook(state, index, cloth, accuracies[index] ?? 0.9),
    start,
  );
  const showEve = (crafted.season?.deadlineDay ?? 0) - 1;
  const restDays = Math.max(0, showEve - crafted.calendar.day);
  const rested = dispatchAll(
    crafted,
    Array.from({ length: restDays }, (): Action => ({ type: "endDay" })),
  );
  return settleStories(rested);
}
