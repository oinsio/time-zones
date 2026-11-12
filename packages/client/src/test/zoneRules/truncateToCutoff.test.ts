// @add-zone-rules-from-iana @FR2: truncating a compiled zone to the cutoff
import { describe, expect, it } from "vitest";
import type { TzifZone } from "../../../scripts/zoneRules/readTzif.ts";
import { truncateToCutoff } from "../../../scripts/zoneRules/truncateToCutoff.ts";

const CUTOFF = 946684800;

const type = (
  utcOffsetSeconds: number,
  designation: string,
  isDaylightSavingTime = false,
) => ({
  utcOffsetSeconds,
  designation,
  isDaylightSavingTime,
});

describe("truncateToCutoff", () => {
  it("keeps the type in force at the cutoff and the later changes of a Moscow-like zone", () => {
    const zone: TzifZone = {
      types: [type(9017, "LMT"), type(10800, "MSK"), type(14400, "MSK")],
      transitions: [
        [-1688265017, 1],
        [938916000, 1],
        [1301180400, 2],
        [1414276800, 1],
      ],
      footer: "MSK-3",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [
        [10800, "MSK", 0],
        [14400, "MSK", 0],
      ],
      cutoffType: 0,
      changes: [
        [354495600, 1],
        [467592000, 0],
      ],
      futureRule: "MSK-3",
    });
  });

  it("keeps the footer and the changes up to 2007 of a New York-like zone", () => {
    const zone: TzifZone = {
      types: [
        type(-17762, "LMT"),
        type(-14400, "EDT", true),
        type(-18000, "EST"),
      ],
      transitions: [
        [-2717650800, 2],
        [941349600, 2],
        [1143961200, 1],
        [1162101600, 2],
        [1173596400, 1],
      ],
      footer: "EST5EDT,M3.2.0,M11.1.0",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [
        [-18000, "EST", 0],
        [-14400, "EDT", 1],
      ],
      cutoffType: 0,
      changes: [
        [197276400, 1],
        [215416800, 0],
        [226911600, 1],
      ],
      futureRule: "EST5EDT,M3.2.0,M11.1.0",
    });
  });

  it("takes the cutoff type of a Dublin-like zone from its future rule, with the rule's daylight saving flag", () => {
    const zone: TzifZone = {
      types: [type(-1521, "LMT"), type(3600, "IST"), type(0, "GMT")],
      transitions: [
        [-2821649679, 1],
        [846205200, 2],
      ],
      footer: "IST-1GMT0,M10.5.0,M3.5.0/1",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [[0, "GMT", 1]],
      cutoffType: 0,
      changes: [],
      futureRule: "IST-1GMT0,M10.5.0,M3.5.0/1",
    });
  });

  it("takes the cutoff type of a zone without changes after the cutoff from its standard-only footer", () => {
    const zone: TzifZone = {
      types: [type(18468, "LMT"), type(18000, "+05")],
      transitions: [[-100000000, 1]],
      footer: "<+05>-5",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [[18000, "+05", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "<+05>-5",
    });
  });

  it("takes the last type when the footer is empty and no change follows the cutoff", () => {
    const zone: TzifZone = {
      types: [type(1, "A"), type(2, "B")],
      transitions: [[CUTOFF - 10, 1]],
      footer: "",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [[2, "B", 0]],
      cutoffType: 0,
      changes: [],
      futureRule: "",
    });
  });

  it("takes the first type when the first change follows the cutoff", () => {
    const zone: TzifZone = {
      types: [type(1, "A"), type(2, "B")],
      transitions: [[CUTOFF + 10, 1]],
      footer: "",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [
        [1, "A", 0],
        [2, "B", 0],
      ],
      cutoffType: 0,
      changes: [[10, 1]],
      futureRule: "",
    });
  });

  it("drops a change at the cutoff and keeps the one a second later", () => {
    const zone: TzifZone = {
      types: [type(1, "A"), type(2, "B"), type(3, "C")],
      transitions: [
        [CUTOFF, 1],
        [CUTOFF + 1, 2],
      ],
      footer: "",
    };
    expect(truncateToCutoff(zone)).toEqual({
      types: [
        [2, "B", 0],
        [3, "C", 0],
      ],
      cutoffType: 0,
      changes: [[1, 1]],
      futureRule: "",
    });
  });

  it("keeps types that differ only in designation or daylight saving flag apart", () => {
    const zone: TzifZone = {
      types: [type(3600, "A"), type(3600, "B"), type(3600, "A", true)],
      transitions: [
        [CUTOFF + 1, 1],
        [CUTOFF + 2, 2],
      ],
      footer: "",
    };
    expect(truncateToCutoff(zone).types).toEqual([
      [3600, "A", 0],
      [3600, "B", 0],
      [3600, "A", 1],
    ]);
  });

  it("keeps types that differ only in offset apart", () => {
    const zone: TzifZone = {
      types: [type(3600, "A"), type(7200, "A")],
      transitions: [[CUTOFF + 1, 1]],
      footer: "",
    };
    expect(truncateToCutoff(zone).types).toEqual([
      [3600, "A", 0],
      [7200, "A", 0],
    ]);
  });

  it("takes the cutoff type from the future rule when the only change is at the cutoff", () => {
    const zone: TzifZone = {
      types: [type(0, "A"), type(3600, "B")],
      transitions: [[CUTOFF, 1]],
      footer: "<+05>-5",
    };
    expect(truncateToCutoff(zone)).toMatchObject({
      types: [[18000, "+05", 0]],
      changes: [],
    });
  });

  it("does not take the cutoff type from the future rule when a change follows the cutoff", () => {
    const zone: TzifZone = {
      types: [type(0, "A"), type(3600, "B")],
      transitions: [[CUTOFF + 10, 1]],
      footer: "<+05>-5",
    };
    expect(truncateToCutoff(zone).types[0]).toEqual([0, "A", 0]);
  });

  it("reports a footer that is not a rule", () => {
    const zone: TzifZone = {
      types: [type(0, "UTC")],
      transitions: [],
      footer: "??",
    };
    expect(() => truncateToCutoff(zone)).toThrow("??");
  });
});
