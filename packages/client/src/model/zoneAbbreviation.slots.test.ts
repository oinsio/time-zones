// Verifies FR1, FR2 of show-zone-abbreviations-and-zone-label-setting.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Temporal } from "@/lib/temporal";

vi.mock("virtual:zone-abbreviations", () => ({
  default: { "America/Santiago": ["", "XDT"] },
}));

const ZONE = "America/Santiago";
let model: typeof import("./zoneAbbreviation");

// The setup files may already have loaded the model with the real table.
beforeAll(async () => {
  vi.resetModules();
  model = await import("./zoneAbbreviation");
});

function abbreviationAt(instant: string): string | undefined {
  return model.getZoneAbbreviation(ZONE, Temporal.Instant.from(instant).toZonedDateTimeISO(ZONE));
}

describe("getZoneAbbreviation with an empty slot", () => {
  it("gives none at the lower offset, whose slot is empty", () => {
    expect(abbreviationAt("2026-07-15T12:00:00Z")).toBeUndefined();
  });

  it("gives the letter abbreviation at the higher offset", () => {
    expect(abbreviationAt("2026-01-15T12:00:00Z")).toBe("XDT");
  });

  it("leaves the empty slot out of the pair", () => {
    expect(model.getZoneAbbreviations(ZONE)).toEqual(["XDT"]);
  });
});
