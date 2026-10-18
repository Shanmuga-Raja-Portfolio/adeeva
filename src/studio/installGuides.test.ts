import { describe, expect, it } from "vitest";
import { INSTALL_GUIDES, likelyDevice } from "./installGuides";

describe("install guides", () => {
  it("cover every family device with three picture steps", () => {
    expect(INSTALL_GUIDES.map((guide) => guide.device)).toEqual([
      "android",
      "chromebook",
      "windows",
      "apple-mobile",
      "mac",
    ]);
    for (const guide of INSTALL_GUIDES) expect(guide.steps).toHaveLength(3);
  });

  it("opens the guide for the device the page is read on", () => {
    expect(likelyDevice("Mozilla/5.0 (Linux; Android 14; Pixel 7) Chrome/140", 5)).toBe("android");
    expect(likelyDevice("Mozilla/5.0 (X11; CrOS x86_64 15359.58.0) Chrome/140", 0)).toBe("chromebook");
    expect(likelyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari", 5)).toBe(
      "apple-mobile",
    );
    expect(likelyDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari", 5)).toBe("apple-mobile");
    expect(likelyDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari", 0)).toBe("mac");
    expect(likelyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/140", 0)).toBe("windows");
    expect(likelyDevice("Mozilla/5.0 (X11; Linux x86_64) Firefox/140", 0)).toBeNull();
  });
});
