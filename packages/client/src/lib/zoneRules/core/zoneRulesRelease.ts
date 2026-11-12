/**
 * The zone rules release: its types and the reader of its JSON document
 * (design D1). Links share their target's `ZoneRules` object under their own
 * name. The reader returns a typed error instead of throwing.
 * Implements FR2 of add-zone-rules-from-iana.
 */
import { type FutureRule, parseFutureRule } from "./futureRule.ts";
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "./zoneRulesConstants.ts";

export type LocalTimeType = {
  utcOffsetSeconds: number;
  designation: string;
  isDaylightSavingTime: boolean;
};

export type ListedClockChange = {
  epochSeconds: number;
  localTimeType: LocalTimeType;
};

/** The rules of one zone. */
export type ZoneRules = {
  types: LocalTimeType[];
  cutoffType: LocalTimeType;
  changes: ListedClockChange[];
  futureRule: FutureRule | undefined;
};

export type ZoneRulesRelease = {
  release: string;
  zones: ReadonlyMap<string, ZoneRules>;
};

export const ZoneRulesReleaseErrorCode = {
  INVALID_SHAPE: "INVALID_SHAPE",
  UNKNOWN_LINK_TARGET: "UNKNOWN_LINK_TARGET",
  CUTOFF_MISMATCH: "CUTOFF_MISMATCH",
  CHANGES_NOT_ASCENDING: "CHANGES_NOT_ASCENDING",
  TYPE_INDEX_OUT_OF_RANGE: "TYPE_INDEX_OUT_OF_RANGE",
} as const;
export type ZoneRulesReleaseErrorCode =
  (typeof ZoneRulesReleaseErrorCode)[keyof typeof ZoneRulesReleaseErrorCode];

export class ZoneRulesReleaseError extends Error {
  readonly code: ZoneRulesReleaseErrorCode;

