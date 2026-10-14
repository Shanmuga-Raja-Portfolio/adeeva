import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const BANNED_WORDS =
  /\b(exotic|ethnic|weird|wine|beer|sake|mirin|spirits|healthy|unhealthy|guilt-free|calories|diet|flambe|flambé|fire|burnt|burned|smoke|alarm|knife grip|degrees|celsius|fahrenheit|minutes)\b/i;
const NETWORK =
  /@font-face|url\(\s*["']?https?:|fetch\(|XMLHttpRequest|new WebSocket|navigator\.sendBeacon|https?:[/][/]/;

function files(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx|css)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

describe("Six Kitchens stays offline and kind", () => {
  it("loads no fonts and makes no network requests", () => {
    for (const file of files(ROOT)) expect(NETWORK.test(readFileSync(file, "utf8")), file).toBe(false);
  });

  it("never shows words the safety notes rule out", () => {
    for (const file of [...files(join(ROOT, "ui")), ...files(join(ROOT, "content"))])
      expect(readFileSync(file, "utf8").match(BANNED_WORDS)?.[0] ?? null, file).toBeNull();
  });
});
