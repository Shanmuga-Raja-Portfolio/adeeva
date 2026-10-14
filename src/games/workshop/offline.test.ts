import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function filesUnder(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe("Workshop & Wood stays offline", () => {
  it("loads no fonts and fetches nothing", () => {
    const sources = filesUnder(import.meta.dirname).filter(
      (path) => /\.(tsx?|css)$/.test(path) && !path.endsWith("offline.test.ts"),
    );
    expect(sources.length).toBeGreaterThan(20);
    for (const path of sources) {
      const text = readFileSync(path, "utf8");
      expect(text, path).not.toMatch(
        /@font-face|@import|url\(\s*["']?(https?:|[/]{2})|fetch\(|XMLHttpRequest|https?:[/]{2}/,
      );
    }
  });
});
