// @add-zone-rules-from-iana @FR7: reading the 64-bit block and the footer of a TZif file
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readTzif } from "../../../scripts/zoneRules/readTzif.ts";
import { buildTzif } from "./buildTzif";

const NEW_YORK_FILE = join(__dirname, "fixtures", "America_New_York.tzif");
const EST = {
  utcOffsetSeconds: -18000,
  isDaylightSavingTime: false,
  designation: "EST",
};
const EDT = {
  utcOffsetSeconds: -14400,
  isDaylightSavingTime: true,
  designation: "EDT",
};

describe("readTzif", () => {
  it("reads types, transitions and footer of a real slim file", () => {
    const zone = readTzif(new Uint8Array(readFileSync(NEW_YORK_FILE)));
    expect(zone.footer).toBe("EST5EDT,M3.2.0,M11.1.0");
    expect(zone.types.map((type) => type.designation)).toEqual([
      "LMT",
      "EDT",
      "EST",
      "EWT",
      "EPT",
    ]);
    expect(zone.transitions[0]).toEqual([-2717650800, 2]);
    expect(zone.transitions.at(-1)).toEqual([1173596400, 1]);
  });

  it("skips the version 1 block", () => {
    const bytes = buildTzif({
      types: [EST],
      transitions: [],
      footer: "",
      versionOne: {
        counts: {
          time: 0,
          type: 1,
          char: 1,
          leap: 0,
          standard: 0,
          universal: 0,
        },
        block: Uint8Array.of(9, 9, 9, 9, 9, 9, 9),
      },
    });
    expect(readTzif(bytes).types).toEqual([EST]);
  });

  it("skips a version 1 block with transitions, leap seconds and indicators", () => {
    // 2 transitions of 4 bytes and 2 type indices, 1 type of 6 bytes, 1 designation byte,
    // 1 leap second of 8 bytes, 1 standard and 1 universal indicator
    const blockLength = 2 * 4 + 2 + 6 + 1 + 8 + 1 + 1;
    const bytes = buildTzif({
      types: [EST, EDT],
      transitions: [[1_000_000_000, 1]],
      footer: "EST5EDT",
      versionOne: {
        counts: {
          time: 2,
          type: 1,
          char: 1,
          leap: 1,
          standard: 1,
          universal: 1,
        },
        block: new Uint8Array(blockLength).fill(9),
      },
    });
    expect(readTzif(bytes)).toMatchObject({
      footer: "EST5EDT",
      types: [EST, EDT],
    });
  });

  it("skips the leap seconds and indicators of the 64-bit block", () => {
    const bytes = buildTzif({
      types: [EST],
      transitions: [[1_000_000_000, 0]],
      footer: "EST5",
      extraCounts: { leap: 2, standard: 1, universal: 3 },
    });
    expect(readTzif(bytes).footer).toBe("EST5");
  });

  it("rejects data where the footer does not start on a newline", () => {
    const bytes = buildTzif({ types: [EST], transitions: [], footer: "EST5" });
    bytes[bytes.length - "\nEST5\n".length] = "X".charCodeAt(0);
    expect(() => readTzif(bytes)).toThrow("ends");
  });

  it("reads the daylight saving flag of the first type as set and of the second as clear", () => {
    const bytes = buildTzif({ types: [EDT, EST], transitions: [], footer: "" });
    expect(
      readTzif(bytes).types.map((type) => type.isDaylightSavingTime),
    ).toEqual([true, false]);
  });

  it("reads a transition time above 2^31 and one before 1970", () => {
    const bytes = buildTzif({
      types: [EST, EDT],
      transitions: [
        [-2717650800, 0],
        [4_000_000_000, 1],
      ],
      footer: "",
    });
    expect(readTzif(bytes).transitions).toEqual([
      [-2717650800, 0],
      [4_000_000_000, 1],
    ]);
  });

  it("splits the designations at NUL", () => {
    const bytes = buildTzif({
      types: [EST, EDT],
      transitions: [[0, 1]],
      footer: "",
    });
    expect(readTzif(bytes).types.map((type) => type.designation)).toEqual([
      "EST",
      "EDT",
    ]);
  });

  it("reads the offset and the daylight saving flag of every type", () => {
    const bytes = buildTzif({ types: [EST, EDT], transitions: [], footer: "" });
    expect(readTzif(bytes).types).toEqual([EST, EDT]);
  });

  it("reads an empty footer as an empty text", () => {
    const bytes = buildTzif({ types: [EST], transitions: [], footer: "" });
    expect(readTzif(bytes).footer).toBe("");
  });

  it("rejects a file without the TZif magic", () => {
    const bytes = buildTzif({
      magic: "XZif",
      types: [EST],
      transitions: [],
      footer: "",
    });
    expect(() => readTzif(bytes)).toThrow("TZif");
  });

  it.each([[0], [48]])(
    "rejects version byte %i: only version 2 and later carry 64-bit data",
    (version) => {
      const bytes = buildTzif({
        version,
        types: [EST],
        transitions: [],
        footer: "",
      });
      expect(() => readTzif(bytes)).toThrow("version");
    },
  );

  it("rejects a file that ends inside its data", () => {
    const bytes = buildTzif({
      types: [EST],
      transitions: [[0, 0]],
      footer: "",
    });
    expect(() => readTzif(bytes.subarray(0, 70))).toThrow("ends");
  });
});
