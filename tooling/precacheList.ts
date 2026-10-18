import { createHash } from "node:crypto";
import type { BuiltFile, PrecacheEntry } from "./workerSource.ts";

const HOST_ONLY = new Set(["_headers", "_redirects", "sw.js"]);
export const SHELL_URL = "/";

function servedName(file: string): string {
  return file.replaceAll("\\", "/").replace(/^\/+/, "");
}

function isServed(name: string): boolean {
  if (HOST_ONLY.has(name) || name.endsWith(".map")) return false;
  return name.split("/").every((part) => part.length > 0 && !part.startsWith("."));
}

export function integrityOf(bytes: string | Uint8Array): string {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

export function precacheList(files: readonly BuiltFile[]): PrecacheEntry[] {
  const entries = new Map<string, PrecacheEntry>();
  for (const file of files) {
    const name = servedName(file.path);
    if (!isServed(name)) continue;
    const url = name === "index.html" ? SHELL_URL : `/${name}`;
    if (!entries.has(url)) entries.set(url, { url, integrity: integrityOf(file.bytes) });
  }
  return [...entries.values()].sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
}
