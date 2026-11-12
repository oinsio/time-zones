// @add-zone-rules-from-iana @FR2: truncating a compiled zone at the cutoff, edge cases
import { describe, expect, it } from "vitest";
import type { TzifZone } from "../../../scripts/zoneRules/readTzif.ts";
import { truncateToCutoff } from "../../../scripts/zoneRules/truncateToCutoff.ts";
import { CUTOFF, type } from "./truncateToCutoffWorld";

describe("truncateToCutoff edge cases", () => {
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
