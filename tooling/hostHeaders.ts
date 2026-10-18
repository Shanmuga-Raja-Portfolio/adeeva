import type { Plugin } from "vite";
import { headersFor, overPlainHttp, type HeaderRule } from "./headersFile.ts";

export function previewHeaders(rules: readonly HeaderRule[], requestUrl: string): Record<string, string> {
  return overPlainHttp(headersFor(rules, new URL(requestUrl, "http://preview.invalid").pathname));
}

export function hostHeaders(rules: readonly HeaderRule[]): Plugin {
  return {
    name: "maker-host-headers",
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        for (const [name, value] of Object.entries(previewHeaders(rules, request.url ?? "/")))
          response.setHeader(name, value);
        next();
      });
    },
  };
}
