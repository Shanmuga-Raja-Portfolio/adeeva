import type { Page } from "@playwright/test";
import { reduce, serialize, type GameState, type RackPiece } from "../../src/games/thrift-flip/core";
import {
  boutiqueStart,
  endDays,
  offerQueued,
  rackPieceFixture,
  settleWithChoice,
  stallDayAtThreshold,
  withRack,
} from "../../src/games/thrift-flip/core/boutiquePlaythrough";
import { withFind } from "../../src/games/thrift-flip/core/testPlaythrough";
import { THRIFT_URL } from "./thriftPage";

const PLAYER = { name: "Rosa", trait: "charmer" } as const;

function seasonPieces(madeDay: number): RackPiece[] {
  return [
    rackPieceFixture("piece-1", {
      recipeId: "hair-bow-set",
      design: { recipeId: "hair-bow-set", parts: {} },
      cloth: { colour: "blush", print: "floral", material: "cotton" },
      quality: 84,
      leaves: 68,
      tags: ["romantic", "playful"],
      colours: ["blush", "sage"],
      findIds: ["tea-dress"],
      madeDay,
    }),
    rackPieceFixture("piece-2", {
      recipeId: "tote-bag",
      cloth: { colour: "sage", print: "solid", material: "linen" },
      quality: 86,
      leaves: 72,
      tags: ["casual", "playful"],
      colours: ["sage", "lavender"],
      findIds: ["linen-trousers", "satin-robe"],
      madeDay,
    }),
    rackPieceFixture("piece-3", {
      recipeId: "remade-top",
      design: { recipeId: "remade-top", parts: { bodice: "wrap-bodice", sleeves: "cap-sleeve" } },
      cloth: { colour: "lavender", print: "solid", material: "satin" },
      quality: 90,
      leaves: 61,
      tags: ["romantic", "elegant"],
      colours: ["lavender", "ivory"],
      findIds: ["satin-robe"],
      madeDay,
    }),
  ];
}

function hasMendOffer(state: GameState): boolean {
  return state.gigs.offers.some((offer) => offer.brief.kind === "mend");
}

export function thresholdSave(): GameState {
  for (let seed = 1; seed < 200; seed += 1) {
    const opened = settleWithChoice(offerQueued({ seed, ...PLAYER }), "open");
    if (!hasMendOffer(opened)) continue;
    const ready = stallDayAtThreshold({ seed, ...PLAYER });
    return withRack(ready, seasonPieces(5).slice(0, 2));
  }
  throw new Error("No seed brings a mend ticket");
}

export function swapDaySave(): GameState {
  const start = boutiqueStart({ seed: 5, ...PLAYER });
  return withFind(withFind(endDays(start, 10), "faded-jeans", "loved"), "sailor-top", "tired");
}

export function showcaseSave(): GameState {
  const start = withRack(boutiqueStart({ seed: 8, ...PLAYER }), seasonPieces(2));
  const day22 = endDays(start, 21);
  return ["piece-1", "piece-2", "piece-3"].reduce(
    (state, pieceId) => reduce(state, { type: "shelvePiece", pieceId }),
    day22,
  );
}

export function tillDaySave(): GameState {
  const start = withRack(boutiqueStart({ seed: 12, ...PLAYER }), seasonPieces(2));
  const boutique = start.boutique;
  if (boutique === null) throw new Error("No boutique");
  const dressed: GameState = {
    ...start,
    boutique: {
      ...boutique,
      props: ["paper-moon", "potted-fern"],
      window: {
        pieces: [
          { pieceId: "piece-1", x: 110, y: 240 },
          { pieceId: "piece-3", x: 480, y: 240 },
        ],
        props: [
          { propId: "paper-moon", x: 300, y: 110 },
          { propId: "potted-fern", x: 300, y: 290 },
        ],
      },
    },
  };
  return endDays(dressed, 6);
}

export async function openThriftSave(page: Page, state: GameState): Promise<void> {
  await page.goto(THRIFT_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("thrift-flip.save.1", json);
    window.localStorage.setItem("thrift-flip.lastSlot", "1");
  }, serialize(state));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
}
