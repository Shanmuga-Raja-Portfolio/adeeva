import { describe, expect, it } from "vitest";
import { garnishesLeftLine, plateInstruction, PLATE_LINES, type PlateMoment } from "./plateInstruction";

const moment = (change: Partial<PlateMoment> = {}): PlateMoment => ({
  placed: 0,
  heroPlaced: false,
  garnishesLeft: 2,
  inWell: true,
  wiped: false,
  assisted: false,
  plated: false,
  ...change,
});

describe("Plate instruction", () => {
  it("walks from dragging parts to the hero, garnishes, the well, the rim and Plate it", () => {
    expect(plateInstruction(moment())).toBe(PLATE_LINES.start);
    expect(plateInstruction(moment({ placed: 1 }))).toBe(PLATE_LINES.hero);
    expect(plateInstruction(moment({ placed: 2, heroPlaced: true }))).toBe(garnishesLeftLine(2));
    const full = { placed: 4, heroPlaced: true, garnishesLeft: 0 };
    expect(plateInstruction(moment({ ...full, inWell: false }))).toBe(PLATE_LINES.well);
    expect(plateInstruction(moment(full))).toBe(PLATE_LINES.wipe);
    expect(plateInstruction(moment({ ...full, wiped: true }))).toBe(PLATE_LINES.ready);
    expect(plateInstruction(moment({ ...full, wiped: true, plated: true }))).toBe(PLATE_LINES.plated);
  });

  it("points a Ghost plate player at the ghost spots", () => {
    expect(plateInstruction(moment({ assisted: true }))).toBe(PLATE_LINES.ghost);
  });

  it("counts garnishes in words a child can read", () => {
    expect(garnishesLeftLine(1)).toBe("Add 1 more garnish to finish the look.");
    expect(garnishesLeftLine(2)).toBe("Add 2 more garnishes to finish the look.");
  });
});
