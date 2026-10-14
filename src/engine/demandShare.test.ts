import { describe, expect, it } from "vitest";
import { demandShares, priceFactor, sellWithSpill, wantedPortions } from "./demandShare";

describe("demand share", () => {
  it("clamps the price factor between 0.1 and 1.3", () => {
    expect(priceFactor(6, 6)).toBe(1);
    expect(priceFactor(1, 6)).toBe(1.3);
    expect(priceFactor(12, 6)).toBe(0.1);
    expect(priceFactor(9, 6)).toBeCloseTo(0.5);
  });

  it("puts the profit peak near 1.17 times the fair price", () => {
    const cost = 2;
    const fair = 6;
    const profit = (price: number) => (price - cost) * priceFactor(price, fair);
    const prices = Array.from({ length: 2 * fair - cost }, (_, index) => cost + 1 + index);
    const best = prices.reduce((top, price) => (profit(price) > profit(top) ? price : top));
    expect(best).toBe(7);
    expect(profit(7)).toBeGreaterThan(profit(6));
    expect(profit(12)).toBeLessThan(profit(4));
  });

  it("shares guests by appeal and scales by price", () => {
    expect(demandShares([1, 1, 2])).toEqual([0.25, 0.25, 0.5]);
    expect(demandShares([0, 0])).toEqual([0, 0]);
    const items = [
      { appeal: 1, price: 6, fair: 6 },
      { appeal: 1, price: 12, fair: 6 },
    ];
    expect(wantedPortions(20, 1.5, items)).toEqual([15, 2]);
  });

  it("spills half of the sold-out wish to dishes with room, never above their stock", () => {
    const split = sellWithSpill([10, 2, 4], [4, 6, 4]);
    expect(split.sold).toEqual([4, 5, 4]);
    expect(split.spilled).toEqual([0, 3, 0]);
    expect(split.unmet).toBe(3);
    const full = sellWithSpill([10, 4], [2, 4]);
    expect(full.sold).toEqual([2, 4]);
    expect(full.unmet).toBe(8);
  });
});
