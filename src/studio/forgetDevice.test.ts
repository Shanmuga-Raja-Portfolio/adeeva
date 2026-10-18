import { describe, expect, it } from "vitest";
import { confirmsForget } from "./ForgetDeviceDialog";

describe("deleting everything on the device", () => {
  it("goes ahead only once the grown-up has typed the word", () => {
    expect(confirmsForget("")).toBe(false);
    expect(confirmsForget("d")).toBe(false);
    expect(confirmsForget("delet")).toBe(false);
    expect(confirmsForget("deleted")).toBe(false);
    expect(confirmsForget("delete")).toBe(true);
    expect(confirmsForget(" Delete ")).toBe(true);
  });
});
