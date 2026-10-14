import { describe, expect, it } from "vitest";
import { constructionFeedback } from "./kindFeedback";

describe("kind feedback", () => {
  it("counts unfinished work in plain, correct English", () => {
    expect(constructionFeedback({ stitchLines: 1, pieces: 1, seams: 1 })).toContain(
      "1 stitch line to snip, 1 piece to cut, 1 seam to sew",
    );
    expect(constructionFeedback({ stitchLines: 2, pieces: 3, seams: 0 })).toContain(
      "2 stitch lines to snip, 3 pieces to cut.",
    );
  });
});
