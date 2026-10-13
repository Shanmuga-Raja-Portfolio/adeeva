import { describe, expect, it } from "vitest";
import { COLOURS, type ColourId } from "../content/colour";
import { colourById } from "./catalog";

describe("colour catalog", () => {
  it("looks every colour up by id with its name and hex", () => {
    for (const colour of COLOURS) expect(colourById(colour.id)).toBe(colour);
    expect(colourById("navy")).toEqual({ id: "navy", name: "Navy", hex: "#22305a" });
  });

  it("refuses an id that is not in the catalog", () => {
    expect(() => colourById("tartan" as ColourId)).toThrow("Missing colour in catalog: tartan");
  });
});
