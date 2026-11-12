// Verifies FR10 of add-zone-rules-from-iana (design D6): nothing installed.
import { describe, expect, it, vi } from "vitest";

describe("zone rules before any release is installed", () => {
  it("should report no known zone ids", async () => {
    vi.resetModules();
    const { getKnownZoneIds } = await import("./installZoneRules.ts");
    expect(getKnownZoneIds()).toBeUndefined();
  });

  it("should report no installed release", async () => {
    vi.resetModules();
    const { getInstalledRelease } = await import("./installZoneRules.ts");
    expect(getInstalledRelease()).toBeUndefined();
  });
});
