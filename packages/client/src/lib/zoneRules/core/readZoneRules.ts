/**
 * Reads the rules of one zone from the release document (design D1).
 * Implements FR2 of add-zone-rules-from-iana.
 */
import { parseFutureRule } from "./futureRule.ts";
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "./zoneRulesConstants.ts";
import type {
  ListedClockChange,
  LocalTimeType,
  ZoneRules,
} from "./zoneRulesRelease.ts";
import {
  createShapeError as shapeError,
  ZoneRulesReleaseError,
  ZoneRulesReleaseErrorCode,
} from "./zoneRulesReleaseError.ts";

type JsonObject = Record<string, unknown>;

const TYPE_FIELD_COUNT = 3;
const CHANGE_FIELD_COUNT = 2;
const DAYLIGHT_SAVING_FLAG = 1;

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

export function readZoneRules(
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
  const futureRule = parseFutureRule(rawZone.futureRule);
  if (rawZone.futureRule !== "" && !futureRule) {
    return shapeError(`the future rule of ${zoneId}`);
  }
  return { types, cutoffType, changes, futureRule };
}
