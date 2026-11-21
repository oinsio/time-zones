// Verifies FR3, FR10 of add-meeting-share-dialog.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { LocationKind } from "./locationKind";
import { INITIAL_WORLD_CLOCK_STATE, type WorldClockState } from "./locations";
import { getMeetingInvitation } from "./meetingInvitation";

const RANGE = {
  start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
  end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
};

const buildLocation = (id: string, timeZoneId: string, label: string) => ({
  id,
  kind: LocationKind.CITY,
  timeZoneId,
  label,
  countryCode: "",
});

const STATE: WorldClockState = {
  ...INITIAL_WORLD_CLOCK_STATE,
  locations: [
    buildLocation("almaty", "Asia/Almaty", "Almaty"),
    buildLocation("moscow", "Europe/Moscow", "Moscow"),
    buildLocation("kolkata", "Asia/Kolkata", "Kolkata"),
  ],
  meeting: RANGE,
};

const idsOf = (excluded: readonly string[]) =>
  getMeetingInvitation(STATE, excluded)?.locations.map(({ id }) => id);

describe("getMeetingInvitation", () => {
  it("should keep the list order", () => {
    expect(idsOf([])).toEqual(["almaty", "moscow", "kolkata"]);
  });

  it("should carry the meeting range", () => {
    expect(getMeetingInvitation(STATE, [])?.range).toBe(RANGE);
  });

  it("should carry the stored fields the text needs", () => {
    expect(getMeetingInvitation(STATE, [])?.locations[1]).toEqual({
      id: "moscow",
      kind: LocationKind.CITY,
      timeZoneId: "Europe/Moscow",
      label: "Moscow",
    });
  });

  it("should drop the excluded locations", () => {
    expect(idsOf(["moscow"])).toEqual(["almaty", "kolkata"]);
  });

  it("should ignore an excluded id that is not in the list", () => {
    expect(idsOf(["paris"])).toEqual(["almaty", "moscow", "kolkata"]);
  });

  it("should give no locations when every id is excluded", () => {
    expect(idsOf(["almaty", "moscow", "kolkata"])).toEqual([]);
  });

  it("should give undefined without a meeting range", () => {
    expect(
      getMeetingInvitation({ ...STATE, meeting: undefined }, []),
    ).toBeUndefined();
  });
});
