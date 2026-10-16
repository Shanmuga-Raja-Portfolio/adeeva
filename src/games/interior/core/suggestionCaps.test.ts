import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { plotById } from "./catalog";
import type { GameState } from "./gameState";
import { bestMap, plotSpaces } from "./homeMap";
import { homePanels, MAP_SUGGESTION_CAP, PLAN_SUGGESTION_CAP } from "./homePanels";
import type { Project } from "./larkspur";
import { hire, newShowHomeGame, planHome, project, readyHome, startHome } from "./larkspurPlaythrough";
import { achebePlan } from "./openHousePlan";
import { reduce } from "./reduce";

function part(state: GameState, panelId: string, partId: string): number | undefined {
  const plan = project(state).plan;
  if (plan === null) throw new Error("No plan");
  return homePanels(state, project(state), plan)
    .find((entry) => entry.id === panelId)
    ?.parts.find((entry) => entry.id === partId)?.value;
}

function swapBack(state: GameState): GameState {
  const spaces = project(state).map.spaces;
  const open = plotSpaces(plotById(project(state).plotId)).filter((space) => !space.hall);
  const [a, b] = [open[0]?.index ?? 0, open[1]?.index ?? 1];
  const [first, second] = [spaces[a], spaces[b]];
  if (first === null || first === undefined || second === null || second === undefined)
    throw new Error("Empty map");
  const moves: Action[] = [
    { type: "placePurpose", purposeId: second, spaceIndex: a },
    { type: "placePurpose", purposeId: first, spaceIndex: b },
    { type: "placePurpose", purposeId: first, spaceIndex: a },
    { type: "placePurpose", purposeId: second, spaceIndex: b },
  ];
  return moves.reduce(reduce, state);
}

const MAPPED = reduce(startHome(newShowHomeGame()), { type: "useAchebeMap" });
const PLANNER = readyHome(planHome(startHome(newShowHomeGame())));

describe("Ms. Achebe's suggestions", { timeout: 60_000 }, () => {
  it("stay capped when her map is taken apart and put back the same", () => {
    const back = swapBack(MAPPED);
    expect(project(back).map.spaces).toEqual(project(MAPPED).map.spaces);
    expect(project(back).map.fromAchebe).toBe(true);
    const fresh = startHome(newShowHomeGame());
    const best = bestMap(plotById(project(fresh).plotId));
    const handMade = best.reduce<GameState>(
      (state, purposeId, spaceIndex) =>
        purposeId === null || purposeId === "hall"
          ? state
          : reduce(state, { type: "placePurpose", purposeId, spaceIndex }),
      fresh,
    );
    expect(project(handMade).map.spaces).toEqual(best);
    expect(project(handMade).map.fromAchebe).toBe(true);
  });

  it("stay capped when her plan arrives with any flag, and lift for the player's own plan", () => {
    const suggestion = achebePlan(PLANNER, project(PLANNER));
    const forged = { ...suggestion, fromAchebe: false } as const;
    const sent = reduce(PLANNER, { type: "planOpenHouse", plan: forged });
    expect(project(sent).plan?.fromAchebe).toBe(true);
    expect(part(sent, "story", "welcome")).toBe(PLAN_SUGGESTION_CAP);
    expect(part(sent, "story", "tour")).toBe(PLAN_SUGGESTION_CAP);
    expect(part(sent, "flow", "map")).toBe(MAP_SUGGESTION_CAP);
    const time = suggestion.time === "morning" ? "evening" : "morning";
    const own = reduce(PLANNER, { type: "planOpenHouse", plan: { ...suggestion, time } });
    expect(project(own).plan?.fromAchebe).toBe(false);
  });

  it("returns the same state for a repeated plan or palette", () => {
    const suggestion = achebePlan(PLANNER, project(PLANNER));
    const planned = reduce(PLANNER, { type: "planOpenHouse", plan: suggestion });
    expect(reduce(planned, { type: "planOpenHouse", plan: suggestion })).toBe(planned);
    const palette = reduce(reduce(MAPPED, { type: "confirmMap" }), { type: "useAchebePalette" });
    expect(reduce(palette, { type: "useAchebePalette" })).toBe(palette);
  });

  it("refuses malformed plans and coaching records with the same state", () => {
    const malformed = [
      { type: "planOpenHouse", plan: null },
      { type: "planOpenHouse", plan: { tour: null, music: "beach-pop", time: "morning" } },
      { type: "coachCrew", record: null },
      { type: "coachCrew", record: { job: "paint", samples: null } },
      { type: "coachCrew", record: { job: "floor", drops: [[1, "x"]] } },
      { type: "coachCrew", record: { job: "paint", samples: [], assisted: "yes" } },
    ] as unknown as readonly Action[];
    const crewed = hire(planHome(startHome(newShowHomeGame())), ["rosa"]);
    for (const state of [PLANNER, crewed])
      for (const action of malformed) expect(reduce(state, action), action.type).toBe(state);
  });

  it("caps an assisted paint demo at the Assist share", () => {
    const crewed = hire(planHome(startHome(newShowHomeGame())), ["rosa"]);
    const coached = reduce(crewed, {
      type: "coachCrew",
      record: { job: "paint", samples: [], assisted: true },
    });
    const demo: Project["coached"]["paint"] = project(coached).coached.paint;
    expect(demo).toBeGreaterThan(0);
    expect(demo).toBeLessThan(1);
  });
});
