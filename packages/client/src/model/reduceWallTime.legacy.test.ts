// Verifies FR13 of add-wall-time-input-with-hint (M8); FR5 of add-zone-rules-from-iana:
// a renamed zone on outdated zone data, known from the zone rules.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installZoneRulesDateTimeFormat } from "@/lib/zoneRules";
import { LocationKind } from "@/model";
import {
  installStaleEngine,
  restoreEngine,
} from "@/test/fakeStaleDateTimeFormat";
import { committedRelease } from "@/test/installZoneRules";

const RENAMED_ZONE_ID = "Europe/Kyiv";

describe("SET_WALL_TIME on an engine that rejects Europe/Kyiv", () => {
  beforeEach(() => {
    installStaleEngine({ staleZones: {}, rejectedZones: [RENAMED_ZONE_ID] });
    installZoneRulesDateTimeFormat(committedRelease);
    vi.resetModules();
  });

  afterEach(() => {
    restoreEngine();
    vi.resetModules();
  });

  it("pins the same instant as a modern engine and keeps the canonical zone", async () => {
    const model = await import("@/model");
    const kyiv = {
      id: "Europe/Kyiv|Kyiv",
      kind: LocationKind.CITY,
      timeZoneId: RENAMED_ZONE_ID,
      label: "Kyiv",
      countryCode: "UA",
    };
    const result = model.reduceLocations(
      {
        ...model.INITIAL_WORLD_CLOCK_STATE,
        deviceTimeZoneId: "Asia/Almaty",
        locations: [kyiv],
      },
      {
        type: model.LocationCommandType.SET_WALL_TIME,
        target: {
          kind: model.WallTimeTargetKind.LOCATION,
          locationId: kyiv.id,
        },
        time: "10:00",
        date: "2026-03-08",
      },
    );
    if (!result.ok) throw new Error("expected ok");
    const { reference, locations } = result.state;
    if (reference.mode !== model.ReferenceMode.PINNED)
      throw new Error("pinned");
    expect(reference.instant.toString()).toBe("2026-03-08T08:00:00Z");
    expect(reference.wallClockStatus).toBe(model.WallClockStatus.UNIQUE);
    expect(locations[0]?.timeZoneId).toBe(RENAMED_ZONE_ID);
  });
});
