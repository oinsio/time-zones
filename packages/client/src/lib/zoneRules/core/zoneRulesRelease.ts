/**
 * The zone rules release: its types and the reader of its JSON document
 * (design D1). Links share their target's `ZoneRules` object under their own
 * name. The reader returns a typed error instead of throwing.
 * Implements FR2 of add-zone-rules-from-iana.
 */
import type { FutureRule } from "./futureRule.ts";
import { readZoneRules } from "./readZoneRules.ts";
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "./zoneRulesConstants.ts";
import {
  createShapeError,
  ZoneRulesReleaseError,
  ZoneRulesReleaseErrorCode,
} from "./zoneRulesReleaseError.ts";

export {
  ZoneRulesReleaseError,
  ZoneRulesReleaseErrorCode,
} from "./zoneRulesReleaseError.ts";

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

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
      return createShapeError(`the entry of ${zoneId}`);
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
    return createShapeError("the document");
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
