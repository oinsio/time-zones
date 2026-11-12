/**
 * Reads a TZif file (RFC 9636 §3): the 64-bit data block and the footer. The
 * version 1 block is skipped; a version 1 file is rejected. Transition times
 * are read as two 32-bit halves into a double, without BigInt.
 * Implements FR7 of add-zone-rules-from-iana (design D7).
 */
import type { LocalTimeType } from "../../src/lib/zoneRules/core/index.ts";

export type TzifZone = {
  types: LocalTimeType[];
  /** `[epochSeconds, typeIndex]`, ascending. */
  transitions: [epochSeconds: number, typeIndex: number][];
  footer: string;
};

type TzifCounts = {
  leapSecondCount: number;
  standardIndicatorCount: number;
  universalIndicatorCount: number;
  transitionCount: number;
  typeCount: number;
  designationByteCount: number;
};

const MAGIC = "TZif";
const MAGIC_LENGTH = 4;
const VERSION_OFFSET = 4;
const FIRST_SUPPORTED_VERSION = "2".charCodeAt(0);
const HEADER_LENGTH = 44;
const COUNTS_OFFSET = 20;
const COUNT_FIELD_LENGTH = 4;
const TWO_POW_32 = 2 ** 32;
const TRANSITION_TIME_LENGTH = { versionOne: 4, versionTwo: 8 } as const;
const LEAP_SECOND_LENGTH = { versionOne: 8, versionTwo: 12 } as const;
const TYPE_ENTRY_LENGTH = 6;
const TYPE_DAYLIGHT_FLAG_OFFSET = 4;
const TYPE_DESIGNATION_INDEX_OFFSET = 5;
const FOOTER_DELIMITER = "\n";
const NUL = 0;

function failTruncated(): never {
  throw new Error("The TZif file ends before its data does");
}

function readCounts(view: DataView, headerOffset: number): TzifCounts {
  if (headerOffset + HEADER_LENGTH > view.byteLength) failTruncated();
  const readCount = (position: number) =>
    view.getUint32(
      headerOffset + COUNTS_OFFSET + position * COUNT_FIELD_LENGTH,
    );
  return {
    universalIndicatorCount: readCount(0),
    standardIndicatorCount: readCount(1),
    leapSecondCount: readCount(2),
    transitionCount: readCount(3),
    typeCount: readCount(4),
    designationByteCount: readCount(5),
  };
}

function getBlockLength(
  counts: TzifCounts,
  timeLength: number,
  leapLength: number,
): number {
  return (
    counts.transitionCount * (timeLength + 1) +
    counts.typeCount * TYPE_ENTRY_LENGTH +
    counts.designationByteCount +
    counts.leapSecondCount * leapLength +
    counts.standardIndicatorCount +
    counts.universalIndicatorCount
  );
}

function readDesignation(bytes: Uint8Array, start: number): string {
  let end = start;
  while (end < bytes.length && bytes[end] !== NUL) end++;
  return new TextDecoder().decode(bytes.subarray(start, end));
}

function readSixtyFourBitBlock(
  bytes: Uint8Array,
  view: DataView,
  blockOffset: number,
  counts: TzifCounts,
): Pick<TzifZone, "types" | "transitions"> {
  const typesOffset =
    blockOffset +
    counts.transitionCount * (TRANSITION_TIME_LENGTH.versionTwo + 1);
  const designationsOffset = typesOffset + counts.typeCount * TYPE_ENTRY_LENGTH;
  const designationBytes = bytes.subarray(
    designationsOffset,
    designationsOffset + counts.designationByteCount,
  );
  const typeIndicesOffset =
    blockOffset + counts.transitionCount * TRANSITION_TIME_LENGTH.versionTwo;
  const transitions: TzifZone["transitions"] = [];
  for (let index = 0; index < counts.transitionCount; index++) {
    const timeOffset = blockOffset + index * TRANSITION_TIME_LENGTH.versionTwo;
    const epochSeconds =
      view.getInt32(timeOffset) * TWO_POW_32 + view.getUint32(timeOffset + 4);
    transitions.push([
      epochSeconds,
      bytes[typeIndicesOffset + index] as number,
    ]);
  }
  const types: LocalTimeType[] = [];
  for (let index = 0; index < counts.typeCount; index++) {
    const entryOffset = typesOffset + index * TYPE_ENTRY_LENGTH;
    types.push({
      utcOffsetSeconds: view.getInt32(entryOffset),
      isDaylightSavingTime:
        bytes[entryOffset + TYPE_DAYLIGHT_FLAG_OFFSET] !== NUL,
      designation: readDesignation(
        designationBytes,
        bytes[entryOffset + TYPE_DESIGNATION_INDEX_OFFSET] as number,
      ),
    });
  }
  return { types, transitions };
}

function readFooter(bytes: Uint8Array, footerOffset: number): string {
  const footerText = new TextDecoder().decode(bytes.subarray(footerOffset));
  if (!footerText.startsWith(FOOTER_DELIMITER)) failTruncated();
  return footerText.slice(1).split(FOOTER_DELIMITER)[0] as string;
}

export function readTzif(bytes: Uint8Array): TzifZone {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = new TextDecoder().decode(bytes.subarray(0, MAGIC_LENGTH));
  if (magic !== MAGIC) throw new Error(`Not a TZif file: no ${MAGIC} magic`);
  if ((bytes[VERSION_OFFSET] as number) < FIRST_SUPPORTED_VERSION) {
    throw new Error("A TZif version 1 file has no 64-bit data");
  }
  const versionOneCounts = readCounts(view, 0);
  const secondHeaderOffset =
    HEADER_LENGTH +
    getBlockLength(
      versionOneCounts,
      TRANSITION_TIME_LENGTH.versionOne,
      LEAP_SECOND_LENGTH.versionOne,
    );
  const counts = readCounts(view, secondHeaderOffset);
  const blockOffset = secondHeaderOffset + HEADER_LENGTH;
  const footerOffset =
    blockOffset +
    getBlockLength(
      counts,
      TRANSITION_TIME_LENGTH.versionTwo,
      LEAP_SECOND_LENGTH.versionTwo,
    );
  if (footerOffset > bytes.length) failTruncated();
  return {
    ...readSixtyFourBitBlock(bytes, view, blockOffset, counts),
    footer: readFooter(bytes, footerOffset),
  };
}
