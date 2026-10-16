import { describe, expect, it } from "vitest";
import { HOME_HINTS } from "../content/hints";
import { openHomeRoomIssue } from "./homeRoom";
import { newShowHomeGame, openRoom, planHome, project, startHome } from "./larkspurPlaythrough";
import { lateDay, openHouseAlert, openHouseDay } from "./projectCalendar";
import { runStartIssue } from "./runLifecycle";

const PLANNED = planHome(startHome(newShowHomeGame()));

describe("reminders while a home is open", { timeout: 60_000 }, () => {
  it("names the open home room instead of a makeover", () => {
    const opened = openRoom(PLANNED, 0);
    expect(openHomeRoomIssue(opened, 1)).toBe(HOME_HINTS.busyHomeRoom);
    expect(openHomeRoomIssue(opened, 0)).toBe(HOME_HINTS.busyHomeRoom);
    expect(runStartIssue(opened)).toBe(HOME_HINTS.homeRoomOpen);
    expect(openHomeRoomIssue(PLANNED, 1)).toBeNull();
  });

  it("flags Open House day and the last day, and nothing once the doors have opened", () => {
    const home = project(PLANNED);
    expect(openHouseAlert(home, openHouseDay(home) - 1)).toBeNull();
    expect(openHouseAlert(home, openHouseDay(home))).toBe("today");
    expect(openHouseAlert(home, lateDay(home))).toBe("late");
    expect(openHouseAlert({ ...home, stage: "done" }, openHouseDay(home))).toBeNull();
  });
});
