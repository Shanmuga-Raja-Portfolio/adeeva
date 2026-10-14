import { describe, expect, it } from "vitest";
import { fineMaterialBonus } from "./fineMaterial";

describe("fineMaterialBonus", () => {
  it("pays a share of the fee per grade above plain and reputation at the top grade", () => {
    expect(fineMaterialBonus(100, 1, "Fine")).toEqual({ lines: [], reputation: 0 });
    expect(fineMaterialBonus(100, 2, "Fine")).toEqual({
      lines: [{ label: "Fine", amount: 15 }],
      reputation: 0,
    });
    expect(fineMaterialBonus(100, 3, "Fine")).toEqual({
      lines: [{ label: "Fine", amount: 30 }],
      reputation: 1,
    });
  });

  it("drops a line that would round to nothing", () => {
    expect(fineMaterialBonus(3, 2, "Fine").lines).toEqual([]);
  });
});
