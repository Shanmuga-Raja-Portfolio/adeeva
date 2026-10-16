import { expect, test } from "@playwright/test";
import { advance, finishInteriorStories, watchOutsideRequests } from "../fixtures/interiorStudio";
import { endDays, planShow, project } from "../../src/games/interior/core/larkspurPlaythrough";
import { openHouseDay } from "../../src/games/interior/core/projectCalendar";
import { openHouseReady, openPreparedHome, plannedHome } from "../fixtures/preparedLarkspur";

test("a home room left open over a reload carries on from its card", async ({ page }) => {
  test.setTimeout(120_000);
  const outside = watchOutsideRequests(page);
  await openPreparedHome(page, plannedHome());
  await page.getByTestId("open-room-0").click();
  await finishInteriorStories(page);
  await advance(page);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishInteriorStories(page);
  await expect(page.locator(".is-hub-card.ad-card--gold")).toContainText("Little Bedroom");
  await page.getByTestId("open-project").click();
  await expect(page.getByTestId("open-room-0")).toBeEnabled();
  await expect(page.getByTestId("open-room-0")).toHaveText(/Carry on here/);
  await expect(page.getByTestId("open-room-1")).toHaveAttribute(
    "title",
    "Finish the room you have open first.",
  );
  await page.getByTestId("open-room-0").click();
  await expect(page.getByRole("heading", { name: "Pick and place", level: 1 })).toBeVisible();
  expect(outside).toEqual([]);
});

test("Open House day is shown and ending it asks first", async ({ page }) => {
  test.setTimeout(120_000);
  const ready = openHouseReady();
  const today = endDays(ready, openHouseDay(project(ready)) - ready.calendar.day);
  await openPreparedHome(page, planShow(today));
  await expect(page.getByTestId("open-house-due")).toContainText("Open House is today!");
  await page.getByTestId("planner-end-day").click();
  await expect(page.getByRole("dialog", { name: "Today is Open House day!" })).toBeVisible();
  await page.getByRole("button", { name: "Stay today" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByTestId("open-house-due")).toContainText("Open House is today!");
});

test("paint coaching works from the keyboard with Steady brush and gives focus back", async ({ page }) => {
  test.setTimeout(120_000);
  await openPreparedHome(page, plannedHome());
  await page.getByTestId("coach-light").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("coach-dialog-light")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("coach-light")).toBeFocused();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("switch", { name: /Steady brush/ }).click();
  await page.keyboard.press("Escape");
  await page.getByTestId("coach-paint").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("coach-dialog-paint")).toBeVisible();
  await page.getByTestId("coach-assist-paint").focus();
  await page.keyboard.press("Enter");
  await finishInteriorStories(page);
  await expect(page.getByTestId("coach-paint")).toContainText("✓");
});
