import { reduce, type Action, type GameState, type RunStage } from "../../src/games/patisserie/core";
import {
  endDays,
  playSalonTray,
  playShowpiece,
  readySeason,
  salonTestGame,
  showpiecePlan,
} from "../../src/games/patisserie/core/salonPlaythrough";
import {
  GOOD_PLAN,
  lastGigId,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
  type BakePlan,
} from "../../src/games/patisserie/core/testPlaythrough";

const ORDERS: readonly [string, BakePlan][] = [
  [
    "ms-farrow",
    {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["vanilla-sponge"],
      fillingId: null,
      colours: ["lavender", "sky", "blush"],
    },
  ],
  [
    "grandpa-tomasz",
    {
      ...GOOD_PLAN,
      productId: "layer-cake",
      mixIds: ["honey-sponge"],
      fillingId: "raspberry-jam",
      colours: ["ivory", "blush"],
    },
  ],
  [
    "coach-dani",
    {
      ...GOOD_PLAN,
      productId: "iced-biscuits",
      mixIds: ["biscuit-dough"],
      fillingId: null,
      colours: ["emerald", "navy"],
    },
  ],
];

export function salonStart(): GameState {
  return salonTestGame({ difficulty: "standard", trait: "dreamer" });
}

export function bookedSalon(): GameState {
  let state = salonStart();
  for (const [clientId, plan] of ORDERS) {
    const ordered = withOrder(state, clientId);
    state = settleStories(playOrder(ordered, lastGigId(ordered), plan));
  }
  return state;
}

export function seasonReady(): GameState {
  return readySeason(salonStart());
}

export function stockedSalon(): GameState {
  let state = seasonReady();
  for (const tier of ["top", "middle", "bottom"] as const) state = settleStories(playSalonTray(state, tier));
  return state;
}

export function salonDay(): GameState {
  return endDays(stockedSalon(), 6);
}

export function salonTrayAt(stage: RunStage): GameState {
  const ready = seasonReady();
  return playRunTo(reduce(ready, { type: "startSalonTray", tier: "top" }), salonTrayPlanFor(ready), stage);
}

function salonTrayPlanFor(state: GameState): BakePlan {
  const menu = state.salon?.menu;
  if (menu === undefined || menu === null) throw new Error("No menu");
  return {
    ...GOOD_PLAN,
    productId: menu.top.productId,
    mixIds: [menu.top.mixId],
    fillingId: null,
    colours: menu.top.colours,
  };
}

export function showpieceReady(): GameState {
  return endDays(readySeason(bookedSalon()), 3);
}

export function showpieceAt(stage: RunStage, plan?: BakePlan): GameState {
  const ready = showpieceReady();
  return playRunTo(reduce(ready, { type: "startShowpiece" }), plan ?? showpiecePlan(ready), stage);
}

export function fairDay(): GameState {
  const ready = showpieceReady();
  return endDays(settleStories(playShowpiece(ready, showpiecePlan(ready))), 13);
}

export function showpieceDesigned(): GameState {
  const atDesign = showpieceAt("design");
  const actions: Action[] = [
    { type: "chooseProduct", productId: "layer-cake" },
    { type: "chooseMix", batch: 0, mixId: "orange-sponge" },
    { type: "chooseFilling", fillingId: "berry-cream" },
    { type: "toggleColour", colour: "blush" },
    { type: "toggleColour", colour: "lavender" },
    { type: "toggleColour", colour: "sage" },
    { type: "toggleFlourish", flourish: "blind-scale" },
    { type: "toggleFlourish", flourish: "plaque-lettering" },
    { type: "chooseWord", word: "JOY" },
  ];
  return actions.reduce(reduce, atDesign);
}

export function grandShowpieceAt(stage: RunStage): GameState {
  const ready = showpieceReady();
  const fair = ready.fair;
  if (fair === null) throw new Error("No fair");
  const tent3: GameState = { ...ready, fair: { ...fair, tent: 3 } };
  const plan: BakePlan = {
    ...GOOD_PLAN,
    productId: "three-tier-cake",
    mixIds: ["almond-sponge", "orange-sponge", "ribbon-chiffon"],
    fillingId: "berry-cream",
    colours: ["blush", "lavender", "ivory"],
    flourishes: ["bake-together", "ribbon-stir"],
  };
  return playRunTo(reduce(tent3, { type: "startShowpiece" }), plan, stage);
}

export function coveredWeigh(): GameState {
  const ready = showpieceReady();
  return playRunTo(
    reduce(ready, { type: "startShowpiece" }),
    { ...showpiecePlan(ready), flourishes: ["blind-scale"] },
    "weigh",
  );
}

const NEW_BAKES: readonly [string, BakePlan][] = [
  [
    "juniper-troop",
    {
      ...GOOD_PLAN,
      productId: "biscuit-wreath",
      mixIds: ["rose-biscuit", "biscuit-dough"],
      fillingId: null,
      colours: ["emerald", "mustard", "sky"],
    },
  ],
  [
    "twins-ines-sofia",
    {
      ...GOOD_PLAN,
      productId: "spiral-roll",
      mixIds: ["orange-sponge"],
      fillingId: "berry-cream",
      colours: ["lavender", "blush"],
    },
  ],
  [
    "mr-osei",
    {
      ...GOOD_PLAN,
      productId: "tartlet-set",
      mixIds: ["oat-crust"],
      fillingId: "lemon-curd",
      colours: ["sage", "mustard"],
    },
  ],
  [
    "ms-lindqvist",
    {
      ...GOOD_PLAN,
      productId: "petit-fours",
      mixIds: ["almond-sponge"],
      fillingId: null,
      colours: ["navy", "gold", "ivory"],
    },
  ],
];

export function newBakeAt(index: number, stage: RunStage): GameState {
  const entry = NEW_BAKES[index];
  if (entry === undefined) throw new Error(`No new bake ${index}`);
  const [clientId, plan] = entry;
  const ordered = withOrder({ ...salonStart(), reputation: 40 }, clientId);
  return playRunTo(reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) }), plan, stage);
}

export const NEW_BAKE_COUNT = NEW_BAKES.length;
