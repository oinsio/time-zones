/**
 * Vite plugin serving the CLDR-derived zone data as virtual modules.
 * Implements FR2, FR9, FR16 of add-locations-via-search (D6, D8).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Plugin } from "vite";
import { extractZoneData, type ZoneData } from "./extractZoneData.ts";

const ALIASES_MODULE_ID = "virtual:time-zone-aliases";
const CITIES_URL_MODULE_ID = "virtual:zone-cities-url";
const CITIES_MODULE_ID = "virtual:zone-cities";
const RESOLVED_ID_PREFIX = "\0";
const TEST_MODE = "test";
const ZONE_CITIES_ASSET_NAME = "city-search.json";
const ZONE_CITIES_DEV_FILE_NAME = "city-search.json";
const BCP47_TIME_ZONE_FILE = "cldr-bcp47/bcp47/timezone.json";
const ENGLISH_ZONE_NAMES_FILE = "cldr-dates-full/main/en/timeZoneNames.json";
const RUSSIAN_ZONE_NAMES_FILE = "cldr-dates-full/main/ru/timeZoneNames.json";
const JSON_CONTENT_TYPE = "application/json";
const CONTENT_TYPE_HEADER = "Content-Type";

const nodeRequire = createRequire(import.meta.url);
let cachedZoneData: ZoneData | undefined;

function readJson(specifier: string): unknown {
  return JSON.parse(readFileSync(nodeRequire.resolve(specifier), "utf8"));
}

function loadZoneData(): ZoneData {
  cachedZoneData ??= extractZoneData({
    bcp47TimeZones: readJson(BCP47_TIME_ZONE_FILE),
    englishZoneNames: readJson(ENGLISH_ZONE_NAMES_FILE),
    russianZoneNames: readJson(RUSSIAN_ZONE_NAMES_FILE),
  });
  return cachedZoneData;
}

export function zoneDataPlugin(): Plugin {
  let isBuild = false;
  let isTestMode = false;
  let base = "/";
  return {
    name: "time-zones-zone-data",
    configResolved(config) {
      isBuild = config.command === "build";
      isTestMode = config.mode === TEST_MODE;
      base = config.base;
    },
    configureServer(server) {
      const devPath = `${base}${ZONE_CITIES_DEV_FILE_NAME}`;
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== devPath) return next();
        response.setHeader(CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE);
        response.end(JSON.stringify(loadZoneData().zoneCities));
      });
    },
    resolveId(source) {
      const isServed =
        source === ALIASES_MODULE_ID ||
        source === CITIES_URL_MODULE_ID ||
        (source === CITIES_MODULE_ID && isTestMode);
      return isServed ? `${RESOLVED_ID_PREFIX}${source}` : undefined;
    },
    load(resolvedId) {
      if (resolvedId === `${RESOLVED_ID_PREFIX}${ALIASES_MODULE_ID}`) {
        return `export default ${JSON.stringify(loadZoneData().timeZoneAliases)};`;
      }
      if (resolvedId === `${RESOLVED_ID_PREFIX}${CITIES_MODULE_ID}`) {
        return `export default ${JSON.stringify(loadZoneData().zoneCities)};`;
      }
      if (resolvedId === `${RESOLVED_ID_PREFIX}${CITIES_URL_MODULE_ID}`) {
        if (!isBuild) {
          return `export default ${JSON.stringify(`${base}${ZONE_CITIES_DEV_FILE_NAME}`)};`;
        }
        const referenceId = this.emitFile({
          type: "asset",
          name: ZONE_CITIES_ASSET_NAME,
          source: JSON.stringify(loadZoneData().zoneCities),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
      return undefined;
    },
  };
}