  constructor(code: ZoneRulesReleaseErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

type JsonObject = Record<string, unknown>;

const TYPE_FIELD_COUNT = 3;
const CHANGE_FIELD_COUNT = 2;
const DAYLIGHT_SAVING_FLAG = 1;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shapeError(subject: string): ZoneRulesReleaseError {
  return new ZoneRulesReleaseError(
    ZoneRulesReleaseErrorCode.INVALID_SHAPE,
    `Invalid zone rules release: ${subject}`,
  );
}

function readType(
  rawType: unknown,
  zoneId: string,
): LocalTimeType | ZoneRulesReleaseError {
  if (
    !Array.isArray(rawType) ||
    rawType.length !== TYPE_FIELD_COUNT ||
    typeof rawType[0] !== "number" ||
    typeof rawType[1] !== "string"
  ) {
    return shapeError(`a local time type of ${zoneId}`);
  }
  return {
    utcOffsetSeconds: rawType[0],
    designation: rawType[1],
    isDaylightSavingTime: rawType[2] === DAYLIGHT_SAVING_FLAG,
  };
}

function readTypes(
  rawTypes: unknown,
  zoneId: string,
): LocalTimeType[] | ZoneRulesReleaseError {
  if (!Array.isArray(rawTypes)) return shapeError(`the types of ${zoneId}`);
  const types: LocalTimeType[] = [];
  for (const rawType of rawTypes) {
    const type = readType(rawType, zoneId);
    if (type instanceof ZoneRulesReleaseError) return type;
    types.push(type);
  }
  return types;
}

function readChanges(
  rawChanges: unknown,
  types: LocalTimeType[],
  zoneId: string,
): ListedClockChange[] | ZoneRulesReleaseError {
  if (!Array.isArray(rawChanges)) return shapeError(`the changes of ${zoneId}`);
  const changes: ListedClockChange[] = [];
  let previousSeconds = 0;
  for (const rawChange of rawChanges) {
    if (
      !Array.isArray(rawChange) ||
      rawChange.length !== CHANGE_FIELD_COUNT ||
      typeof rawChange[0] !== "number" ||
      typeof rawChange[1] !== "number"
    ) {
      return shapeError(`a clock change of ${zoneId}`);
    }
    const [secondsSinceCutoff, typeIndex] = rawChange;
    if (secondsSinceCutoff <= previousSeconds) {
      return new ZoneRulesReleaseError(
        ZoneRulesReleaseErrorCode.CHANGES_NOT_ASCENDING,
        `The changes of ${zoneId} do not ascend after the cutoff`,
      );
    }
    previousSeconds = secondsSinceCutoff;
    const localTimeType = types[typeIndex];
    if (!localTimeType) return typeIndexError(zoneId);
    changes.push({
      epochSeconds: ZONE_RULES_CUTOFF_EPOCH_SECONDS + secondsSinceCutoff,
      localTimeType,
    });
  }
  return changes;
}

function typeIndexError(zoneId: string): ZoneRulesReleaseError {
  return new ZoneRulesReleaseError(
    ZoneRulesReleaseErrorCode.TYPE_INDEX_OUT_OF_RANGE,
    `A type index of ${zoneId} is out of range`,
  );
}

function readZoneRules(
  rawZone: JsonObject,
  zoneId: string,
): ZoneRules | ZoneRulesReleaseError {
  const types = readTypes(rawZone.types, zoneId);
  if (types instanceof ZoneRulesReleaseError) return types;
  const changes = readChanges(rawZone.changes, types, zoneId);
  if (changes instanceof ZoneRulesReleaseError) return changes;
  const cutoffType =
    typeof rawZone.cutoffType === "number"
      ? types[rawZone.cutoffType]
      : undefined;
  if (!cutoffType) return typeIndexError(zoneId);
  if (typeof rawZone.futureRule !== "string") {
    return shapeError(`the future rule of ${zoneId}`);
  }
  const futureRule =
    rawZone.futureRule === "" ? undefined : parseFutureRule(rawZone.futureRule);
  if (rawZone.futureRule !== "" && !futureRule) {
    return shapeError(`the future rule of ${zoneId}`);
  }
  return { types, cutoffType, changes, futureRule };
}

function readZones(
  rawZones: JsonObject,
): Map<string, ZoneRules> | ZoneRulesReleaseError {
  const zones = new Map<string, ZoneRules>();
  const targets = new Map<string, ZoneRules>();
  const links: [string, string][] = [];
  for (const [zoneId, rawZone] of Object.entries(rawZones)) {
    if (typeof rawZone === "string") {
      links.push([zoneId, rawZone]);
    } else if (isObject(rawZone)) {
      const zoneRules = readZoneRules(rawZone, zoneId);
      if (zoneRules instanceof ZoneRulesReleaseError) return zoneRules;
      zones.set(zoneId, zoneRules);
      targets.set(zoneId, zoneRules);
    } else {
      return shapeError(`the entry of ${zoneId}`);
    }
  }
  for (const [linkId, targetId] of links) {
    const target = targets.get(targetId);
    if (!target) {
      return new ZoneRulesReleaseError(
        ZoneRulesReleaseErrorCode.UNKNOWN_LINK_TARGET,
        `${linkId} links to ${targetId}, which the release does not hold`,
      );
    }
    zones.set(linkId, target);
  }
  return zones;
}

/** Reads the release document, or returns the typed error of its first defect. */
export function parseZoneRulesRelease(
  document: unknown,
): ZoneRulesRelease | ZoneRulesReleaseError {
  if (
    !isObject(document) ||
    typeof document.release !== "string" ||
    typeof document.cutoff !== "number" ||
    !isObject(document.zones)
  ) {
    return shapeError("the document");
  }
  if (document.cutoff !== ZONE_RULES_CUTOFF_EPOCH_SECONDS) {
    return new ZoneRulesReleaseError(
      ZoneRulesReleaseErrorCode.CUTOFF_MISMATCH,
      `The cutoff ${document.cutoff} is not ${ZONE_RULES_CUTOFF_EPOCH_SECONDS}`,
    );
  }
  const zones = readZones(document.zones);
  return zones instanceof ZoneRulesReleaseError
    ? zones
    : { release: document.release, zones };
}
