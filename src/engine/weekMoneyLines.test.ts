import { describe, expect, it } from "vitest";
import { weekMoneyLines } from "./weekMoneyLines";

describe("week money lines", () => {
  it("adds money in and out, drops empty lines and shows which way it went", () => {
    const week = weekMoneyLines(
      [
        { label: "Plates sold", amount: 400 },
        { label: "Tips", amount: 0 },
      ],
      [
        { label: "Ingredients", amount: 120 },
        { label: "Rent", amount: 300 },
      ],
    );
    expect(week.moneyIn).toEqual([{ label: "Plates sold", amount: 400 }]);
    expect(week.totalOut).toBe(420);
    expect(week.leftOver).toBe(-20);
    expect(week.trend).toBe("down");
    expect(weekMoneyLines([], []).trend).toBe("level");
    expect(weekMoneyLines([{ label: "Fees", amount: 5 }], []).trend).toBe("up");
  });
});
