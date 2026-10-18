import { expect, test, type Page } from "@playwright/test";

interface Kept {
  readonly caches: readonly string[];
  readonly urls: readonly string[];
}

async function keptOffline(page: Page): Promise<Kept> {
  return page.evaluate(async () => {
    const names = (await caches.keys()).filter((name) => name.startsWith("maker-studio-"));
    const urls: string[] = [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) urls.push(new URL(request.url).pathname);
    }
    return { caches: names, urls };
  });
}

async function workerState(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration === undefined) return "none";
    if (registration.active !== null) return "active";
    return registration.installing !== null ? "installing" : "waiting";
  });
}

test("a version with one damaged file never takes over, and nothing of it is kept", async ({
  context,
  page,
}) => {
  let damaged = "";
  await context.route("**/assets/*.js", async (route) => {
    const request = route.request();
    if (request.serviceWorker() === null || (damaged !== "" && damaged !== request.url()))
      return route.continue();
    damaged = request.url();
    const reply = await route.fetch();
    await route.fulfill({ response: reply, body: `${await reply.text()}\n;` });
  });
  await page.goto("/");
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect.poll(() => damaged, { timeout: 30_000 }).not.toBe("");
  await expect.poll(() => workerState(page), { timeout: 30_000 }).toBe("none");
  expect((await keptOffline(page)).caches).toEqual([]);

  await context.unroute("**/assets/*.js");
  await page.reload();
  await expect.poll(() => workerState(page), { timeout: 30_000 }).toBe("active");
  const kept = await keptOffline(page);
  expect(kept.caches).toHaveLength(1);
  expect(kept.urls).toContain(new URL(damaged).pathname);
});

test("a file outside the build is never stored, even when the host answers with the studio page", async ({
  page,
}) => {
  await page.goto("/");
  await expect.poll(() => workerState(page), { timeout: 30_000 }).toBe("active");
  await page.reload();
  const before = await keptOffline(page);
  expect(before.urls).toContain("/");
  const answer = await page.evaluate(async () => {
    const reply = await fetch("/assets/RemovedLastWeek-0ld.js");
    return { status: reply.status, type: reply.headers.get("content-type") ?? "" };
  });
  expect(answer).toEqual({ status: 200, type: expect.stringContaining("text/html") });
  expect(await keptOffline(page)).toEqual(before);
});
