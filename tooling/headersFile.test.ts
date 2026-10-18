import { describe, expect, it } from "vitest";
import { headersFor, matchesPath, overPlainHttp, parseHeadersFile } from "./headersFile";
import { previewHeaders } from "./hostHeaders";

const SAMPLE = [
  "/*",
  "  X-Frame-Options: DENY",
  "  Content-Security-Policy: default-src 'self'; img-src 'self' data:",
  "",
  "/assets/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "/sw.js",
  "  Cache-Control: no-cache",
].join("\r\n");

describe("the _headers file", () => {
  it("reads each path and the headers indented under it", () => {
    expect(parseHeadersFile(SAMPLE)).toEqual([
      {
        pattern: "/*",
        headers: [
          ["X-Frame-Options", "DENY"],
          ["Content-Security-Policy", "default-src 'self'; img-src 'self' data:"],
        ],
      },
      { pattern: "/assets/*", headers: [["Cache-Control", "public, max-age=31536000, immutable"]] },
      { pattern: "/sw.js", headers: [["Cache-Control", "no-cache"]] },
    ]);
  });

  it("refuses headers outside a path and paths that are not rooted", () => {
    expect(() => parseHeadersFile("  X-Frame-Options: DENY")).toThrow(/line 1/);
    expect(() => parseHeadersFile("assets/*\n  A: b")).toThrow(/must start with \//);
    expect(() => parseHeadersFile("/*\n  not a header")).toThrow(/line 2/);
  });

  it("matches a splat across folders and a plain path exactly", () => {
    expect(matchesPath("/*", "/")).toBe(true);
    expect(matchesPath("/assets/*", "/assets/deep/file.js")).toBe(true);
    expect(matchesPath("/assets/*", "/assets.js")).toBe(false);
    expect(matchesPath("/sw.js", "/sw.js")).toBe(true);
    expect(matchesPath("/sw.js", "/swXjs")).toBe(false);
  });

  it("gives a path every matching rule and joins repeats with a comma", () => {
    const rules = parseHeadersFile(SAMPLE);
    expect(headersFor(rules, "/assets/app.js")).toEqual({
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' data:",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    const repeated = parseHeadersFile("/*\n  Vary: A\n/x\n  vary: B");
    expect(headersFor(repeated, "/x")).toEqual({ Vary: "A, B" });
  });

  it("gives each preview request the rules for its own path, like the host", () => {
    const rules = parseHeadersFile(SAMPLE);
    expect(previewHeaders(rules, "/sw.js?next=1")).toEqual({
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' data:",
      "Cache-Control": "no-cache",
    });
    expect(previewHeaders(rules, "/assets/app.js")["Cache-Control"]).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(previewHeaders(rules, "/")["Cache-Control"]).toBeUndefined();
  });

  it("drops only the HTTPS upgrade when the local preview serves plain HTTP", () => {
    expect(
      overPlainHttp({
        "Content-Security-Policy": "default-src 'self'; upgrade-insecure-requests; object-src 'none'",
        "X-Frame-Options": "DENY",
      }),
    ).toEqual({
      "Content-Security-Policy": "default-src 'self'; object-src 'none'",
      "X-Frame-Options": "DENY",
    });
  });
});
