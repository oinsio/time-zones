// FR1 of add-zone-rules-from-iana: the test setup runs on the committed rules
// @add-remote-zone-rules-updates @FR1: the committed release is read from its file, never named here
import { describe, expect, it } from "vitest";
import { getInstalledRelease, parseReleaseName } from "@/lib/zoneRules";
import { committedRelease, realNativeDateTimeFormat } from "./installZoneRules";

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

  it("installs the committed release", () => {
    expect(getInstalledRelease()?.release).toBe(committedRelease.release);
    expect(parseReleaseName(committedRelease.release)).toBeDefined();
  });
});
