import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { headersFor, parseHeadersFile } from "./headersFile";
import { BUILD_TOKEN } from "./workerSource";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const read = (path: string) => readFileSync(`${ROOT}${path}`);
const STRICT_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; " +
  "connect-src 'self'; manifest-src 'self'; worker-src 'self'; media-src 'self' blob: data:; " +
  "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests";

interface ManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose: string;
}

function pngSize(bytes: Buffer): string {
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

describe("the files the host serves", () => {
  const rules = parseHeadersFile(read("public/_headers").toString("utf8"));

  it("sends the strict policy and the hardening headers on every path", () => {
    for (const path of ["/", "/index.html", "/sw.js", "/assets/index.js", "/icons/icon-192.png"]) {
      const headers = headersFor(rules, path);
      expect(headers["Content-Security-Policy"]).toBe(STRICT_CSP);
      expect(headers["Strict-Transport-Security"]).toBe("max-age=31536000; includeSubDomains");
      expect(headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(headers["Referrer-Policy"]).toBe("no-referrer");
      expect(headers["X-Frame-Options"]).toBe("DENY");
      expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
      expect(headers["Cross-Origin-Embedder-Policy"]).toBeUndefined();
      expect(headers["Cross-Origin-Resource-Policy"]).toBe("same-origin");
      for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"])
        expect(headers["Permissions-Policy"]).toContain(`${feature}=()`);
    }
  });

  it("never caches the entry files and caches hashed assets for a year", () => {
    for (const path of ["/", "/index.html", "/sw.js", "/manifest.webmanifest"])
      expect(headersFor(rules, path)["Cache-Control"]).toBe("no-cache");
    expect(headersFor(rules, "/assets/index-abc.js")["Cache-Control"]).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("describes an installable app whose icons exist at their stated sizes", () => {
    const manifest = JSON.parse(read("public/manifest.webmanifest").toString("utf8")) as {
      name: string;
      display: string;
      start_url: string;
      scope: string;
      icons: ManifestIcon[];
    };
    expect(manifest).toMatchObject({
      name: "Maker Studio",
      display: "standalone",
      start_url: "/",
      scope: "/",
    });
    expect(manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual([
      "192x192 any",
      "512x512 any",
      "512x512 maskable",
    ]);
    for (const icon of manifest.icons) {
      expect(icon.type).toBe("image/png");
      expect(pngSize(read(`public${icon.src}`))).toBe(icon.sizes);
    }
    expect(pngSize(read("public/icons/apple-touch-icon.png"))).toBe("180x180");
    expect(existsSync(`${ROOT}public/icons/maker-studio.svg`)).toBe(true);
  });

  it("links the manifest, icons and theme colour from the page", () => {
    const html = read("index.html").toString("utf8");
    expect(html).toContain(
      '<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials" />',
    );
    expect(html).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />');
    expect(html).toContain('<meta name="theme-color" content="#f9e7da" />');
    expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
    expect(html).not.toMatch(/\sstyle=/);
  });

  it("keeps exactly one build token in the service worker template", () => {
    expect(read("src/offline/serviceWorker.js").toString("utf8").split(BUILD_TOKEN)).toHaveLength(2);
  });
});
