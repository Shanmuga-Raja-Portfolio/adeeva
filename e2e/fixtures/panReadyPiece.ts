import type { Page } from "@playwright/test";

type Pair = readonly [number, number];

export interface ReadyPiece {
  readonly id: string;
  readonly side: number;
  readonly at: Pair;
  readonly tray: Pair;
}

const TRAY: Pair = [490, 200];

export async function nextReadyPiece(page: Page, flipped: readonly string[]): Promise<ReadyPiece | null> {
  const found = await page.waitForFunction(
    ([skip, tray]): ReadyPiece | false => {
      const finished: ReadyPiece = { id: "", side: -1, at: [0, 0], tray: [0, 0] };
      const pan = document.querySelector("[data-testid='sizzle-pan']");
      if (!(pan instanceof SVGSVGElement)) return finished;
      const pieces = Array.from(pan.querySelectorAll("[data-testid^='piece-']"));
      if (pieces.length === 0) return finished;
      const matrix = pan.getScreenCTM();
      if (matrix === null) return false;
      const drop = new DOMPoint(tray[0], tray[1]).matrixTransform(matrix);
      for (const piece of pieces) {
        const id = piece.getAttribute("data-testid") ?? "";
        const side = Number(piece.getAttribute("data-side"));
        const waitingToTurn = side === 0 && skip.includes(id);
        const hit = piece.querySelector("circle");
        if (hit === null || Number(piece.getAttribute("data-cook")) < 0.97 || waitingToTurn) continue;
        const box = hit.getBoundingClientRect();
        return {
          id,
          side,
          at: [box.x + box.width / 2, box.y + box.height / 2],
          tray: [drop.x, drop.y],
        };
      }
      return false;
    },
    [flipped, TRAY] as const,
    { polling: "raf" },
  );
  const ready = (await found.jsonValue()) as ReadyPiece;
  return ready.id === "" ? null : ready;
}
