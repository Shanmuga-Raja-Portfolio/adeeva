import { describe, expect, it } from "vitest";
import { FINDS } from "../content/find";
import { FIND_FIT } from "../content/findFit";
import { autoPlacements } from "./autoLayout";
import { recipeById } from "./catalog";
import { ALL_FIT_KEYS, designFor } from "./design";
import { flipPieces } from "./flipPieces";
import { panelBoard } from "./panelBoard";
import { layoutIssues } from "./placement";

describe("the Fits table", () => {
  it("only lists known recipe and part combinations", () => {
    for (const keys of Object.values(FIND_FIT)) for (const key of keys) expect(ALL_FIT_KEYS).toContain(key);
  });

  for (const find of FINDS)
    it(`holds every ticked recipe on one ${find.id} find, with either worn spot`, () => {
      for (const key of FIND_FIT[find.id]) {
        const design = designFor(key);
        if (design.recipeId === null) throw new Error(`Bad key ${key}`);
        expect(recipeById(design.recipeId).blockedMaterials).not.toContain(find.material);
        const pieces = flipPieces(design);
        for (const wornSpot of [0, 1] as const) {
          const board = panelBoard([
            { id: "find-1", findId: find.id, grade: "tired", price: 1, wornSpot, stains: [] },
          ]);
          const placements = autoPlacements(board, pieces, {});
          expect(placements, `${find.id} × ${key} with spot ${wornSpot}`).not.toBeNull();
          expect(layoutIssues(board, pieces, placements ?? {})).toEqual([]);
        }
      }
    }, 60_000);

  it("marks the design doc's examples as not fitting", () => {
    expect(FIND_FIT["gingham-shirt"]).not.toContain("cushion-cover");
    expect(FIND_FIT["gingham-shirt"]).not.toContain("tote-bag");
    for (const findId of ["wool-blazer", "satin-dress", "check-coat"] as const)
      expect(FIND_FIT[findId]).not.toContain("remade-skirt:pencil-skirt");
    expect(FIND_FIT["faded-jeans"].some((key) => key.startsWith("remade-top"))).toBe(false);
  });
});
