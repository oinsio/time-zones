// Verifies FR2, FR3, FR4, FR5 of show-clock-change-note-on-location-cards (D2, D3).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { stubZoneRules } from "@/test/stubZoneRules";
import { startWorkCount } from "@/test/workCounters";
import {
  type ClockChange,
  ClockChangeDirection,
  ClockChangeTense,
  findNearestClockChange,
  getClockChanges,
} from "./clockChange";

const instantOf = (iso: string) => Temporal.Instant.from(iso);
const BOA_VISTA_2000_RULES = {
  initialOffsetMinutes: -240,
  changes: [
    { instant: "2000-10-08T04:00:00Z", offsetMinutesAfter: -180 },
    { instant: "2000-10-15T03:00:00Z", offsetMinutesAfter: -240 },
  ],
};
const windowAround = (iso: string) => ({
  start: instantOf(iso).subtract({ hours: 24 * 7 }),
  end: instantOf(iso).add({ hours: 24 * 8 }),
});

describe("getClockChanges", () => {
  it.each([
    [
      "Europe/Belgrade",
      "2026-10-25T12:00:00Z",
      ClockChangeDirection.BACK,
      60,
      "2026-10-25T03:00:00",
    ],
    [
      "Europe/Belgrade",
      "2027-03-28T12:00:00Z",
      ClockChangeDirection.FORWARD,
      60,
      "2027-03-28T02:00:00",
    ],
    [
      "Australia/Lord_Howe",
      "2026-10-03T15:30:00Z",
      ClockChangeDirection.FORWARD,
      30,
      "2026-10-04T02:00:00",
    ],
    [
      "Asia/Almaty",
      "2024-02-29T18:00:00Z",
      ClockChangeDirection.BACK,
      60,
      "2024-03-01T00:00:00",
    ],
  ])(
    "should read the change of %s near %s as %s by %i min at %s",
    (timeZoneId, aroundIso, direction, amountMinutes, wallClockTime) => {
      const [change] = getClockChanges(timeZoneId, windowAround(aroundIso));

      expect(change.direction).toBe(direction);
      expect(change.amountMinutes).toBe(amountMinutes);
      expect(change.wallClockTime.toString()).toBe(wallClockTime);
    },
  );

  it("should give the instant of the change", () => {
    const changes = getClockChanges(
      "Europe/Belgrade",
      windowAround("2026-10-25T12:00:00Z"),
    );

    expect(changes.map((change) => change.instant.toString())).toEqual([
      "2026-10-25T01:00:00Z",
    ]);
  });

  it("should find nothing in a zone without changes", () => {
    expect(
      getClockChanges("Asia/Tokyo", windowAround("2026-10-25T12:00:00Z")),
    ).toEqual([]);
  });

  it("should find nothing in an unknown zone", () => {
    expect(
      getClockChanges("Mars/Olympus", windowAround("2026-10-25T12:00:00Z")),
    ).toEqual([]);
  });

  it("should read both changes of a short daylight saving span", () => {
    const spies = stubZoneRules("America/Boa_Vista", BOA_VISTA_2000_RULES);
    try {
      const changes = getClockChanges(
        "America/Boa_Vista",
        windowAround("2000-10-12T12:00:00Z"),
      );

      expect(
        changes.map((change) => [
          change.direction,
          change.wallClockTime.toString(),
        ]),
      ).toEqual([
        [ClockChangeDirection.FORWARD, "2000-10-08T00:00:00"],
        [ClockChangeDirection.BACK, "2000-10-15T00:00:00"],
      ]);
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
  });
});

describe("getClockChanges memoization", () => {
  it("should look up no transition for the same window and zone again", () => {
    const window = windowAround("2027-06-10T12:00:00Z");
    getClockChanges("Europe/Belgrade", window);
    const work = startWorkCount();

    getClockChanges("Europe/Belgrade", window);

    expect(work.transitionLookups()).toBe(0);
    work.stop();
  });

  it("should look up transitions for a new window", () => {
    getClockChanges("Europe/Belgrade", windowAround("2027-06-10T12:00:00Z"));
    const work = startWorkCount();

    getClockChanges("Europe/Belgrade", windowAround("2027-06-11T12:00:00Z"));

    expect(work.transitionLookups()).toBeGreaterThan(0);
    work.stop();
  });

  it("should look up transitions for another zone in the same window", () => {
    const window = windowAround("2027-06-10T12:00:00Z");
    getClockChanges("Europe/Belgrade", window);
    const work = startWorkCount();

    getClockChanges("Asia/Tokyo", window);

    expect(work.transitionLookups()).toBeGreaterThan(0);
    work.stop();
  });
});

describe("findNearestClockChange", () => {
  const changeAt = (iso: string): ClockChange => ({
    instant: instantOf(iso),
    direction: ClockChangeDirection.FORWARD,
    amountMinutes: 60,
    wallClockTime: Temporal.PlainDateTime.from(iso.slice(0, -1)),
  });
  const earlier = changeAt("2000-10-08T04:00:00Z");
  const later = changeAt("2000-10-15T03:00:00Z");

  it("should pick the earlier change as a past one when it is nearer", () => {
    expect(
      findNearestClockChange(
        [earlier, later],
        instantOf("2000-10-10T12:00:00Z"),
      ),
    ).toEqual({ clockChange: earlier, tense: ClockChangeTense.PAST });
  });

  it("should pick the later change as a future one when it is nearer", () => {
    expect(
      findNearestClockChange(
        [earlier, later],
        instantOf("2000-10-13T12:00:00Z"),
      ),
    ).toEqual({ clockChange: later, tense: ClockChangeTense.FUTURE });
  });

  it("should pick the earlier one at equal distance", () => {
    expect(
      findNearestClockChange(
        [earlier, later],
        instantOf("2000-10-11T15:30:00Z"),
      )?.clockChange,
    ).toBe(earlier);
  });

  it("should call a change at the instant itself past", () => {
    expect(findNearestClockChange([later], later.instant)?.tense).toBe(
      ClockChangeTense.PAST,
    );
  });

  it("should give none for no changes", () => {
    expect(findNearestClockChange([], instantOf("2000-10-10T12:00:00Z"))).toBe(
      undefined,
    );
  });
});
