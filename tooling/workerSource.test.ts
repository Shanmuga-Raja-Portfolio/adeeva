import { describe, expect, it } from "vitest";
import { buildVersion, workerSource } from "./workerSource";

describe("the built service worker", () => {
  it("writes the version and file list in place of the build token", () => {
    const source = workerSource("const BUILD = __MAKER_BUILD__;\nrun(BUILD);", {
      version: "abc",
      assets: [{ url: "/", integrity: "sha384-x" }],
    });
    expect(source).toBe(
      'const BUILD = {"version":"abc","assets":[{"url":"/","integrity":"sha384-x"}]};\nrun(BUILD);',
    );
  });

  it("refuses a template without exactly one build token", () => {
    expect(() => workerSource("const BUILD = {};", { version: "a", assets: [] })).toThrow(/exactly one/);
    expect(() => workerSource("__MAKER_BUILD__ __MAKER_BUILD__", { version: "a", assets: [] })).toThrow();
  });

  it("names a version that changes with any file and ignores file order", () => {
    const page = { path: "index.html", bytes: "<html>" };
    const files = [page, { path: "icons/icon.png", bytes: new Uint8Array([1, 2, 3]) }];
    const version = buildVersion(files);
    expect(version).toMatch(/^[0-9a-f]{16}$/);
    expect(buildVersion([...files].reverse())).toBe(version);
    expect(buildVersion([page, { path: "icons/icon.png", bytes: new Uint8Array([1, 2, 4]) }])).not.toBe(
      version,
    );
    expect(buildVersion([page, { path: "icons/other.png", bytes: new Uint8Array([1, 2, 3]) }])).not.toBe(
      version,
    );
  });
});
