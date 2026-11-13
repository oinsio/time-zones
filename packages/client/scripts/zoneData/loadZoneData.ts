/**
 * Reads the CLDR files from node_modules and extracts the zone data once.
 * Implements FR2, FR9 of add-locations-via-search (D6); shared with the city
 * data compiler by add-geonames-city-source (D3).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { extractZoneData, type ZoneData } from "./extractZoneData.ts";

const BCP47_TIME_ZONE_FILE = "cldr-bcp47/bcp47/timezone.json";
const ENGLISH_ZONE_NAMES_FILE = "cldr-dates-full/main/en/timeZoneNames.json";
const RUSSIAN_ZONE_NAMES_FILE = "cldr-dates-full/main/ru/timeZoneNames.json";

const nodeRequire = createRequire(import.meta.url);
let cachedZoneData: ZoneData | undefined;

function readJson(specifier: string): unknown {
  return JSON.parse(readFileSync(nodeRequire.resolve(specifier), "utf8"));
}

export function loadZoneData(): ZoneData {
  cachedZoneData ??= extractZoneData({
    bcp47TimeZones: readJson(BCP47_TIME_ZONE_FILE),
    englishZoneNames: readJson(ENGLISH_ZONE_NAMES_FILE),
    russianZoneNames: readJson(RUSSIAN_ZONE_NAMES_FILE),
  });
  return cachedZoneData;
}
