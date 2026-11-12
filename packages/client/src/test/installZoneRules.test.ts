// FR1 of add-zone-rules-from-iana: the test setup runs on the committed rules
import { describe, expect, it } from "vitest";
import { getInstalledRelease } from "@/lib/zoneRules";
import { realNativeDateTimeFormat } from "./installZoneRules";

describe("the test setup", () => {
  it("installs the wrapper as Intl.DateTimeFormat", () => {
    expect(Intl.DateTimeFormat).not.toBe(realNativeDateTimeFormat);
  });

  it("keeps the real engine's constructor as realNativeDateTimeFormat", () => {
    expect(realNativeDateTimeFormat.name).toBe("DateTimeFormat");
    expect(Intl.DateTimeFormat.supportedLocalesOf).toBe(
      realNativeDateTimeFormat.supportedLocalesOf,
    );
  });

  it("installs the committed release 2026f", () => {
    expect(getInstalledRelease()?.release).toBe("2026f");
  });
});
