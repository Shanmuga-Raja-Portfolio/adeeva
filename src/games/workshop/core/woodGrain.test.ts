import { describe, expect, it } from "vitest";
import { productById } from "./catalog";
import { placementGrain, SHOW_ME_GRAIN_CAP, woodGrain } from "./woodGrain";

const birdhouse = productById("birdhouse");
const plantStand = productById("plant-stand");

function part(productParts: typeof birdhouse.parts, id: string) {
  const found = productParts.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(id);
  return found;
}

describe("wood lines", () => {
  it("scores parts running along the wood lines as 1", () => {
    expect(woodGrain(part(birdhouse.parts, "roof-1"), 0)).toBe(1);
    expect(woodGrain(part(birdhouse.parts, "roof-1"), 180)).toBe(1);
  });

  it("scores parts turned across by their shape", () => {
    expect(woodGrain(part(birdhouse.parts, "roof-1"), 90)).toBe(0.85);
    expect(woodGrain(part(productById("toy-chest").parts, "lid"), 270)).toBe(0.7);
    expect(woodGrain(part(plantStand.parts, "leg-1"), 90)).toBe(0.5);
  });

  it("caps Show me placements at 0.9", () => {
    const roof = part(birdhouse.parts, "roof-1");
    expect(placementGrain(roof, { boardId: "board-1", x: 0, y: 0, rotation: 0, assisted: true })).toBe(
      SHOW_ME_GRAIN_CAP,
    );
    expect(placementGrain(roof, { boardId: "board-1", x: 0, y: 0, rotation: 0, assisted: false })).toBe(1);
  });
});
