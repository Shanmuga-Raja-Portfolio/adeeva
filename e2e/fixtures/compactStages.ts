import {
  reduce as reduceAdeeva,
  requiredPieces,
  type Action as AdeevaAction,
} from "../../src/games/adeeva/core";
import type { GameState as AdeevaState } from "../../src/games/adeeva/core";
import {
  assembleToSew,
  DEFAULT_CRAFT,
  dispatchAll as dispatchAdeeva,
  layoutAndCut,
  newTestGame as newAdeeva,
  SIMPLE_LAYOUT,
  sketchAndShop,
  withActiveGig as withAdeevaGig,
} from "../../src/games/adeeva/core/testPlaythrough";
import {
  must,
  newTestGame as newChef,
  settleStories as settleChef,
  cookUntil,
} from "../../src/games/chef/core/testPlaythrough";
import type { GameState as ChefState, RunStage as ChefStage } from "../../src/games/chef/core";
import {
  reduce as reduceJewellery,
  type GameState as JewelleryState,
  type RunStage as JewelleryStage,
} from "../../src/games/jewellery/core";
import {
  GOOD_PLAN as JEWEL_PLAN,
  lastGigId as lastJewelleryGig,
  newTestGame as newJewellery,
  playRunTo as playJewelleryTo,
  settleStories as settleJewellery,
  withOrder as withJewelleryOrder,
} from "../../src/games/jewellery/core/testPlaythrough";
import {
  reduce as reducePatisserie,
  type GameState as BakeryState,
  type RunStage as BakeryStage,
} from "../../src/games/patisserie/core";
import {
  GOOD_PLAN as BAKE_PLAN,
  lastGigId as lastBakeryGig,
  newTestGame as newBakery,
  playRunTo as playBakeryTo,
  settleStories as settleBakery,
  withOrder as withBakeryOrder,
} from "../../src/games/patisserie/core/testPlaythrough";
import {
  reduce as reduceThrift,
  type Action as ThriftAction,
  type GameState as ThriftState,
} from "../../src/games/thrift-flip/core";
import {
  cutActions,
  dispatchAll as dispatchThrift,
  flipAtUnpick,
  layoutActions,
  newTestGame as newThrift,
  scrubAll,
  seamActions,
  settleStories as settleThrift,
  unpickAll,
} from "../../src/games/thrift-flip/core/testPlaythrough";
import { settleStories as settleAdeeva } from "./preparedGame";

export function adeevaStudent(): AdeevaState {
  return withAdeevaGig(settleAdeeva(newAdeeva({ seed: 7, name: "Ada" })), "mom");
}

function adeevaOnTable(): AdeevaState {
  const state = adeevaStudent();
  const gig = state.gigs.active[state.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No gig");
  return reduceAdeeva(state, { type: "startRun", gigId: gig.id });
}

export function adeevaLaidOut(): AdeevaState {
  const shopped = sketchAndShop(adeevaOnTable(), DEFAULT_CRAFT);
  const run = shopped.activeRun;
  if (run === null) throw new Error("No run");
  return dispatchAdeeva(
    shopped,
    requiredPieces(run.design).map((entry): AdeevaAction => {
      const spot = SIMPLE_LAYOUT[entry.piece.id];
      if (spot === undefined) throw new Error("No layout");
      return { type: "placePiece", pieceId: entry.piece.id, ...spot };
    }),
  );
}

export function adeevaAtMachine(): AdeevaState {
  const cut = layoutAndCut(sketchAndShop(adeevaOnTable(), DEFAULT_CRAFT), DEFAULT_CRAFT);
  return assembleToSew(dispatchAdeeva(cut, [{ type: "endDay" }]));
}

export function bakeryAt(stage: BakeryStage): BakeryState {
  const ordered = withBakeryOrder(settleBakery(newBakery()), "grandpa-tomasz");
  const started = reducePatisserie(ordered, { type: "startOrder", gigId: lastBakeryGig(ordered) });
  return playBakeryTo(
    started,
    {
      ...BAKE_PLAN,
      productId: "layer-cake",
      mixIds: ["honey-sponge"],
      fillingId: "raspberry-jam",
      colours: ["ivory", "blush"],
    },
    stage,
  );
}

export function jewelleryAt(stage: JewelleryStage): JewelleryState {
  const ordered = withJewelleryOrder(settleJewellery(newJewellery({ seed: 41, name: "Mira" })), "gran-mina");
  const started = reduceJewellery(ordered, { type: "startOrder", gigId: lastJewelleryGig(ordered) });
  return playJewelleryTo(started, JEWEL_PLAN, stage);
}

export function chefLessonAt(stage: ChefStage): ChefState {
  const lesson = settleChef(
    must(settleChef(newChef({ seed: 21, name: "Tomi", trait: "charmer" })), { type: "startLesson" }),
  );
  return cookUntil(lesson, (run) => run.stage === stage);
}

export function chefLessonAtCook(): ChefState {
  return chefLessonAt("cook");
}

const CUSHION = { recipeId: "cushion-cover", parts: {} } as const;

function thriftAtUnpick(): ThriftState {
  return flipAtUnpick(
    settleThrift(newThrift({ seed: 11, name: "Rosa", trait: "charmer" })),
    "nana-bea",
    CUSHION,
    [{ findId: "tea-dress", grade: "tired" }],
  );
}

export function thriftUnpick(): ThriftState {
  return thriftAtUnpick();
}

export function thriftFinish(): ThriftState {
  const cleaned = reduceThrift(
    scrubAll(reduceThrift(unpickAll(thriftAtUnpick(), 2), { type: "goToStage", stage: "clean" }), 0),
    {
      type: "goToStage",
      stage: "layout",
    },
  );
  const laid = dispatchThrift(cleaned, [...layoutActions(cleaned), { type: "goToStage", stage: "cut" }]);
  const cut = dispatchThrift(laid, [...cutActions(laid, "trace"), { type: "goToStage", stage: "sew" }]);
  return dispatchThrift(cut, [
    ...seamActions(cut, 0.92),
    { type: "goToStage", stage: "finish" } as ThriftAction,
  ]);
}
