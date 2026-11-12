// FR2, FR6 of support-legacy-ios-12-safari: legacy support installs what is missing.
import { afterEach, describe, expect, it, vi } from "vitest";

describe("installLegacySupport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("should install ResizeObserver when it is absent", async () => {
    vi.stubGlobal("ResizeObserver", undefined);
    vi.resetModules();
    const { loadLegacySupport } = await import("./index");

    await loadLegacySupport();

    expect(globalThis.ResizeObserver).toBeTypeOf("function");
  });

  it("should keep an existing ResizeObserver", async () => {
    const existingObserver = globalThis.ResizeObserver;
    vi.resetModules();
    const { loadLegacySupport } = await import("./index");

    await loadLegacySupport();

    expect(globalThis.ResizeObserver).toBe(existingObserver);
  });
});
