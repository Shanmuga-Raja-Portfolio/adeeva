import { describe, expect, it } from "vitest";
import { GAME_IDS } from "./gameModule";
import { GAMES, liveGame } from "./registry";

describe("the studio registry", () => {
  it("opens every game id from exactly one module", () => {
    expect(GAMES.map((game) => game.id).sort()).toEqual([...GAME_IDS].sort());
    for (const gameId of GAME_IDS) expect(liveGame(gameId)?.id).toBe(gameId);
  });
});
