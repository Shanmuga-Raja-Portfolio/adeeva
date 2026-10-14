import { describe, expect, it } from "vitest";
import { cleanService, type DishScore, type ServiceScore } from "./serviceScore";

function scored(dishes: readonly DishScore[]): ServiceScore {
  return {
    score: 90,
    averageQuality: 90,
    averageOnTime: 1,
    handledShare: 1,
    handledDishes: dishes.filter((dish) => dish.handled).length,
    teamTickets: 0,
    dishes,
  };
}

describe("a clean service", () => {
  it("needs at least one handled dish and every handled dish at 4 stars or more", () => {
    expect(cleanService(scored([]))).toBe(false);
    expect(cleanService(scored([{ cuisine: "indian", quality: 95, handled: true }]))).toBe(true);
    expect(
      cleanService(
        scored([
          { cuisine: "indian", quality: 95, handled: true },
          { cuisine: "italian", quality: 10, handled: false },
        ]),
      ),
    ).toBe(true);
    expect(
      cleanService(
        scored([
          { cuisine: "indian", quality: 95, handled: true },
          { cuisine: "italian", quality: 40, handled: true },
        ]),
      ),
    ).toBe(false);
  });
});
