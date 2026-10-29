// FR2 of support-legacy-ios-12-safari: the virtual module resolves in Vitest.
import { describe, expect, it } from "vitest";

describe("virtual:legacy-core-js", () => {
  it("should resolve through the plugin registered in vitest.config.ts", async () => {
    await expect(import("virtual:legacy-core-js")).resolves.toBeDefined();
  });
});
