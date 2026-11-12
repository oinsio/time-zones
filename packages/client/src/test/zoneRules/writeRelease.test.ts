// @add-zone-rules-from-iana @FR2: writing the release document
import { describe, expect, it } from "vitest";
import {
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules/core";
import type { ReleaseZone } from "../../../scripts/zoneRules/truncateToCutoff.ts";
import { writeRelease } from "../../../scripts/zoneRules/writeRelease.ts";

const UTC_ZONE: ReleaseZone = {
  types: [[0, "UTC", 0]],
  cutoffType: 0,
  changes: [],
  futureRule: "UTC0",
};
const KOLKATA_ZONE: ReleaseZone = {
  types: [[19800, "IST", 0]],
  cutoffType: 0,
  changes: [],
  futureRule: "IST-5:30",
};

function writeAndParse(options: Parameters<typeof writeRelease>[0]) {
  return JSON.parse(writeRelease(options));
}

describe("writeRelease", () => {
  it("writes the release name and the cutoff", () => {
    const document = writeAndParse({
      release: "2026f",
      zones: new Map(),
      links: new Map(),
    });
    expect(document).toMatchObject({
      release: "2026f",
      cutoff: 946684800,
      zones: {},
    });
  });

  it("writes a zone as its rules", () => {
    const document = writeAndParse({
      release: "2026f",
      zones: new Map([["Asia/Kolkata", KOLKATA_ZONE]]),
      links: new Map(),
    });
    expect(document.zones["Asia/Kolkata"]).toEqual(KOLKATA_ZONE);
  });

  it("writes a link as the name of its target", () => {
    const document = writeAndParse({
      release: "2026f",
      zones: new Map([["Asia/Kolkata", KOLKATA_ZONE]]),
      links: new Map([["Asia/Calcutta", "Asia/Kolkata"]]),
    });
    expect(document.zones["Asia/Calcutta"]).toBe("Asia/Kolkata");
  });

  it("follows a chain of links to the zone", () => {
    const document = writeAndParse({
      release: "2026f",
      zones: new Map([["Asia/Kolkata", KOLKATA_ZONE]]),
      links: new Map([
        ["A", "B"],
        ["B", "Asia/Kolkata"],
      ]),
    });
    expect(document.zones.A).toBe("Asia/Kolkata");
  });

  it("lists the zones in alphabetical order, one per line", () => {
    const text = writeRelease({
      release: "2026f",
      zones: new Map([
        ["Etc/UTC", UTC_ZONE],
        ["Asia/Kolkata", KOLKATA_ZONE],
      ]),
      links: new Map([["UTC", "Etc/UTC"]]),
    });
    expect(text.split("\n").filter((line) => line.startsWith('"'))).toEqual([
      `"Asia/Kolkata":${JSON.stringify(KOLKATA_ZONE)},`,
      `"Etc/UTC":${JSON.stringify(UTC_ZONE)},`,
      '"UTC":"Etc/UTC"',
    ]);
    expect(text.endsWith("\n")).toBe(true);
  });

  it("writes a document the app's reader accepts", () => {
    const release = parseZoneRulesRelease(
      writeAndParse({
        release: "2026f",
        zones: new Map([["Etc/UTC", UTC_ZONE]]),
        links: new Map([["UTC", "Etc/UTC"]]),
      }),
    );
    expect(release).not.toBeInstanceOf(ZoneRulesReleaseError);
  });

  it.each([
    ["a link to a missing zone", new Map([["A", "Nowhere"]])],
    [
      "a cycle of links",
      new Map([
        ["A", "B"],
        ["B", "A"],
      ]),
    ],
  ])("rejects %s", (_description, links) => {
    expect(() =>
      writeRelease({ release: "2026f", zones: new Map(), links }),
    ).toThrow("A");
  });

  it("lets a zone win over a link of the same name", () => {
    const document = writeAndParse({
      release: "2026f",
      zones: new Map([["Asia/Kolkata", KOLKATA_ZONE]]),
      links: new Map([["Asia/Kolkata", "Asia/Kolkata"]]),
    });
    expect(document.zones["Asia/Kolkata"]).toEqual(KOLKATA_ZONE);
  });
});
