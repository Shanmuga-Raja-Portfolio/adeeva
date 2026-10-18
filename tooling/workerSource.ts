import { createHash } from "node:crypto";

export const BUILD_TOKEN = "__MAKER_BUILD__";

export interface BuiltFile {
  readonly path: string;
  readonly bytes: string | Uint8Array;
}

export interface PrecacheEntry {
  readonly url: string;
  readonly integrity: string;
}

export interface WorkerBuild {
  readonly version: string;
  readonly assets: readonly PrecacheEntry[];
}

export function buildVersion(files: readonly BuiltFile[]): string {
  const hash = createHash("sha256");
  for (const file of [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
    hash.update(file.path);
    hash.update("\0");
    hash.update(file.bytes);
    hash.update("\0");
  }
  return hash.digest("hex").slice(0, 16);
}

export function workerSource(template: string, build: WorkerBuild): string {
  const parts = template.split(BUILD_TOKEN);
  if (parts.length !== 2) throw new Error(`The service worker template needs exactly one ${BUILD_TOKEN}`);
  return parts.join(JSON.stringify({ version: build.version, assets: build.assets }));
}
