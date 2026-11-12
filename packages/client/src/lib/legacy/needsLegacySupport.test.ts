// FR2 of support-legacy-ios-12-safari: polyfills are needed only when a built-in is missing.
// FR5 of add-zone-rules-from-iana: the state of the engine's zone data plays no part.
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  installStaleEngine,
  restoreEngine,
} from "@/test/fakeStaleDateTimeFormat";
import { needsLegacySupport } from "./needsLegacySupport";

const arrayAt = Array.prototype.at;

describe("needsLegacySupport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    restoreEngine();
    Array.prototype.at = arrayAt;
  });

  it("should be false on an engine with every built-in", () => {
    expect(needsLegacySupport()).toBe(false);
  });

  it("should be false while the engine rejects Europe/Kyiv", () => {
    installStaleEngine({ staleZones: {}, rejectedZones: ["Europe/Kyiv"] });

    expect(needsLegacySupport()).toBe(false);
  });

  it.each([
    [
      "Array#at is missing",
      () => {
        // @ts-expect-error simulating an engine without Array#at
        delete Array.prototype.at;
      },
    ],
    [
      "ResizeObserver is missing",
      () => vi.stubGlobal("ResizeObserver", undefined),
    ],
  ])("should be true when %s", (_description, removeBuiltIn) => {
    removeBuiltIn();

    expect(needsLegacySupport()).toBe(true);
  });
});
