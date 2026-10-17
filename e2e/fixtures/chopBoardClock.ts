import type { ElementHandle, Page } from "@playwright/test";

export type ChopBoardHandle = ElementHandle<HTMLElement | SVGElement>;

export async function holdChopBoard(page: Page): Promise<ChopBoardHandle> {
  return page.getByTestId("chop-board").elementHandle();
}

export async function chopClockAtLeast(page: Page, board: ChopBoardHandle, value: number): Promise<boolean> {
  const reached = await page.waitForFunction(
    ([element, target]) => {
      if (!element.isConnected || element.getAttribute("data-phase") === "done") return "over";
      return Number(element.getAttribute("data-clock")) >= target ? "live" : false;
    },
    [board, value] as const,
    { polling: "raf" },
  );
  return (await reached.jsonValue()) === "live";
}

export async function chopBoardFinished(page: Page, board: ChopBoardHandle, timeout: number): Promise<void> {
  await page.waitForFunction(
    (element) => !element.isConnected || element.getAttribute("data-phase") === "done",
    board,
    { polling: "raf", timeout },
  );
}
