import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { integrityOf, precacheList } from "./precacheList";

const files = (...paths: string[]) => paths.map((path) => ({ path, bytes: path }));
const urls = (paths: string[]) => precacheList(files(...paths)).map((entry) => entry.url);

describe("the offline file list", () => {
  it("keeps every served file, with index.html as the root", () => {
    expect(
      urls([
        "index.html",
        "assets/index-abc.js",
        "assets/index-def.css",
        "icons\\icon-192.png",
        "manifest.webmanifest",
      ]),
    ).toEqual([
      "/",
      "/assets/index-abc.js",
      "/assets/index-def.css",
      "/icons/icon-192.png",
      "/manifest.webmanifest",
    ]);
  });

  it("leaves out host files, the worker itself, source maps and hidden files", () => {
    expect(
      urls(["_headers", "_redirects", "sw.js", "assets/a.js.map", ".DS_Store", "icons/.keep", "a.js"]),
    ).toEqual(["/a.js"]);
  });

  it("lists each file once, in a stable order", () => {
    expect(urls(["b.js", "/a.js", "a.js", "b.js"])).toEqual(["/a.js", "/b.js"]);
  });

  it("pins every file to the exact bytes the build wrote", () => {
    const bytes = new Uint8Array([0, 1, 2, 250]);
    const expected = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
    expect(precacheList([{ path: "icons/a.png", bytes }])).toEqual([
      { url: "/icons/a.png", integrity: expected },
    ]);
    expect(integrityOf("<html>")).toBe(integrityOf(new TextEncoder().encode("<html>")));
    expect(integrityOf("<html>")).not.toBe(integrityOf("<html> "));
  });
});
