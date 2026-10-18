import { describe, expect, it } from "vitest";
import { GAME_IDS } from "./gameModule";
import { parseRoute, routeHash } from "./studioRoute";

const allOpen = () => true;

describe("studio routes", () => {
  it("reads home, the parent and about pages and every game from the hash", () => {
    expect(parseRoute("", allOpen)).toEqual({ name: "home" });
    expect(parseRoute("#/", allOpen)).toEqual({ name: "home" });
    expect(parseRoute("#/parent", allOpen)).toEqual({ name: "parent" });
    expect(parseRoute("#/about/", allOpen)).toEqual({ name: "about" });
    expect(parseRoute("#/adeeva/", allOpen)).toEqual({ name: "game", gameId: "adeeva" });
    expect(parseRoute("#/nowhere", allOpen)).toEqual({ name: "home" });
  });

  it("sends a game that is still in the workshop back home", () => {
    const onlyAdeeva = (gameId: string) => gameId === "adeeva";
    expect(parseRoute("#/thrift-flip", onlyAdeeva)).toEqual({ name: "home" });
    expect(parseRoute("#/adeeva", onlyAdeeva)).toEqual({ name: "game", gameId: "adeeva" });
  });

  it("reads a crafted hash of many slashes in linear time", () => {
    const slashes = "/".repeat(200_000);
    const started = performance.now();
    expect(parseRoute(`#/${slashes}x`, allOpen)).toEqual({ name: "home" });
    expect(parseRoute(`#/about${slashes}`, allOpen)).toEqual({ name: "about" });
    expect(parseRoute(`#${slashes}`, allOpen)).toEqual({ name: "home" });
    expect(performance.now() - started).toBeLessThan(500);
  });

  it("writes hashes that read back to the same route", () => {
    for (const gameId of GAME_IDS) {
      const route = { name: "game" as const, gameId };
      expect(parseRoute(routeHash(route), allOpen)).toEqual(route);
    }
    expect(routeHash({ name: "home" })).toBe("#/");
    expect(routeHash({ name: "parent" })).toBe("#/parent");
    expect(routeHash({ name: "about" })).toBe("#/about");
  });
});
