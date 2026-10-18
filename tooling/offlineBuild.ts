import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { Plugin } from "vite";
import { precacheList } from "./precacheList.ts";
import { buildVersion, workerSource } from "./workerSource.ts";

function namesUnder(folder: string, root = folder): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return namesUnder(path, root);
    return [relative(root, path).replaceAll("\\", "/")];
  });
}

export function offlineBuild(templatePath: string): Plugin {
  let publicDir = "";
  return {
    name: "maker-offline-build",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      publicDir = config.build.copyPublicDir ? config.publicDir : "";
    },
    writeBundle(options, bundle) {
      const outDir = options.dir;
      if (outDir === undefined) throw new Error("The offline build needs an output folder");
      if (!("index.html" in bundle)) throw new Error("The offline build expected index.html in the bundle");
      const names = [...Object.keys(bundle), ...(publicDir.length > 0 ? namesUnder(publicDir) : [])];
      const files = [...new Set(names)].map((path) => ({ path, bytes: readFileSync(join(outDir, path)) }));
      const template = readFileSync(templatePath, "utf8");
      const source = workerSource(template, {
        version: buildVersion([...files, { path: "sw.js", bytes: template }]),
        assets: precacheList(files),
      });
      writeFileSync(join(outDir, "sw.js"), source);
    },
  };
}
