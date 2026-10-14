import { describe, expect, it } from "vitest";
import type { SizzleDef } from "../content/dish";
import {
  cookPerTick,
  doneness,
  heatFit,
  quickSizzle,
  replayPiece,
  scoreSizzle,
  sideScore,
  TICKS_PER_SIDE,
  type SizzleRecord,
} from "./sizzle";
import { perfectSizzle } from "./testPlaythrough";

const CHICKEN: SizzleDef = { piece: "chicken", count: 3, idealDots: 3, flips: 1 };
const EGG: SizzleDef = { piece: "egg", count: 2, idealDots: 2, flips: 2 };

describe("Sizzle scoring", () => {
  it("cooks a side in about six seconds at the ideal heat in the centre, slower on the rim", () => {
    expect(cookPerTick(3, 3, "centre", 0) * TICKS_PER_SIDE).toBeCloseTo(1);
    expect(cookPerTick(3, 3, "rim", 0) * TICKS_PER_SIDE).toBeCloseTo(0.45);
    expect(cookPerTick(1, 3, "centre", 0) * TICKS_PER_SIDE).toBeCloseTo(1 / 3);
  });

  it("names the colour stops and never burns anything", () => {
    expect(doneness(0.5)).toBe("pale");
    expect(doneness(0.85)).toBe("light");
    expect(doneness(1)).toBe("golden");
    expect(doneness(1.2)).toBe("deep");
    expect(doneness(1.5)).toBe("extra-crispy");
  });

  it("scores a side 1 within the window and falls off over 0.3", () => {
    expect(sideScore(1.05, 0.1)).toBe(1);
    expect(sideScore(1.25, 0.1)).toBeCloseTo(0.5);
    expect(sideScore(0, 0.1)).toBe(0);
    expect(heatFit(3, 3)).toBe(1);
    expect(heatFit(5, 3)).toBeCloseTo(0.84);
  });

  it("replays a perfect pan to full marks, and caps help at 0.8", () => {
    const record = perfectSizzle(CHICKEN);
    expect(scoreSizzle(CHICKEN, record, 1)?.accuracy).toBeCloseTo(1, 2);
    expect(scoreSizzle(CHICKEN, { ...record, assisted: true }, 1)?.accuracy).toBe(0.8);
    expect(scoreSizzle(EGG, perfectSizzle(EGG), 1)?.sides).toHaveLength(6);
  });

  it("takes a forgotten piece off by itself at extra-crispy", () => {
    const cook = replayPiece({ events: [{ tick: 3000, kind: "off" }] }, 3, CHICKEN, 0);
    expect(cook?.offTick).toBe(Math.ceil(1.6 * TICKS_PER_SIDE));
    expect(cook?.sides[0]).toBeCloseTo(1.6, 2);
  });

  it("refuses event logs that go backwards, flip too often or never come off", () => {
    expect(
      replayPiece(
        {
          events: [
            { tick: 50, kind: "flip" },
            { tick: 40, kind: "off" },
          ],
        },
        3,
        CHICKEN,
        0,
      ),
    ).toBeNull();
    expect(
      replayPiece(
        {
          events: [
            { tick: 50, kind: "flip" },
            { tick: 60, kind: "flip" },
            { tick: 70, kind: "off" },
          ],
        },
        3,
        CHICKEN,
        0,
      ),
    ).toBeNull();
    expect(replayPiece({ events: [{ tick: 50, kind: "flip" }] }, 3, CHICKEN, 0)).toBeNull();
    const wrongCount: SizzleRecord = {
      ...perfectSizzle(CHICKEN),
      pieces: perfectSizzle(CHICKEN).pieces.slice(1),
    };
    expect(scoreSizzle(CHICKEN, wrongCount, 1)).toBeNull();
    expect(scoreSizzle(CHICKEN, { ...perfectSizzle(CHICKEN), heat: 6 }, 1)).toBeNull();
  });

  it("uses at most three pieces in service", () => {
    expect(quickSizzle({ ...CHICKEN, count: 5 }).count).toBe(3);
  });
});
