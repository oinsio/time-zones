import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay } from "./dayTrack";
import { LocationKind } from "./locationKind";
import { INITIAL_WORLD_CLOCK_STATE, type WorldClockState } from "./locations";
import { ReferenceMode } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const stateIn = (deviceTimeZoneId: string): WorldClockState => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId,
});
const instantOf = (iso: string) => Temporal.Instant.from(iso);
const dayOf = (zone: string, iso: string) =>
  getReferenceDay(stateIn(zone), instantOf(iso));

// Verifies FR1 of show-clock-change-note-on-location-cards (D1).
describe("getReferenceDay clock change window", () => {
  it("should span 7 days before to 8 days after the start of the date", () => {
    const day = dayOf("Europe/Belgrade", "2026-11-01T09:00:00Z");

    expect(day.clockChangeWindow.start.toString()).toBe("2026-10-24T22:00:00Z");
    expect(day.clockChangeWindow.end.toString()).toBe("2026-11-08T23:00:00Z");
  });

  it("should count the window in the home zone, not the device zone", () => {
    const belgrade = {
      id: "Europe/Belgrade|Belgrade",
      kind: LocationKind.CITY,
      timeZoneId: "Europe/Belgrade",
      label: "Belgrade",
      countryCode: "RS",
    };
    const state: WorldClockState = {
      ...stateIn("Asia/Almaty"),
      locations: [belgrade],
      homeLocationId: belgrade.id,
    };

    const day = getReferenceDay(state, instantOf("2026-11-01T20:00:00Z"));

    expect(day.clockChangeWindow.start.toString()).toBe("2026-10-24T22:00:00Z");
  });

  it("should use the pinned date", () => {
    const state: WorldClockState = {
      ...stateIn("Europe/Belgrade"),
      reference: {
        mode: ReferenceMode.PINNED,
        instant: instantOf("2027-03-21T09:00:00Z"),
        wallClockStatus: WallClockStatus.UNIQUE,
        requestedWallTime: Temporal.PlainTime.from("09:00"),
      },
    };

    const day = getReferenceDay(state, instantOf("2026-11-01T09:00:00Z"));

    expect(day.clockChangeWindow.start.toString()).toBe("2027-03-13T23:00:00Z");
  });
});
