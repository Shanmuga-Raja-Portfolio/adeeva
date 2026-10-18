import { expect, test, type BrowserContext } from "@playwright/test";
import { controlledStudio } from "../fixtures/controlledStudio";

const SIGN_IN_PAGE = "Sign in to Maker Studio";
const HOST_PAGE = "A page straight from the host";

async function expireSession(context: BrowserContext): Promise<string[]> {
  const asked: string[] = [];
  await context.route(
    (url) => url.pathname === "/" || url.pathname === "/sw.js",
    async (route) => {
      const url = new URL(route.request().url());
      asked.push(url.pathname + url.search);
      await route.fulfill({ status: 401, contentType: "text/html", body: `<h1>${SIGN_IN_PAGE}</h1>` });
    },
  );
  return asked;
}

async function signInAtHost(context: BrowserContext): Promise<string[]> {
  const asked: string[] = [];
  await context.unrouteAll({ behavior: "wait" });
  await context.route(
    (url) => url.pathname === "/" && url.searchParams.has("signin"),
    async (route) => {
      const url = new URL(route.request().url());
      asked.push(url.pathname + url.search);
      await route.fulfill({ status: 200, contentType: "text/html", body: `<h1>${HOST_PAGE}</h1>` });
    },
  );
  return asked;
}

test("a family member whose sign-in expired still opens the saved studio, marked signed out", async ({
  context,
  page,
}) => {
  await controlledStudio(page);
  await expect(page.getByTestId("signed-out-mark")).toHaveCount(0);
  await expireSession(context);
  await page.reload();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  const mark = page.getByTestId("signed-out-mark");
  await expect(mark).toBeVisible();
  await expect(mark).toContainText("Signed out");

  await page.getByRole("link", { name: "Parent page" }).click();
  await expect(page.getByTestId("parent-page").getByTestId("signed-out-mark")).toBeVisible();
  await page.getByRole("link", { name: "About, privacy and installing the app" }).click();
  await expect(page.getByTestId("about-page").getByTestId("signed-out-mark")).toBeVisible();
  await page.getByRole("link", { name: "Back to the studio" }).click();
  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  await expect(page.getByTestId("signed-out-mark")).toHaveCount(0);
});

test("Sign in leaves the saved copy for the host's sign-in page, then the saved copy returns and the mark clears", async ({
  context,
  page,
}) => {
  await controlledStudio(page);
  const expired = await expireSession(context);
  await page.reload();
  await page.getByTestId("signed-out-mark").getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: SIGN_IN_PAGE })).toBeVisible();
  expect(expired).toContain("/?signin=1");

  const returned = await signInAtHost(context);
  await page.goto("/?signin=1");
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(returned).toEqual(["/?signin=1"]);
  await expect(page.getByRole("heading", { name: HOST_PAGE })).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("signed-out-mark")).toHaveCount(0);
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
});
