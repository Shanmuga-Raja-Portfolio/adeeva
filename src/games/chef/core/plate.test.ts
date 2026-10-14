import { describe, expect, it } from "vitest";
import { dishById } from "./catalog";
import { focusScore, ghostLayout, placedAt, plateIssues, scorePlate, type PlateRecord } from "./plate";

const DAL = dishById("dal-tadka");

function record(overrides: Partial<PlateRecord> = {}): PlateRecord {
  return { components: ghostLayout(DAL), plateColour: "white", wiped: true, assisted: false, ...overrides };
}

describe("Plate It scoring", () => {
  it("gives a tidy, wiped, well-placed plate full marks", () => {
    const result = scorePlate(DAL, record(), 1);
    expect(result).toMatchObject({
      accuracy: 1,
      inWell: 1,
      spacing: 1,
      focus: 1,
      garnishMet: true,
      wiped: true,
    });
    expect(result.colourCount).toBe(2);
  });

  it("takes a little off for drips and caps the ghost plate helper at 0.8", () => {
    expect(scorePlate(DAL, record({ wiped: false }), 1).accuracy).toBeCloseTo(0.95);
    expect(scorePlate(DAL, record({ assisted: true }), 1).accuracy).toBe(0.8);
  });

  it("counts pieces outside the well, overlaps and missing garnishes", () => {
    const hero = placedAt("dal-swirl", [200, 194], 0, 1, 2);
    const base = placedAt("golden-broth-bowl", [200, 200], 0, 1, 0);
    const leaf = placedAt("coriander-sprig", [200, 200], 0, 1, 3);
    const lone = scorePlate(DAL, record({ components: [base, hero] }), 1);
    expect(lone.garnishMet).toBe(false);
    expect(lone.accuracy).toBeCloseTo(0.7);
    const clash = scorePlate(DAL, record({ components: [base, hero, leaf] }), 1);
    expect(clash.spacing).toBe(0.75);
    const edge = placedAt("coriander-sprig", [370, 200], 0, 1, 3);
    expect(scorePlate(DAL, record({ components: [base, hero, edge] }), 1).inWell).toBeCloseTo(2 / 3);
  });

  it("rewards the hero on the centre or a thirds point, with a wider sweet spot for Plating Spoons", () => {
    expect(focusScore([200, 200], 1)).toBe(1);
    expect(focusScore([255, 145], 1)).toBe(1);
    expect(focusScore([200, 120], 1)).toBeLessThan(1);
    expect(focusScore([200, 120], 1.2)).toBeGreaterThan(focusScore([200, 120], 1));
  });

  it("refuses parts from another dish, doubles, off-plate poses and a missing hero", () => {
    expect(plateIssues(DAL, record())).toEqual([]);
    expect(
      plateIssues(DAL, record({ components: [placedAt("spaghetti-twirl", [200, 200], 0, 1, 0)] })),
    ).not.toEqual([]);
    const hero = placedAt("dal-swirl", [200, 194], 0, 1, 2);
    expect(plateIssues(DAL, record({ components: [hero, hero] }))).not.toEqual([]);
    expect(plateIssues(DAL, record({ components: [{ ...hero, scale: 1.5 }] }))).not.toEqual([]);
    expect(plateIssues(DAL, record({ components: [{ ...hero, x: -4 }] }))).not.toEqual([]);
    expect(
      plateIssues(DAL, record({ components: [placedAt("coriander-sprig", [200, 100], 0, 1, 1)] })),
    ).not.toEqual([]);
  });
});
