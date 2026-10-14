import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { finishStories } from "../fixtures/story";
import { THRIFT_URL } from "../fixtures/thriftPage";

const MID_FLIP = readFileSync(
  new URL("../../src/games/thrift-flip/core/v1Saves/midFlipAfterCut.json", import.meta.url),
  "utf8",
);

test("a committed version 1 save loads into a slot and carries on", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(THRIFT_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("thrift-flip.save.1", json);
    window.localStorage.setItem("thrift-flip.lastSlot", "1");
  }, MID_FLIP);
  await page.reload();
  await expect(page.getByTestId("slot-place")).toHaveText("Market stall");
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishStories(page);
  await expect(page.getByTestId("stall-hub")).toHaveAttribute("data-career", "stall");
  await page.getByTestId("gig-card").getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sewing machine" })).toBeVisible();
  await page.getByRole("button", { name: /Back to the stall/ }).click();
  await page.getByTestId("end-day").click();
  await page.getByTestId("dawn-continue").click();
  await finishStories(page);
  await expect(page.locator(".tf-hero__day")).toHaveText("Day 2");
  await page.getByTestId("save-exit").click();
  const saved = await page.evaluate(() => window.localStorage.getItem("thrift-flip.save.1"));
  const state = JSON.parse(saved ?? "{}") as { schemaVersion: number; profile: { career: string } };
  expect(state.schemaVersion).toBe(2);
  expect(state.profile.career).toBe("stall");
});
