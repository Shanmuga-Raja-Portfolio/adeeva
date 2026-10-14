import { describe, expect, it } from "vitest";
import { menuPortions } from "./menuPortions";

describe("menu portions", () => {
  it("adds up every dish's ready portions", () => {
    expect(menuPortions([])).toBe(0);
    expect(
      menuPortions([
        { dishId: "red-red", price: 9, par: 4 },
        { dishId: "kelewele", price: 7, par: 6 },
      ]),
    ).toBe(10);
  });
});
