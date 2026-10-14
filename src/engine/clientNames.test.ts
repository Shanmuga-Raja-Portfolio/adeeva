import { describe, expect, it } from "vitest";
import { clientNames } from "./clientNames";

describe("clientNames", () => {
  it("joins known names and stands in for clients it cannot find", () => {
    const lookup = (id: string) => (id === "pip" ? { name: "Pip" } : undefined);
    expect(clientNames(["pip", "ghost"], lookup)).toBe("Pip, A neighbour");
    expect(clientNames([], lookup)).toBe("");
  });
});
