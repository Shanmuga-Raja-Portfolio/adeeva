import { describe, expect, it } from "vitest";
import { colourById, COLOURS, isColourId, type ColourId } from "./palette";

describe("colour catalog", () => {
  it("looks every colour up by id with its name and hex", () => {
    for (const colour of COLOURS) expect(colourById(colour.id)).toBe(colour);
    expect(colourById("navy")).toEqual({ id: "navy", name: "Navy", hex: "#22305a" });
  });

  it("refuses an id that is not in the catalog", () => {
    expect(() => colourById("tartan" as ColourId)).toThrow("Missing colour in catalog: tartan");
  });

  it("tells a catalog colour id from any other string", () => {
    for (const colour of COLOURS) expect(isColourId(colour.id)).toBe(true);
    expect(isColourId("tartan")).toBe(false);
    expect(isColourId("")).toBe(false);
  });
});
